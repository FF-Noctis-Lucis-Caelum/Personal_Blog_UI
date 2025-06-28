import logStore from '@/store/logStore'
import { ComponentPublicInstance } from 'vue'
import { Message } from '@arco-design/web-vue'

// 全局错误处理器
class GlobalErrorHandler {
    constructor() {
        this.initHandlers()
    }
    
    private initHandlers() {
        
        // 未捕获的Promise异常
        window.addEventListener('unhandledrejection', event => {
            this.handlePromiseRejection(event)
            event.preventDefault()
        })
        
        // 常规JS错误
        window.addEventListener('error', event => {
            this.handleWindowError(event)
            event.preventDefault()
        })
    }
    
    private handleVueError(
        err: unknown,
        vm: ComponentPublicInstance | null,
        info: string
    ) {
        const errorLog = {
            type: 'vue_error',
            message: (err as Error)?.message || String(err),
            component: vm?.$options.name,
            stack: (err as Error)?.stack,
            info: info,
            timestamp: Date.now()
        }
        
        logStore.apply(errorLog)
        this.showErrorToast(errorLog.message)
    }
    
    private handlePromiseRejection(event: PromiseRejectionEvent) {
        const error = event.reason
        const errorLog = {
            type: 'promise_error',
            message: error?.message || 'Unhandled Promise Rejection',
            stack: error?.stack,
            timestamp: Date.now()
        }
        
        logStore.apply(errorLog)
        this.showErrorToast(errorLog.message)
    }
    
    private handleWindowError(event: ErrorEvent) {
        const errorLog = {
            type: 'window_error',
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack,
            timestamp: Date.now()
        }
        
        logStore.apply(errorLog)
        this.showErrorToast(errorLog.message)
    }
    
    private showErrorToast(message: string) {
        Message.error({
            content: `程序异常: ${message}`,
            duration: 5000,
            closable: true
        })
    }
}

// 初始化错误处理器
export const initGlobalErrorHandler = () => {
    new GlobalErrorHandler()
}
