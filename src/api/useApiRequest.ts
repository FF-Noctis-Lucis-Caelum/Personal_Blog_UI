import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { Message, Modal } from '@arco-design/web-vue';
import { CommonConfig } from '@/config';
import { getToken } from '@/utils/auth';
import { useUserStore } from '@/store';
import qs from 'qs';

// ============================ 类型定义（融合A/B优势）============================
// 扩展全局类型（保留B项目原有）
declare global {
    interface Window {
        __APP_CONFIG__: { baseURL: string };
    }
    namespace Axios {
        interface AxiosRequestConfig {
            metadata?: Record<string, any>;
        }
    }
}

// B项目原有响应结构（保持兼容）
export interface ResponseData<T = any> {
    code: number;
    data: T;
    msg: string;
    [key: string]: any;
}

// 扩展请求配置（新增A项目的灵活配置项）
export interface RequestOptions extends AxiosRequestConfig {
    // B项目原有配置
    metadata?: { circuitBreakerKey?: string; [key: string]: any };
    loading?: boolean | { text?: string; delay?: number };
    showError?: boolean;
    customError?: (error: AxiosError<ResponseData>) => void;
    retry?: { attempts?: number; delay?: number; codes?: number[] };
    __retryCount?: number;

    // A项目核心灵活配置（新增）
    /** 是否立即执行请求（默认true，false时返回手动执行方法） */
    immediate?: boolean;
    /** 自定义请求拦截器（临时生效，请求结束后移除） */
    beforeRequest?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
    /** 自定义响应拦截器（临时生效，请求结束后移除） */
    afterResponse?: (response: AxiosResponse<ResponseData>) => AxiosResponse<ResponseData> | Promise<AxiosResponse<ResponseData>>;
    /** 基础URL（优先级高于实例默认baseURL） */
    baseURL?: string;
}

// 延迟执行时的返回类型（新增，参考A项目）
export interface LazyRequestResult<T = any> {
    execute: (newOptions?: Partial<RequestOptions>) => Promise<T>;
    abort: () => void;
    isLoading: boolean;
    rawData: ResponseData<T> | null;
}

// 代理请求配置（参考A项目useProxyRequest）
export interface ProxyRequestConfig {
    baseURL: string;
    defaultOptions?: Partial<RequestOptions>;
}

// ============================ 核心请求类（保留B+扩展A）============================
class Request {
    // B项目原有核心属性
    private readonly instance: AxiosInstance;
    private loadingCount = 0;
    private loadingInstance: ReturnType<typeof Message.loading> | null = null;
    private loadingTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly defaultLoadingDelay = 300;
    private readonly defaultRetryAttempts = 2;
    private readonly defaultRetryDelay = 1000;
    private maxConcurrent = 10;
    private pendingQueue: Array<() => void> = [];
    private activeRequests = new Map<string, AbortController>();
    private circuitBreaker = new Map<
        string,
        { failures: number; lastFailure: number; isTripped: boolean }
    >();

    // A项目扩展属性（临时拦截器管理）
    private requestInterceptorIds: number[] = [];
    private responseInterceptorIds: number[] = [];

    constructor(defaultConfig: AxiosRequestConfig) {
        // 初始化实例（保留B项目的params序列化、超时等配置）
        this.instance = axios.create({
            baseURL: this.resolveBaseUrl(defaultConfig),
            timeout: 15000,
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            paramsSerializer: (params) => qs.stringify(params, {
                arrayFormat: 'repeat',
                skipNulls: true,
                encode: false
            }),
            ...defaultConfig
        });

        // 初始化全局拦截器（保留B项目的基础拦截）
        this.initGlobalInterceptors();
    }

    // ============================ B项目原有核心方法（保留并兼容）============================
    /** 智能解析基地址（保留B项目逻辑） */
    private resolveBaseUrl(config: AxiosRequestConfig): string {
        if (import.meta.env.DEV) return '';
        if (config.baseURL) return config.baseURL;
        try {
            const envBase = window.__APP_CONFIG__.baseURL;
            if (envBase) return envBase;
        } catch (e) {
            console.warn('环境配置解析失败:', e);
        }
        throw new Error(`生产环境必须配置API基地址！检查.env.production或CI/CD变量`);
    }

    /** 全局拦截器（保留B项目的错误、loading、token处理） */
    private initGlobalInterceptors() {
        // 请求拦截器（全局基础逻辑）
        this.instance.interceptors.request.use(
            (config) => {
                this.validateConfig(config);
                const loadingConfig = this.normalizeLoadingConfig(config as RequestOptions);
                if (loadingConfig.enable) this.startLoading(loadingConfig);

                // 全局Token注入（保留B项目逻辑）
                const token = getToken();
                if (token && !config.headers?.[CommonConfig.Auth]) {
                    config.headers![CommonConfig.Auth] = token;
                }
                return config;
            },
            (error) => {
                this.handleRequestError(error);
                return Promise.reject(error);
            }
        );

        // 响应拦截器（全局基础逻辑）
        this.instance.interceptors.response.use(
            (response) => {
                console.debug('API响应:', { url: response.config.url, status: response.status });
                this.handleResponseSuccess(response);
                return response;
            },
            (error) => this.handleResponseError(error)
        );
    }

