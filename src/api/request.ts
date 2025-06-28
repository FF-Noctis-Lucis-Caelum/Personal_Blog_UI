/**
 * @description: 封装 axios 请求
 * @author: FinalFantasy
 * @date: 2025-03-09 17:22:31
 */
import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import { Message, Modal } from '@arco-design/web-vue'
import { CommonConfig } from '@/config'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/store'
import qs from 'qs'
// 扩展全局类型
declare global {
    interface Window {
        __APP_CONFIG__: {
            baseURL: string
        }
    }
    namespace Axios {
        interface AxiosRequestConfig {
            /** 请求元数据（自定义扩展） */
            metadata?: Record<string, any>
        }
    }
}

// 定义响应数据结构（根据后端约定修改）
export interface ResponseData<T = any> {
    code: number
    data: T
    msg: string
    [key: string]: any
}

// 扩展请求配置（TypeScript 4.1+ 模板字面量类型）
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// 扩展请求配置
interface RequestOptions extends AxiosRequestConfig {
    /** 自定义请求元数据 */
    metadata?: {
        circuitBreakerKey?: string
        [key: string]: any
    }
    /** 是否显示加载动画 */
    loading?: boolean
    /** 是否显示错误提示 */
    showError?: boolean
    /** 自定义错误处理 */
    customError?: (error: any) => void
    /** 自定义重试配置 */
    retry?: {
        attempts?: number       // 最大重试次数
        delay?: number          // 基础延迟时间
        codes?: number[]        // 需要重试的状态码
    }
    /** 重试计数器（新增） */
    __retryCount?: number
}

class Request {
    /* 初始化请求实例 */
    private readonly instance: AxiosInstance
    /* 初始化请求配置 */
    private loadingCount = 0
    /* 是否正在显示加载动画 */
    private loadingInstance: ReturnType<typeof Message.loading> | null = null
    /* 加载动画延迟显示时间 */
    private loadingTimer: ReturnType<typeof setTimeout> | null = null
    /* 加载动画延迟显示时间 */
    private defaultLoadingDelay = 300

    /* 重试相关属性 */
    /* 最大重试次数 */
    private readonly defaultRetryAttempts = 2
    /* 基础延迟时间 */
    private readonly defaultRetryDelay = 1000
    /* 最大并发请求数 */
    private maxConcurrent = 10
    /* 最大并发请求数 */
    private pendingQueue: Array<() => void> = []
    
    /* 上传进度 */
    onUploadProgress: ((progressEvent: ProgressEvent) => void) | undefined

    // 新增保护机制属性
    private activeRequests = new Map<string, AbortController>()
    private circuitBreaker = new Map<
        string,
        {
            failures: number
            lastFailure: number
            isTripped: boolean
        }
    >()

    constructor(config: AxiosRequestConfig) {
        this.instance = axios.create({
            baseURL: this.resolveBaseUrl(config),
            timeout: 15000, // 超时时间
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            // 添加 params 序列化配置
            paramsSerializer: (params) => {
                return qs.stringify(params, {
                    arrayFormat: 'repeat', // 根据后端要求配置
                    skipNulls: true, // 自动跳过 null 值
                    encode: false, // 禁用自动编码（根据后端要求）
                })
            },
            ...config,
        })
        this.initInterceptors()
    }

    // 智能解析基地址
    private resolveBaseUrl(config: AxiosRequestConfig): string {
        // 增加调试日志
        console.debug('[Request] 当前请求配置:', {
            explicitConfig: config?.baseURL,
            envConfig: window.__APP_CONFIG__?.baseURL,
            metaEnv: import.meta.env.VITE_API_BASE_URL,
        })

        // 开发环境强制使用相对路径
        if (import.meta.env.DEV) return ''

        // 优先级 1：显式配置
        if (config?.baseURL) return config.baseURL

        // 优先级 2：环境变量
        try {
            const envBase = window.__APP_CONFIG__.baseURL
            if (envBase) return envBase
        } catch (e) {
            console.warn('环境配置解析失败:', e)
        }

        // 生产环境强制校验
        throw new Error(`
              🚨 生产环境必须配置 API 基地址！
              检查以下位置：
              1. .env.production 文件
              2. 构建命令参数
              3. CI/CD 环境变量
        `)
    }

