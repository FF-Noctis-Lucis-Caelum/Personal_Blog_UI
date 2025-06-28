import { inflate } from 'pako';
import { ResponseData } from '@/api/request'

// 后端协商一致的AES密钥（需与后端完全一致）
const AES_KEY_STRING = 'd90DjGkZD9rzbCnU';

// 将Base64URL转换为标准Base64
function base64UrlToBase64(base64Url: string) {
    return base64Url
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(base64Url.length + ((4 - (base64Url.length % 4)) % 4), '=');
}

// 核心解密方法
export async function decrypt(encryptedData: string): Promise<ResponseData> {
    try {
        // 1. Base64 URL解码
        const decodedData = Uint8Array.from(
          atob(base64UrlToBase64(encryptedData)),
          c => c.charCodeAt(0)
        );
        
        // 2. 分离IV和密文
        const iv = decodedData.slice(0, 16);
        const ciphertext = decodedData.slice(16);
        
        // 3. 准备Web Crypto API
        const key = await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(AES_KEY_STRING),
          { name: 'AES-CTR' },
          false,
          ['decrypt']
        );
        
        // 4. 使用AES-CTR解密
        const decrypted = await crypto.subtle.decrypt(
          {
              name: 'AES-CTR',
              counter: iv,
              length: 64 // CTR计数器位数（需与后端一致）
          },
          key,
          ciphertext
        );
        
        // 5. 解压缩（使用pako处理nowrap格式）
        const decompressed = inflate(new Uint8Array(decrypted), {
            to: 'string',
            windowBits: -15 // 对应nowrap模式
        });
        
        // 6. 解析JSON
        return {
            code: 200,
            msg: "解密成功",
            data: JSON.parse(decompressed)
        }
    } catch (err) {
        return {
            code: 500,
            msg: '数据解密失败',
            data: null
        };
    }
}