    /** 加载状态管理（保留B项目逻辑） */
    private normalizeLoadingConfig(config: RequestOptions): { enable: boolean; text: string; delay: number } {
        const defaultConfig = { enable: true, text: '加载中...', delay: this.defaultLoadingDelay };
        if (!config || config.loading === undefined) return defaultConfig;
        if (!config.loading) return { ...defaultConfig, enable: false };
        return {
            enable: true,
            text: (config.loading as { text?: string }).text || defaultConfig.text,
            delay: (config.loading as { delay?: number }).delay || defaultConfig.delay
        };
    }

    private startLoading(config: { text: string; delay: number }) {
        this.loadingCount++;
        if (!this.loadingTimer) {
            this.loadingTimer = setTimeout(() => {
                if (this.loadingCount > 0 && !this.loadingInstance) {
                    this.loadingInstance = Message.loading({ content: config.text, duration: 0 });
                }
                this.loadingTimer = null;
            }, config.delay);
        }
    }

    private endLoading() {
        this.loadingCount = Math.max(0, this.loadingCount - 1);
        if (this.loadingCount === 0) {
            if (this.loadingTimer) clearTimeout(this.loadingTimer);
            if (this.loadingInstance) this.loadingInstance.close();
            this.loadingTimer = null;
            this.loadingInstance = null;
        }
    }

    /** 错误处理（保留B项目的401、网络错误、业务错误逻辑） */
    private handleRequestError(error: AxiosError) {
        const config = error.config as RequestOptions;
        const loadingConfig = this.normalizeLoadingConfig(config);
        if (loadingConfig.enable) {
            this.loadingCount = 0;
            this.endLoading();
        }
    }

    private handleResponseSuccess(response: AxiosResponse<ResponseData>) {
        const config = response.config as RequestOptions;
        const loadingConfig = this.normalizeLoadingConfig(config);
        if (loadingConfig.enable) this.endLoading();

        // 业务错误（code非200/20000）
        const res = response.data;
        if (res.code !== 200 && res.code !== 20000) {
            this.handleBusinessError(res, response).then();
        }
    }

    private async handleResponseError(error: AxiosError<ResponseData>) {
        const config = error.config as RequestOptions;
        if (config) {
            const loadingConfig = this.normalizeLoadingConfig(config);
            if (loadingConfig.enable) this.endLoading();
        }

        // 网络错误
        if (!error.response) return this.handleNetworkError(error, config);
        // 401登录过期
        if (error.response.status === 401) {
            this.handleUnauthorized();
            return Promise.reject(error);
        }
        // 特殊错误码（50008/50012/50014）
        const res = error.response.data;
        if ([50008, 50012, 50014].includes(res.code)) {
            this.showReLoginModal();
        }
        // 默认错误提示
        this.handleDefaultError(config, error);
        // 重试逻辑
        if (config && this.shouldRetry(config, error)) {
            return this.retryRequest(config, error);
        }

        return Promise.reject(error);
    }

    private handleNetworkError(error: AxiosError, config?: RequestOptions) {
        console.error('网络异常:', error.message);
        if (this.isBrowserEnv() && config?.showError !== false) {
            Message.error({ content: this.parseErrorMessage(error), duration: 5000 });
        }
        return Promise.reject(error);
    }

    private handleBusinessError(res: ResponseData, response: AxiosResponse<ResponseData>) {
        if (this.isBrowserEnv()) {
            Message.error({ content: res.msg || '业务逻辑错误', duration: 5000 });
        }
        if ([50008, 50012, 50014].includes(res.code) && response.config.url !== '/api/user/info') {
            this.showReLoginModal();
        }
        const error = new Error(res.msg || '业务错误') as AxiosError<ResponseData>;
        error.response = response;
        return Promise.reject(error);
    }

    private showReLoginModal() {
        if (!this.isBrowserEnv()) return;
        Modal.error({
            title: '登录失效',
            content: '您的登录状态已过期，请重新登录',
            okText: '重新登录',
            async onOk() {
                const userStore = useUserStore();
                await userStore.logout();
                window.location.reload();
            }
        });
    }

