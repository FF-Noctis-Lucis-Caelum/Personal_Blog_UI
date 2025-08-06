/**
 * 生成唯一操作ID（改进版）
 * 使用时间戳 + 随机数组合，并通过Base64编码确保唯一性和简洁性
 * 避免使用已弃用的substr方法，改用slice
 */
export const generateOperationId = () => {
    // 1. 获取当前时间戳的Base36表示（更短的字符串）
    const timestamp = Date.now().toString(36)

    // 2. 生成随机数并转换为Base36，取后6位（使用slice替代substr）
    const random = Math.random().toString(36).slice(2, 8)

    // 3. 组合并添加随机字符确保唯一性（应对极高并发场景）
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const randomChar = chars.charAt(Math.floor(Math.random() * chars.length))

    return `${timestamp}-${random}${randomChar}`
}
