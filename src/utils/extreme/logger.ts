import { v4 as uuidv4 } from 'uuid';
import { getBrowserInfo, getOSInfo } from './deviceInfo';

// 日志级别
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// 日志数据结构
interface LogData {
    id: string; // 日志唯一ID
    level: LogLevel; // 日志级别
    message: string; // 日志消息
    data?: any; // 附加数据
    timestamp: number; // 时间戳
    context?: { [key: string]: any }; // 上下文信息
    environment: {
        browser: string;
        os: string;
        url: string;
        userAgent: string;
        screen: string;
        language: string;
    };
    sessionId: string; // 会话ID
    userId?: string; // 用户ID（登录后设置）
}

// 日志配置
interface LoggerConfig {
    enabled: boolean; // 是否启用日志
    level: LogLevel; // 日志输出级别
    maxCacheSize: number; // 最大缓存日志数量
    reportUrl?: string; // 日志上报地址
    reportInterval: number; // 日志上报间隔(ms)
    localStoreKey: string; // 本地存储键名
    saveToLocalStorage: boolean; // 是否保存到本地存储
}

// 默认配置
const DEFAULT_CONFIG: LoggerConfig = {
    enabled: true,
    level: 'info',
    maxCacheSize: 100,
    reportInterval: 30000, // 30秒
    localStoreKey: '__app_logs__',
    saveToLocalStorage: true
};

// 级别权重，用于判断是否需要记录
const LEVEL_WEIGHT: Record<LogLevel, number> = {
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5
};

export class Logger {
    private config: LoggerConfig;
    private logs: LogData[] = [];
    private sessionId: string;
    private userId?: string;
    private reportTimer?: number;
    private isReporting = false;

    constructor(customConfig: Partial<LoggerConfig> = {}) {
        // 合并配置
        this.config = { ...DEFAULT_CONFIG, ...customConfig };

        // 初始化会话ID
        this.sessionId = this.initSessionId();

        // 加载本地缓存的日志
        this.loadFromLocalStorage();

        // 启动定时上报
        this.startAutoReport();

        // 监听页面关闭事件，上报剩余日志
        window.addEventListener('beforeunload', () => this.reportLogs());

        // 监听全局错误
        this.listenGlobalErrors();
    }

    // 初始化会话ID
    private initSessionId(): string {
        const storedSessionId = localStorage.getItem('__app_session_id__');
        if (storedSessionId) {
            return storedSessionId;
        }
        const newSessionId = uuidv4();
        localStorage.setItem('__app_session_id__', newSessionId);
        return newSessionId;
    }

    // 设置用户ID（登录后调用）
    setUserId(userId: string): void {
        this.userId = userId;
        // 更新已缓存日志的userId
        this.logs.forEach(log => {
            if (!log.userId) {
                log.userId = userId;
            }
        });
        this.saveToLocalStorage();
    }

    // 清除用户ID（登出时调用）
    clearUserId(): void {
        this.userId = undefined;
    }

    // 加载本地存储的日志
    private loadFromLocalStorage(): void {
        if (!this.config.saveToLocalStorage) return;

        try {
            const storedLogs = localStorage.getItem(this.config.localStoreKey);
            if (storedLogs) {
                this.logs = JSON.parse(storedLogs);
            }
        } catch (error) {
            console.error('Failed to load logs from localStorage', error);
            // 清除损坏的日志数据
            localStorage.removeItem(this.config.localStoreKey);
        }
    }

    // 保存日志到本地存储
    private saveToLocalStorage(): void {
        if (!this.config.saveToLocalStorage) return;

        try {
            localStorage.setItem(this.config.localStoreKey, JSON.stringify(this.logs));
        } catch (error) {
            console.error('Failed to save logs to localStorage', error);
            // 存储满了，尝试清理旧日志
            if (this.logs.length > 0) {
                this.logs = this.logs.slice(Math.floor(this.logs.length / 2));
                this.saveToLocalStorage();
            }
        }
    }

    // 生成环境信息
    private getEnvironmentInfo(): LogData['environment'] {
        return {
            browser: getBrowserInfo(),
            os: getOSInfo(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language
        };
    }

    // 检查日志级别是否需要记录
    private shouldLog(level: LogLevel): boolean {
        return this.config.enabled && LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[this.config.level];
    }

    // 创建日志
    private createLog(level: LogLevel, message: string, data?: any, context?: { [key: string]: any }): LogData {
        return {
            id: uuidv4(),
            level,
            message,
            data,
            timestamp: Date.now(),
            context,
            environment: this.getEnvironmentInfo(),
            sessionId: this.sessionId,
            userId: this.userId
        };
    }

    // 添加日志到缓存
    private addLog(log: LogData): void {
        // 控制台输出
        this.consoleLog(log);

        // 添加到日志列表
        this.logs.push(log);

        // 限制日志数量
        if (this.logs.length > this.config.maxCacheSize) {
            this.logs.shift(); // 移除最旧的日志
        }

        // 保存到本地存储
        this.saveToLocalStorage();

        // 错误级别以上立即上报
        if (['error', 'fatal'].includes(log.level) && this.config.reportUrl) {
            this.reportLogs();
        }
    }

    // 控制台输出
    private consoleLog(log: LogData): void {
        const { level, message, data } = log;

        switch (level) {
            case 'debug':
                console.debug(`[DEBUG] ${message}`, data);
                break;
            case 'info':
                console.info(`[INFO] ${message}`, data);
                break;
            case 'warn':
                console.warn(`[WARN] ${message}`, data);
                break;
            case 'error':
                console.error(`[ERROR] ${message}`, data);
                break;
            case 'fatal':
                console.error(`[FATAL] ${message}`, data);
                break;
        }
    }

    // 启动自动上报
    private startAutoReport(): void {
        if (!this.config.reportUrl) return;

        this.reportTimer = window.setInterval(() => {
            this.reportLogs();
        }, this.config.reportInterval);
    }

    // 上报日志
    async reportLogs(): Promise<boolean> {
        if (!this.config.reportUrl || this.logs.length === 0 || this.isReporting) {
            return false;
        }

        this.isReporting = true;
        const logsToReport = [...this.logs];
        this.logs = []; // 清空当前日志

        try {
            const response = await fetch(this.config.reportUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    logs: logsToReport,
                    appVersion: import.meta.env.VITE_APP_VERSION || 'unknown'
                }),
                keepalive: true // 支持页面关闭时仍能上报
            });