    // ============================ A项目扩展功能（核心新增）============================
    /** 临时添加自定义拦截器（参考A项目，请求结束后自动移除） */
    private addTempInterceptors(options: RequestOptions) {
        // 清空历史临时拦截器
        this.removeTempInterceptors();

        // 自定义请求拦截器
        if (options.beforeRequest) {
            const id = this.instance.interceptors.request.use(options.beforeRequest);
            this.requestInterceptorIds.push(id);
        }

        // 自定义响应拦截器
        if (options.afterResponse) {
            const id = this.instance.interceptors.response.use(options.afterResponse);
            this.responseInterceptorIds.push(id);
        }
    }

    /** 移除临时拦截器（避免全局污染） */
    private removeTempInterceptors() {
        this.requestInterceptorIds.forEach(id => this.instance.interceptors.request.eject(id));
        this.responseInterceptorIds.forEach(id => this.instance.interceptors.response.eject(id));
        this.requestInterceptorIds = [];
        this.responseInterceptorIds = [];
    }

    /** 生成请求唯一Key（用于防重、熔断） */
    private generateRequestKey(config: RequestOptions): string {
        const { method, url, params, data, baseURL } = config;
        return [
            method?.toUpperCase(),
            baseURL || this.instance.defaults.baseURL,
            url,
            JSON.stringify(params),
            JSON.stringify(data)
        ].join('|');
    }

    /** 执行实际请求（融合立即执行/延迟执行逻辑） */
    private async executeRequest<T = any>(config: RequestOptions): Promise<T> {
        const requestKey = this.generateRequestKey(config);
        const controller = new AbortController();

        // 熔断检查（保留B项目逻辑）
        if (this.checkCircuitBreaker(requestKey)) {
            throw new Error('服务暂时不可用，请稍后重试');
        }

        // 防重控制（保留B项目逻辑）
        if (this.activeRequests.has(requestKey)) {
            this.activeRequests.get(requestKey)?.abort();
        }
        this.activeRequests.set(requestKey, controller);

        // 合并配置（支持自定义baseURL）
        const finalConfig: RequestOptions = {
            ...config,
            baseURL: config.baseURL || this.instance.defaults.baseURL,
            signal: controller.signal,
            metadata: { ...config.metadata, requestKey, startTime: Date.now() }
        };

        try {
            // 添加临时拦截器（A项目核心）
            this.addTempInterceptors(finalConfig);

            // 发送请求
            const response = await this.instance(finalConfig);
            const res = response.data as ResponseData<T>;

            // 业务数据提取（参考A项目的data/computed）
            return res.code === 200 || res.code === 20000 ? res.data : Promise.reject(res);
        } catch (error) {
            // 熔断状态更新（保留B项目逻辑）
            this.updateCircuitBreaker(requestKey, error as AxiosError);
            throw error;
        } finally {
            // 清理资源
            this.activeRequests.delete(requestKey);
            this.removeTempInterceptors(); // 移除临时拦截器
            this.processQueue(); // 处理并发队列
        }
    }

    /** 对外请求方法（支持立即执行/延迟执行） */
    public request<T = any>(config: RequestOptions): Promise<T> | LazyRequestResult<T> {
        // 默认立即执行（兼容B项目原有使用方式）
        const finalConfig = { immediate: true, showError: true, ...config };

        // 延迟执行：返回手动执行方法（A项目核心功能）
        if (!finalConfig.immediate) {
            let isLoading = false;
            let rawData: ResponseData<T> | null = null;
            const controller = new AbortController();

            return {
                isLoading,
                rawData,
                abort: () => controller.abort(),
                execute: async (newOptions?: Partial<RequestOptions>) => {
                    isLoading = true;
                    try {
                        const result = await this.executeRequest<T>({
                            ...finalConfig,
                            ...newOptions,
                            signal: controller.signal
                        });
                        rawData = (await this.instance({ ...finalConfig, ...newOptions })).data as ResponseData<T>;
                        return result;
                    } finally {
                        isLoading = false;
                    }
                }
            };
        }

        // 立即执行：直接返回Promise（兼容B项目）
        return this.executeRequest<T>(finalConfig);
    }

    // ============================ 快捷请求方法（保留B+兼容扩展）============================
    public get<T = any>(url: string, params?: any, config?: RequestOptions): Promise<T> | LazyRequestResult<T> {
        return this.request({ url, params, method: 'GET', ...config });
    }

    public post<T = any>(url: string, data?: any, config?: RequestOptions): Promise<T> | LazyRequestResult<T> {
        return this.request({ url, data, method: 'POST', ...config });
    }

    public put<T = any>(url: string, data?: any, config?: RequestOptions): Promise<T> | LazyRequestResult<T> {
        return this.request({ url, data, method: 'PUT', ...config });
    }

    public delete<T = any>(url: string, data?: any, config?: RequestOptions): Promise<T> | LazyRequestResult<T> {
        return this.request({ url, data, method: 'DELETE', ...config });
    }

