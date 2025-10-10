export function formatTime (timestamp: number): string {
    if (!timestamp) return '';

    const date = new Date(timestamp);

    // 使用字符串补零函数
    const padStart = (num: number) => String(num).padStart(2, '0');

    return `${date.getFullYear()}-${padStart(date.getMonth() + 1)}-${padStart(date.getDate())} ` +
        `${padStart(date.getHours())}:${padStart(date.getMinutes())}:${padStart(date.getSeconds())}`;
}

// 递归处理对象函数
export function formatTimestamps (obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(item => formatTimestamps(item));
    }

    if (typeof obj === 'object' && obj !== null) {
        return Object.keys(obj).reduce((acc: { [key: string]: any }, key) => {
            // 处理 createTime 字段
            if (key === 'createTime') {
                acc[key] = formatTime(obj[key]);
            } else {
                // 递归处理嵌套对象
                acc[key] = formatTimestamps(obj[key]);
            }
            return acc;
        }, {});
    }

    return obj;
}

/**
 * 按起始/结束标记分割字符串为两部分
 * @param str 原始字符串
 * @param startStr 起始标记（需完全匹配）
 * @param endStr 结束标记（需完全匹配）
 * @returns {Object} 包含 str1（含起止标记的子串）和 str2（剩余部分）的对象
 */
export function splitByMarkers(str: string, startStr: string, endStr: string): { think: string; answer: string } {

    const startLen = startStr.length;
    const endLen = endStr.length;

    // 查找起始标记的位置
    const startIndex = str.indexOf(startStr);
    if (startIndex === -1) {
        // 未找到起始标记：str1为空，str2为原字符串
        return { think: '', answer: str };
    }

    // 从起始标记结束的位置开始查找结束标记（避免匹配起始标记之前的endStr）
    const searchStart = startIndex + startLen;
    const endIndex = str.indexOf(endStr, searchStart);

    if (endIndex === -1) {
        // 找到起始标记但未找到结束标记：str1为起始标记到末尾，str2为起始标记之前的部分
        const think = str.slice(startIndex);
        const answer = str.slice(0, startIndex);
        return { think, answer };
    }

    // 找到完整的起止标记：str1为包含起止标记的子串，str2为前后剩余部分拼接
    const think = str.slice(startIndex, endIndex + endLen);
    const prefix = str.slice(0, startIndex);
    const suffix = str.slice(endIndex + endLen);
    const answer = prefix + suffix;

    return { think, answer };
}

/**
 * 文本格式化函数（适配Arco Design Typography）
 * @param rawText 原始文本内容
 * @returns 格式化后的HTML字符串
 */
export function formatText(rawText: string): string {
    let formatted = rawText.trim();

    // 1. 处理加粗（**包裹内容）
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 2. 处理有序列表（1. 2. 3. 格式）
    formatted = formatted.replace(/^\s*(\d+)\.\s*/gm, (match, p1) => `<li>${p1}. `);
    // 处理无序列表（- * + 格式）
    formatted = formatted.replace(/^\s*([-*+])\s*/gm, '<li>');

    // 3. 处理段落（连续换行转为p标签，单换行转为br）
    formatted = formatted
        .replace(/\n{2,}/g, '</li></ul><p>') // 段落分隔
        .replace(/\n/g, '<br>')          // 单换行转为br
        .replace(/<p><br>/g, '<p>');      // 修复段落开头br

    // 4. 包裹列表标签（检测li标签存在时添加ul/ol）
    if (formatted.includes('<li>')) {
        formatted = formatted.replace(/(<li>)/g, (match) => {
            const isOrdered = /^\d+\./.test(match);
            return isOrdered ? `<ol>${match}` : `<ul>${match}`;
        }) + ('</ol>');
    }

    // 5. 处理首尾标签不匹配问题
    formatted = formatted
        .replace(/^<(ul|ol)>/, '')         // 去除开头多余列表标签
        .replace(/<\/(ul|ol)>$/, '');      // 去除结尾多余列表标签

    // 6. 清理多余空格和标签
    formatted = formatted
        .replace(/\s+<br>/g, '<br>')       // 清理br前空格
        .replace(/<br>\s+/g, '<br>')       // 清理br后空格
        .replace(/&nbsp;/g, ' ');           // 替换非断空格

    // 7. 统一使用双引号包裹标签属性（Arco组件要求）
    formatted = formatted.replace(/'/g, '"');

    return formatted;
}


export function cleanJsonString(jsonStringWithMarkdown: string) {
    // 移除开头的 ```json 和结尾的 ```
    return jsonStringWithMarkdown
        // 清除标题
        .replace(/^#+\s+/gm, '')
        // 清除代码块
        .replace(/```[\s\S]*?```/g, '')
        // 清除行内代码
        .replace(/`[^`]*`/g, '')
        // 清除链接和图片
        .replace(/!?$(.*?)$$.*?$/g, '$1')
        // 清除粗体和斜体
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/([*_])(.*?)\1/g, '$2');              // 去除首尾空格
}
