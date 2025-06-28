import { defineStore } from 'pinia'

export interface RequestLog {
    type: 'request' | 'success' | 'error'
    method: string
    url: string
    status?: number
    code?: string | number
    message?: string
    traceId?: string
    params?: any
    data?: any
    timestamp: number
}

const logStore = defineStore('request-logs', {
    state: () => ({
        logs: [] as RequestLog[],
        maxLogs: 200 // 最大日志条数
    }),
    actions: {
        add(log: RequestLog) {
            // 生产环境过滤敏感信息
            if (import.meta.env.PROD) {
                log = this.sanitizeLog(log)
            }
            
            this.logs.push(log)
            
            // 限制日志数量
            if (this.logs.length > this.maxLogs) {
                this.logs.shift()
            }
            
            // 开发环境输出到控制台
            if (import.meta.env.DEV) {
                this.printToConsole(log)
            }
            
            // 错误日志自动上报
            if (log.type === 'error') {
                this.reportError(log).then()
            }
        },
        
        sanitizeLog(log: RequestLog): RequestLog {
            // 过滤敏感信息（示例）
            const sensitiveKeys = ['password', 'token']
            return {
                ...log,
                params: this.filterSensitiveData(log.params, sensitiveKeys),
                data: this.filterSensitiveData(log.data, sensitiveKeys)
            }
        },
        
        filterSensitiveData(obj: any, keys: string[]): any {
            // 实现数据过滤逻辑...
        },
        
        printToConsole(log: RequestLog) {
            const styles = {
                request: 'color: #909399;',
                success: 'color: #67c23a;',
                error: 'color: #f56c6c;'
            }
            console.log(
                `%c[${log.type.toUpperCase()}] ${log.method} ${log.url}`,
                styles[log.type],
                log
            )
        },
        
        async reportError(log: RequestLog) {
            // 实现错误上报逻辑...
        },
        
        clear() {
            this.logs = []
        }
    }
})

export default logStore