    private initInterceptors() {
        // 请求拦截器
        this.instance.interceptors.request.use(
            (config) => {
                this.validateConfig(config)
                const loadingConfig = this.normalizeLoadingConfig(config)
                if (loadingConfig.enable) this.startLoading(loadingConfig)

                // 统一使用工具函数获取token
                const token = getToken()
                if (token && !config.headers?.[CommonConfig.Auth]) {
                    config.headers![CommonConfig.Auth] = token // `Bearer ${token}`
                }
                return config
            },
            (error) => {
                this.handleRequestError(error)
                return Promise.reject(error)
            }
        )

        // 响应拦截器
        this.instance.interceptors.response.use(
            (response) => {
                console.debug('API 响应:', {
                    url: response.config.url,
                    status: response.status,
                    data: response.data,
                })

                this.handleResponseSuccess(response)
                return response.data
            },
            (error) => {
                return this.handleResponseError(error)
            }
        )
    }

    private handleRequestError(error: any) {
        const loadingConfig = this.normalizeLoadingConfig(error.config)
        if (loadingConfig.enable) {
            this.loadingCount = 0
            this.endLoading()
        }
    }

    private handleResponseSuccess(response: any) {
        const loadingConfig = this.normalizeLoadingConfig(response.config)
        if (loadingConfig.enable) this.endLoading()

        const res = response.data
        if (res.code !== 200 && res.code !== 20000) {
            this.handleBusinessError(res, response).then()
        }
    }

    private async handleResponseError(error: AxiosError) {
        // 添加类型断言
        const config = error.config as RequestOptions

        // 确保清除加载状态
        if (config) {
            const loadingConfig = this.normalizeLoadingConfig(config)
            if (loadingConfig.enable) this.endLoading()
        }

        // 处理网络错误（包括服务未启动）
        if (!error.response) {
            return this.handleNetworkError(error, config)
        }

        // 优先处理401状态码
        if (error.response?.status === 401) {
            this.handleUnauthorized()
            return Promise.reject(error)
        }

        // 处理业务定义错误码
        const responseData = error.response?.data as ResponseData
        if (responseData?.code) {
            if ([50008, 50012, 50014].includes(responseData.code)) {
                this.showReLoginModal()
            }
        }

        // 默认错误处理
        this.handleDefaultError(config, error)

        // 重试逻辑
        if (config && this.shouldRetry(config, error)) {
            return this.retryRequest(config, error)
        }

        return Promise.reject(error)
    }

    // 新增网络错误处理方法
    private handleNetworkError(error: AxiosError, config?: RequestOptions) {
        console.error('网络连接异常:', error.message)
        this.endLoading()

        // 在浏览器环境且需要显示错误时处理
        if (this.isBrowserEnv() && config?.showError !== false) {
            const errorMessage = this.parseErrorMessage(error)
            Message.error({ content: errorMessage, duration: 5000 })
        }

        return Promise.reject(error)
    }

    private handleBusinessError(res: any, response: any) {
        const errorMessage = res.msg || '业务逻辑错误'

        // 只在浏览器环境显示提示
        if (typeof window !== 'undefined') {
            Message.error({ content: errorMessage, duration: 5000 })
        }

        // 特殊错误码处理
        if ([50008, 50012, 50014].includes(res.code) && response.config.url !== '/api/user/info') {
            this.showReLoginModal()
        }

        const error = new Error(errorMessage)
        ;(error as any).response = response
        return Promise.reject(error)
    }

