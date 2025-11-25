import {App, AppContext} from 'vue';
import NotificationOriginal from '@arco-design/web-vue/es/notification';
import type {
    NotificationConfig,
    NotificationMethod,
    NotificationReturn,
} from '@arco-design/web-vue/es/notification/interface';

/**
 * 通知类型（对齐 Arco 原生）
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * 通知位置（严格对齐 Arco 原生驼峰命名）
 */
export type NotificationPosition =
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight';

/**
 * 扩展后的通知配置项（继承 Arco 原生 + 补充清晰注释）
 */
export interface ExtendedNotificationConfig extends Omit<NotificationConfig, 'position'> {
    /** 通知标题（必传，若原生传字符串时自动映射） */
    title?: string;
    /** 通知内容（必传） */
    content: string;
    /** 自动关闭时长（ms），设为 0 则不自动关闭，默认 3000 */
    duration?: number;
    /** 是否显示关闭按钮，默认 true */
    closable?: boolean;
    /** 通知位置，默认 topRight（对齐 Arco 原生驼峰） */
    position?: NotificationPosition;
    /** 点击通知回调 */
    onClick?: () => void;
    /** 关闭通知回调（无论手动/自动关闭都会触发） */
    onClose?: () => void;
    /** 通知创建完成回调（DOM 渲染后） */
    onOpen?: () => void;
    /** 自定义类名（用于样式覆盖） */
    className?: string;
    /** 自定义样式（行内样式） */
    style?: Record<string, string | number>;
}

/**
 * 全局默认配置（可动态修改）
 */
let globalNotificationDefaults: Omit<ExtendedNotificationConfig, 'content'> = {
    duration: 3000,
    closable: true,
    position: 'topRight',
};

/**
 * 设置通知全局默认配置
 * @param defaults 要覆盖的默认配置
 */
export const setNotificationDefaults = (
    defaults: Partial<Omit<ExtendedNotificationConfig, 'content'>>
) => {
    globalNotificationDefaults = { ...globalNotificationDefaults, ...defaults };
};

/**
 * 重置通知全局默认配置
 */
export const resetNotificationDefaults = () => {
    globalNotificationDefaults = {
        duration: 3000,
        closable: true,
        position: 'topRight',
    };
};

/**
 * 核心通知展示函数
 * @param type 通知类型
 * @param config 通知配置项（支持字符串快捷传内容，或完整配置）
 * @param appContext Vue 应用上下文（可选，适配多实例场景）
 * @returns 通知实例（包含 id 和 close 方法）
 */
export const showNotification = (
    type: NotificationType,
    config: string | ExtendedNotificationConfig,
    appContext?: AppContext
): NotificationReturn => {
    try {
        // 1. 格式化配置：兼容字符串快捷传参（Arco 原生支持）
        const normalizedConfig: ExtendedNotificationConfig = typeof config === 'string'
            ? { content: config, ...globalNotificationDefaults }
            : { ...globalNotificationDefaults, ...config };

        // 2. 校验必传参数
        if (!normalizedConfig.content) {
            console.error('[Notification] 通知内容为必传参数');
            return { id: '', close: () => {} };
        }

        // 3. 映射到 Arco 原生配置
        const arcoConfig: NotificationConfig = {
            ...normalizedConfig,
            // 绑定回调（对齐 Arco 原生触发逻辑）
            onClose: () => normalizedConfig.onClose?.(),
            onClick: () => normalizedConfig.onClick?.(),
            onOpen: () => normalizedConfig.onOpen?.(),
            // 标题兼容：若用户传了 title 则覆盖，否则用原生默认
            title: normalizedConfig.title || '',
        };

        // 4. 调用 Arco 原生方法
        return NotificationOriginal[type](arcoConfig, appContext);
    } catch (error) {
        console.error('[Notification] 通知展示失败：', error);
        return { id: '', close: () => {} };
    }
};

/**
 * 快捷方法封装（类型化 + 原生方法对齐）
 */
export const notification = {
    // 基础类型通知
    success: (config: string | ExtendedNotificationConfig, appContext?: AppContext) =>
        showNotification('success', config, appContext),
    error: (config: string | ExtendedNotificationConfig, appContext?: AppContext) =>
        showNotification('error', config, appContext),
    warning: (config: string | ExtendedNotificationConfig, appContext?: AppContext) =>
        showNotification('warning', config, appContext),
    info: (config: string | ExtendedNotificationConfig, appContext?: AppContext) =>
        showNotification('info', config, appContext),

    // 原生方法透传 + 类型封装
    /** 关闭指定 ID 的通知 */
    remove: (id: string) => NotificationOriginal.remove(id),
    /** 清空指定位置的所有通知（默认清空全部） */
    clear: (position?: NotificationPosition) => NotificationOriginal.clear(position),
    /** Vue 插件安装方法（适配全局注册） */
    install: (app: App) => NotificationOriginal.install(app),
};

// 导出原生类型方便外部使用
export type { NotificationConfig, NotificationReturn, NotificationMethod };
