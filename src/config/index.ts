/**
 * 基础配置类
 */

export const CommonConfig = {
    Auth: 'SaToken', // 请求头token名称
    //dev: 'http://192.168.214.184:3320',
    dev: 'http://127.0.0.1:3320', // 开发环境
    pro: 'http://127.0.0.1:3315', // 生产环境
    ai: 'http://127.0.0.1:3315', // AI接口
    gateway: 'http://127.0.0.1:9090', // 网关端口
    ContentType: 'application/json;charset=utf-8', // 请求头类型
}
