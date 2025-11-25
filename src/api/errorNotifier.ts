// 替换原有 Notify 导入，使用封装后的 notification
import { notification } from '@/utils/extreme/notification';
import type { NotificationReturn } from '@/utils/extreme/notification'; // 导入实例类型

class ErrorNotifier {
    private errorQueue: Array<{ message: string, priority: number }> = []; // 错误队列
    private mergeDelay = 500; // 合并窗口期（ms）
    private timer: number | null = null; // 合并定时器（浏览器环境用 number 替代 NodeJS.Timeout）
    private maxVisibleCount = 2; // 最多同时显示的通知数量
    private visibleCount = 0; // 当前显示的通知数量
    private activeNotifications: NotificationReturn[] = []; // 记录活跃的通知实例（可选，用于手动控制）

    // 单例实例
    private static instance: ErrorNotifier;
    private constructor() {}

    public static getInstance(): ErrorNotifier {
        if (!ErrorNotifier.instance) {
            ErrorNotifier.instance = new ErrorNotifier();
        }
        return ErrorNotifier.instance;
    }

    // 添加错误到队列，触发合并逻辑
    public addError(message: string, priority = 1) {
        // 高优先级错误（如登录失效）直接显示，不合并
        if (priority >= 10) {
            this.showNotification(message);
            return;
        }

        // 普通错误加入队列
        this.errorQueue.push({ message, priority });

        // 重置合并定时器
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = window.setTimeout(() => {
            this.processQueue(); // 窗口期结束后处理队列
        }, this.mergeDelay);
    }

    // 处理错误队列，生成合并通知
    private processQueue() {
        if (this.errorQueue.length === 0) {
            return;
        }

        let notificationContent: string;
        // 单个错误：直接显示具体信息
        if (this.errorQueue.length === 1) {
            notificationContent = this.errorQueue[0].message;
        }
        // 多个错误：合并提示（可保留关键错误信息）
        else {
            const uniqueMessages = [...new Set(this.errorQueue.map(item => item.message))];
            notificationContent = `有 ${this.errorQueue.length} 个请求失败：${
                uniqueMessages.length > 1 ? `${uniqueMessages[0]} 等` : uniqueMessages[0]
            }`;
        }

        // 显示合并后的通知
        this.showNotification(notificationContent);

        // 清空队列
        this.errorQueue = [];
        this.timer = null;
    }

    // 显示通知（控制同时显示数量）
    private showNotification(content: string) {
        if (this.visibleCount >= this.maxVisibleCount) {
            // 超过最大显示数量时，延迟显示（递归调用，直到有空闲位置）
            setTimeout(() => this.showNotification(content), 1000);
            return;
        }

        this.visibleCount++;
        // 调用封装后的 notification.error 方法（对齐配置项）
        const notifyInstance = notification.error({
            title: '操作错误', // 统一错误通知标题
            content: content, // 错误内容（替换原 message 参数）
            duration: 5000, // 错误通知显示时长（5秒）
            closable: true, // 显示关闭按钮
            onClose: () => {
                // 通知关闭后，减少计数并移除实例
                this.visibleCount--;
                const index = this.activeNotifications.indexOf(notifyInstance);
                if (index > -1) {
                    this.activeNotifications.splice(index, 1);
                }
            },
            onClick: () => {
                // 可选：点击通知时的额外逻辑（如跳转到错误日志页）
                console.log('用户点击了错误通知：', content);
            },
        });

        // 记录活跃通知实例（便于批量控制）
        this.activeNotifications.push(notifyInstance);
    }

    // 可选：手动清空所有错误通知
    public clearAllErrors() {
        this.activeNotifications.forEach(instance => {
            instance.close(); // 调用通知实例的关闭方法
        });
        this.activeNotifications = [];
        this.visibleCount = 0;
        this.errorQueue = [];
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}

export const errorNotifier = ErrorNotifier.getInstance();