    // ============================ 工具方法（保留B项目）============================
    private isBrowserEnv(): boolean {
        return typeof window !== 'undefined' && typeof document !== 'undefined';
    }

    private parseErrorMessage(error: AxiosError): string {
        if (error.code === 'ECONNREFUSED') return '无法连接服务器，请检查服务状态';
        const errorMap: Record<number, string> = {
            400: '请求参数错误',
            401: '登录已过期',
            403: '没有操作权限',
            404: '资源不存在',
            500: '服务器错误',
            502: '网关错误',
            503: '服务不可用'
        };
        return (error.response?.data as ResponseData)?.msg || errorMap[error.response?.status || 0] || error.message.replace(/^Axios\sError:\s*/, '');
    }

    private handleUnauthorized() {
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/login')) {
            window.location.replace(`/login?redirect=${encodeURIComponent(location.href)}`);
        }
    }

    private handleDefaultError(config: RequestOptions, error: AxiosError) {
        if (this.isBrowserEnv() && config.showError !== false) {
            Message.error({ content: this.parseErrorMessage(error), duration: 5000 });
        }
    }

    private shouldRetry(config: RequestOptions, error: AxiosError): boolean {
        const retryOptions = config.retry || {};
        const maxRetries = retryOptions.attempts ?? this.defaultRetryAttempts;
        const retryCodes = retryOptions.codes ?? [500, 502, 503, 504];
        return (config.__retryCount || 0) < maxRetries && (retryCodes.includes(error.response?.status || 0) || error.code === 'ECONNREFUSED');
    }

    private retryRequest(config: RequestOptions, error: AxiosError) {
        const retryOptions = config.retry || {};
        const retryDelay = retryOptions.delay ?? this.defaultRetryDelay;
        config.__retryCount = (config.__retryCount || 0) + 1;
        const delay = Math.min(retryDelay * Math.pow(2, config.__retryCount), 30000);

        return new Promise((resolve) => {
            setTimeout(() => resolve(this.instance(config)), delay);
        });
    }

    private validateConfig(config: AxiosRequestConfig) {
        if (!config.baseURL) {
            console.error('请求配置异常:', config);
            Message.error('系统配置异常，请联系管理员');
            throw new Error('缺失baseURL配置');
        }
    }

    private checkCircuitBreaker(key: string): boolean {
        const record = this.circuitBreaker.get(key);
        if (!record) return false;
        if (record.failures >= 3 && Date.now() - record.lastFailure < 30000) {
            if (!record.isTripped) {
                record.isTripped = true;
                setTimeout(() => this.circuitBreaker.delete(key), 60000);
            }
            return true;
        }
        return false;
    }

    private updateCircuitBreaker(key: string, error: AxiosError) {
        const status = error.response?.status;
        if (status && status >= 500) {
            const record = this.circuitBreaker.get(key) || { failures: 0, lastFailure: 0, isTripped: false };
            record.failures += 1;
            record.lastFailure = Date.now();
            this.circuitBreaker.set(key, record);
        }
    }

    private processQueue() {
        if (this.pendingQueue.length > 0 && this.activeRequests.size < this.maxConcurrent) {
            this.pendingQueue.shift()?.();
        }
    }
}

// ============================ A项目核心：代理请求工厂（同一业务域集中封装）============================
/**
 * 创建代理请求实例（参考A项目useProxyRequest）
 * 用于同一业务域（如用户模块、商品模块）的接口集中管理
 */
export function createProxyRequest({ baseURL, defaultOptions }: ProxyRequestConfig) {
    const proxyInstance = new Request({ baseURL });

    // 代理快捷方法（自动拼接baseURL，避免重复写路径）
    return {
        get: <T = any>(path: string, params?: any, config?: RequestOptions) => {
            const url = `${baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
            return proxyInstance.get<T>(url, params, { ...defaultOptions, ...config });
        },
        post: <T = any>(path: string, data?: any, config?: RequestOptions) => {
            const url = `${baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
            return proxyInstance.post<T>(url, data, { ...defaultOptions, ...config });
        },
        put: <T = any>(path: string, data?: any, config?: RequestOptions) => {
            const url = `${baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
            return proxyInstance.put<T>(url, data, { ...defaultOptions, ...config });
        },
        delete: <T = any>(path: string, data?: any, config?: RequestOptions) => {
            const url = `${baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
            return proxyInstance.delete<T>(url, data, { ...defaultOptions, ...config });
        },
        instance: proxyInstance // 暴露原始实例，支持更多自定义
    };
}

// ============================ 默认实例（兼容B项目原有使用方式）============================
export const request = new Request({ baseURL: '', timeout: 15000 });
export default request;
