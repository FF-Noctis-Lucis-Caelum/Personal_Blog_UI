import { App, AppContext } from 'vue';
import MessageOriginal from '@arco-design/web-vue/es/message';
import type {
    MessageConfig,
    MessageReturn,
    MessageMethod,
} from '@arco-design/web-vue/es/message/interface';

/**
 * 全局提示类型（严格对齐 Arco 原生，包含 normal/loading）
 */
export type MessageType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'normal';

/**
 * 全局提示位置（仅支持 Arco 原生的 top/bottom）
 */
export type MessagePosition = 'top' | 'bottom';

/**
 * 扩展后的 Message 配置项（无多余属性，仅补充回调）
 */
export interface ExtendedMessageConfig extends Omit<MessageConfig, 'position'> {
    /** 提示内容（必传） */
    content: string;
    /** 自动关闭时长（ms），loading 类型默认 0（不关闭），其他默认 3000 */
    duration?: number;
    /** 是否显示关闭按钮，默认 false */
    closable?: boolean;
    /** 提示位置，仅支持 top/bottom，默认 top */
    position?: MessagePosition;
    /** 自定义类名 */
    className?: string;
    /** 自定义行内样式 */
    style?: Record<string, string | number>;
    /** 关闭回调 */
    onClose?: () => void;
    /** 点击回调 */
    onClick?: () => void;
    /** 创建完成回调 */
    onOpen?: () => void;
    /** 是否显示图标，默认 true */
    showIcon?: boolean;
}

/** Message 全局默认配置 */
let globalMessageDefaults: Omit<ExtendedMessageConfig, 'content'> = {
    duration: 3000,
    closable: false,
    position: 'top',
    showIcon: true,
};

/**
 * 设置 Message 全局默认配置
 * @param defaults 要覆盖的默认配置
 */
export const setMessageDefaults = (
    defaults: Partial<Omit<ExtendedMessageConfig, 'content'>>
) => {
    globalMessageDefaults = { ...globalMessageDefaults, ...defaults };
};

/** 重置 Message 全局默认配置 */
export const resetMessageDefaults = () => {
    globalMessageDefaults = {
        duration: 3000,
        closable: false,
        position: 'top',
        showIcon: true,
    };
};

/**
 * 核心 Message 展示函数
 * @param type 提示类型
 * @param config 配置项（支持字符串快捷传内容）
 * @param appContext Vue 应用上下文
 * @returns Message 实例（含 close 方法）
 */
export const showMessage = (
    type: MessageType,
    config: string | ExtendedMessageConfig,
    appContext?: AppContext
): MessageReturn => {
    try {
        // 1. 格式化配置：兼容字符串快捷传参
        const normalizedConfig: ExtendedMessageConfig = typeof config === 'string'
            ? { content: config, ...globalMessageDefaults }
            : { ...globalMessageDefaults, ...config };

        // 2. 特殊处理：loading 类型默认不自动关闭
        if (type === 'loading' && normalizedConfig.duration === undefined) {
            normalizedConfig.duration = 0;
        }

        // 3. 必传参数校验
        if (!normalizedConfig.content) {
            console.error('[Message] 提示内容为必传参数');
            return { id: '', close: () => {} };
        }

        // 4. 映射到 Arco 原生配置（无多余属性）
        const arcoConfig: MessageConfig = {
            ...normalizedConfig,
            onClose: normalizedConfig.onClose,
            onClick: normalizedConfig.onClick,
            onOpen: normalizedConfig.onOpen,
        };

        // 5. 调用原生方法
        return MessageOriginal[type](arcoConfig, appContext);
    } catch (error) {
        console.error('[Message] 展示失败：', error);
        return { id: '', close: () => {} };
    }
};

/**
 * 快捷方法封装（严格对齐 Arco 原生方法）
 */
export const message = {
    // 基础类型提示（含原生 normal 方法）
    success: (config: string | ExtendedMessageConfig, appContext?: AppContext) =>
        showMessage('success', config, appContext),
    error: (config: string | ExtendedMessageConfig, appContext?: AppContext) =>
        showMessage('error', config, appContext),
    warning: (config: string | ExtendedMessageConfig, appContext?: AppContext) =>
        showMessage('warning', config, appContext),
    info: (config: string | ExtendedMessageConfig, appContext?: AppContext) =>
        showMessage('info', config, appContext),
    loading: (config: string | ExtendedMessageConfig, appContext?: AppContext) =>
        showMessage('loading', config, appContext),
    normal: (config: string | ExtendedMessageConfig, appContext?: AppContext) =>
        showMessage('normal', config, appContext),

    // 原生方法透传（仅保留官方存在的方法）
    /** 清空指定位置的 Message（仅支持 top/bottom） */
    clear: (position?: MessagePosition) => MessageOriginal.clear(position),
    /** Vue 插件安装方法 */
    install: (app: App) => MessageOriginal.install(app),
};

// 导出原生类型
export type { MessageConfig, MessageReturn, MessageMethod };
