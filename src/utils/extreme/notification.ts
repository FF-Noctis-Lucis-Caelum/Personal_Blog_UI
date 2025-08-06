import { Notification } from '@arco-design/web-vue';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
    title: string;
    content: string;
    duration?: number; // 可选，默认 3000ms
}

/**
 * 通用通知工具函数
 * @param type 通知类型
 * @param options 通知配置项
 */
export const showNotification = (
    type: NotificationType,
    options: NotificationOptions
) => {
    Notification.info({
        ...options,
        duration: options.duration || 3000, // 默认持续时间
    });
};

// 快捷方法：按类型封装
export const notification = {
    success: (options: NotificationOptions) => showNotification('success', options),
    error: (options: NotificationOptions) => showNotification('error', options),
    warning: (options: NotificationOptions) => showNotification('warning', options),
    info: (options: NotificationOptions) => showNotification('info', options),
};