    private showReLoginModal() {
        // 添加浏览器环境判断
        if (!this.isBrowserEnv()) return

        Modal.error({
            title: '确认登出',
            content: '您的登录状态已失效，请重新登录',
            okText: '重新登录',
            async onOk() {
                const userStore = useUserStore()
                await userStore.logout()
                window.location.reload()
            },
        })
    }

    private handleDefaultError(config: RequestOptions, error: any) {
        // 增加环境判断
        if (typeof window !== 'undefined' && config.showError !== false) {
            const errorMessage = this.parseErrorMessage(error)
            Message.error({ content: errorMessage, duration: 5000 })
        }
    }

    private shouldRetry(config: RequestOptions, error: AxiosError): boolean {
        const retryOptions = config.retry || {}
        const maxRetries = retryOptions.attempts ?? this.defaultRetryAttempts
        const retryCodes = retryOptions.codes ?? [500, 502, 503, 504]

        return (
            (config.__retryCount || 0) < maxRetries &&
            (retryCodes.includes(<number>error.response?.status) || error.code === 'ECONNREFUSED')
        )
    }

    private retryRequest(config: RequestOptions, error: AxiosError) {
        const retryOptions = config.retry || {}
        const retryDelay = retryOptions.delay ?? this.defaultRetryDelay

        // 安全访问重试计数器
        config.__retryCount = (config.__retryCount || 0) + 1

        // 保证数值类型安全
        const delay = Math.min(retryDelay * Math.pow(2, config.__retryCount ?? 0), 30000)

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.instance(config))
            }, delay)
        })
    }

    private isBrowserEnv(): boolean {
        return typeof window !== 'undefined' && typeof document !== 'undefined'
    }

    private parseErrorMessage(error: AxiosError): string {
        // 处理连接拒绝错误
        if (error.code === 'ECONNREFUSED') {
            return '无法连接服务器，请检查服务是否启动'
        }

        const errorMap: Record<number, string> = {
            400: '请求参数错误',
            401: '登录已过期',
            403: '没有操作权限',
            404: '资源不存在',
            500: '服务器错误',
            502: '网关错误',
            503: '服务不可用',
        }

        return (error.response?.data as any)?.msg || errorMap[error.response?.status || 0] || error.message.replace(/^Axios\sError:\s*/, '')
    }

    private handleUnauthorized() {
        localStorage.removeItem('token')
        if (!window.location.pathname.includes('/login')) {
            window.location.replace(`/login?redirect=${encodeURIComponent(location.href)}`)
        }
    }

    private generateRequestKey(config: AxiosRequestConfig): string {
        const { method, url, params, data } = config
        return [method?.toUpperCase(), url, JSON.stringify(params), JSON.stringify(data)].join('|')
    }

    private checkCircuitBreaker(key: string): boolean {
        const record = this.circuitBreaker.get(key)
        if (!record) return false

        if (record.failures >= 3 && Date.now() - record.lastFailure < 30000) {
            if (!record.isTripped) {
                record.isTripped = true
                setTimeout(() => this.circuitBreaker.delete(key), 60000)
            }
            return true
        }
        return false
    }

    private updateCircuitBreaker(key: string, error: AxiosError) {
        const status = error.response?.status
        if (status && status >= 500) {
            const record = this.circuitBreaker.get(key) || {
                failures: 0,
                lastFailure: 0,
                isTripped: false,
            }
            record.failures += 1
            record.lastFailure = Date.now()
            this.circuitBreaker.set(key, record)
        }
    }

    // 配置校验
    private validateConfig(config: AxiosRequestConfig) {
        if (config.baseURL === undefined || config.baseURL === null) {
            console.error('请求配置异常:', config)
            Message.error('系统配置异常，请联系管理员')
            throw new Error('缺失 baseURL 配置')
        }
    }

    private normalizeLoadingConfig(config?: RequestOptions): { enable: boolean; text: string; delay: number } {
        const defaultConfig = {
            enable: true,
            text: '加载中...',
            delay: this.defaultLoadingDelay,
        }

        if (!config || config.loading === undefined) return defaultConfig
        if (!config.loading) return { ...defaultConfig, enable: false }

        return {
            enable: true,
            text: (config.loading as any).text || defaultConfig.text,
            delay: (config.loading as any).delay || defaultConfig.delay,
        }
    }

    private startLoading(config: { text: string; delay: number }) {
        this.loadingCount++

        if (!this.loadingTimer) {
            this.loadingTimer = setTimeout(() => {
                if (this.loadingCount > 0 && !this.loadingInstance) {
                    this.loadingInstance = Message.loading({
                        content: config.text,
                        duration: 0,
                    })
                }
                this.loadingTimer = null
            }, config.delay)
        }
    }

    private endLoading() {
        this.loadingCount = Math.max(0, this.loadingCount - 1)

        if (this.loadingCount === 0) {
            this.loadingCount = 0
            if (this.loadingTimer) {
                clearTimeout(this.loadingTimer)
                this.loadingTimer = null
            }

            if (this.loadingInstance) {
                this.loadingInstance.close()
                this.loadingInstance = null
            }
        }
    }

    private handleError(config: RequestOptions, error: any) {
        // 自定义错误处理
        if (typeof config.customError === 'function') {
            config.customError(error)
            return
        }

        // 默认错误处理
        if (config.showError !== false) {
            let errorMessage = this.parseErrorMessage(error)

            // 优先使用后端返回的错误信息
            if (error?.response?.data?.msg) {
                errorMessage = error.response.data.msg
            }

            Message.error({ content: errorMessage, duration: 3000 })
            // 401 处理
            if (error?.response?.status === 401) {
                this.handleUnauthorized()
            }
        }
    }

    public request<T = any>(config: RequestOptions): Promise<T> {
        const controller = new AbortController()
        const requestKey = this.generateRequestKey(config)

        if (this.checkCircuitBreaker(requestKey)) {
            return Promise.reject(new Error('服务暂时不可用，请稍后重试'))
        }

        // 防重控制
        if (this.activeRequests.has(requestKey)) {
            this.activeRequests.get(requestKey)?.abort()
        }
        this.activeRequests.set(requestKey, controller)

        const newConfig = {
            ...config,
            signal: controller.signal,
            metadata: { requestKey, startTime: Date.now() },
        }

        return new Promise((resolve, reject) => {
            // 并发控制
            const processRequest = () => {
                ;(this.instance(newConfig) as Promise<T>)
                    .then(resolve)
                    .catch((error) => {
                        this.updateCircuitBreaker(requestKey, error)
                        reject(error)
                    })
                    .finally(() => {
                        this.activeRequests.delete(requestKey)
                        this.processQueue()
                    })
            }

            if (this.activeRequests.size < this.maxConcurrent) {
                processRequest()
            } else {
                this.pendingQueue.push(processRequest)
            }
        })
    }

    private processQueue() {
        if (this.pendingQueue.length > 0 && this.activeRequests.size < this.maxConcurrent) {
            const nextRequest = this.pendingQueue.shift()
            nextRequest?.()
        }
    }

    // GET 请求
    public get<T = any>(url: string, params?: any, config?: RequestOptions): Promise<T> {
        return this.request({ url, params, method: 'GET', ...config })
    }

    // POST 请求
    public post<T = any>(
        url: string,
        data?: any,
        config?: RequestOptions
    ): Promise<T> {
        return this.request({ url, data, method: 'POST', ...config })
    }

    // PUT 请求
    public put<T = any>(url: string, data?: any, config?: RequestOptions): Promise<T> {
        return this.request({ url, data, method: 'PUT', ...config })
    }

    // DELETE 请求
    public delete<T = any>(url: string, data?: any, config?: RequestOptions): Promise<T> {
        return this.request({ url, data, method: 'DELETE', ...config })
    }
}

// 创建请求实例
const request = new Request({
    baseURL: '',
    timeout: 15000,
})

export default request
