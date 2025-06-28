import request, { ResponseData } from "@/api/request";

export enum UploadStrategy {
    Image = 'IMAGE', // 图片
    Video = 'VIDEO', // 视频
    Audio = 'AUDIO', // 音频
    Document = 'DOCUMENT', // 文档
    Other = 'OTHER' // 其他
}

/* 通用文件上传接口（需要携带上传策略） */
export function uploadFile(
    file: File,
    strategy: UploadStrategy = UploadStrategy.Image,
) {
    const formData = new FormData();
    formData.append("file", file); // 确保字段名称与后端接收参数一致
    
    return request.post<ResponseData<string>>(`/api/auth/upload?strategy=${strategy}`, formData , {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
}