            if (!response.ok) {
                throw new Error(`Report failed with status ${response.status}`);
            }

            // 上报成功，清除本地存储的日志
            if (this.config.saveToLocalStorage) {
                localStorage.removeItem(this.config.localStoreKey);
            }

            this.isReporting = false;
            return true;
        } catch (error) {
            console.error('Failed to report logs', error);

            // 上报失败，将日志放回队列
            this.logs = [...logsToReport, ...this.logs];
            this.saveToLocalStorage();

            this.isReporting = false;
            return false;
        }
    }

    // 监听全局错误
    private listenGlobalErrors(): void {
        // 监听JavaScript错误
        window.addEventListener('error', (event) => {
            this.error('Global JavaScript error', {
                message: event.error?.message,
                stack: event.error?.stack,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // 监听未捕获的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.error('Unhandled promise rejection', {
                reason: event.reason?.message || event.reason,
                stack: event.reason?.stack
            });
            event.preventDefault();
        });

        // 监听资源加载错误
        window.addEventListener('load', () => {
            document.querySelectorAll('img, script, link').forEach(element => {
                element.addEventListener('error', (event) => {
                    this.warn('Resource load error', {
                        tagName: element.tagName,
                        src: (element as HTMLImageElement | HTMLScriptElement).src ||
                            (element as HTMLLinkElement).href,
                        type: (element as HTMLScriptElement | HTMLLinkElement).type
                    });
                });
            });
        });
    }

    // 调试日志
    debug(message: string, data?: any, context?: { [key: string]: any }): void {
        if (this.shouldLog('debug')) {
            this.addLog(this.createLog('debug', message, data, context));
        }
    }

    // 信息日志
    info(message: string, data?: any, context?: { [key: string]: any }): void {
        if (this.shouldLog('info')) {
            this.addLog(this.createLog('info', message, data, context));
        }
    }

    // 警告日志
    warn(message: string, data?: any, context?: { [key: string]: any }): void {
        if (this.shouldLog('warn')) {
            this.addLog(this.createLog('warn', message, data, context));
        }
    }

    // 错误日志
    error(message: string, data?: any, context?: { [key: string]: any }): void {
        if (this.shouldLog('error')) {
            this.addLog(this.createLog('error', message, data, context));
        }
    }

    // 致命错误日志
    fatal(message: string, data?: any, context?: { [key: string]: any }): void {
        if (this.shouldLog('fatal')) {
            this.addLog(this.createLog('fatal', message, data, context));
        }
    }

    // 销毁日志实例
    destroy(): void {
        if (this.reportTimer) {
            clearInterval(this.reportTimer);
        }
        // 最后一次上报
        this.reportLogs();
    }
}

// 设备信息工具函数
// src/utils/deviceInfo.ts
export function getBrowserInfo(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Chrome')) {
        return `Chrome ${getBrowserVersion(userAgent, 'Chrome')}`;
    } else if (userAgent.includes('Firefox')) {
        return `Firefox ${getBrowserVersion(userAgent, 'Firefox')}`;
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        return `Safari ${getBrowserVersion(userAgent, 'Safari')}`;
    } else if (userAgent.includes('Edge')) {
        return `Edge ${getBrowserVersion(userAgent, 'Edge')}`;
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
        return `IE ${getBrowserVersion(userAgent, 'MSIE') || '11'}`;
    }

    return 'Unknown browser';
}

export function getOSInfo(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Windows')) {
        return 'Windows';
    } else if (userAgent.includes('Macintosh')) {
        return 'macOS';
    } else if (userAgent.includes('Linux')) {
        return 'Linux';
    } else if (userAgent.includes('iPhone')) {
        return 'iOS (iPhone)';
    } else if (userAgent.includes('iPad')) {
        return 'iOS (iPad)';
    } else if (userAgent.includes('Android')) {
        return 'Android';
    }

    return 'Unknown OS';
}

function getBrowserVersion(userAgent: string, browserName: string): string | undefined {
    const regex = new RegExp(`${browserName}\\/(\\d+\\.\\d+)`);
    const match = userAgent.match(regex);
    return match ? match[1] : undefined;
}

// 创建默认日志实例
export const logger = new Logger({
    // 可以根据环境变量配置不同的日志级别
    level: import.meta.env.DEV ? 'debug' : 'info',
    // 日志上报地址，从环境变量获取
    reportUrl: import.meta.env.VITE_LOG_REPORT_URL
});
