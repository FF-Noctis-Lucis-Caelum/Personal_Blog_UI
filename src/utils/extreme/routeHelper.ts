import { Router, RouteLocationRaw, RouteLocationNormalized } from 'vue-router';
import {Message} from "@arco-design/web-vue";
import { logger } from './logger';

interface LinkOptions {
    replace?: boolean;
    beforeJump?: () => boolean | Promise<boolean>;
    onSuccess?: (to: RouteLocationNormalized) => void;
    onError?: (error: Error, type: 'validation' | 'navigation' | 'beforeJump') => void;
    showError?: boolean;
    // 为不同错误类型提供更细致的自定义消息
    errorMessages?: {
        validation?: string;    // 路由不存在时的消息
        navigation?: string;    // 导航失败时的消息
        beforeJump?: string;    // 前置钩子阻止时的消息
        timeout?: string;       // 超时时的消息
    };
    timeout?: number;
}

// 默认配置增强：提供更友好的用户提示
const DEFAULT_OPTIONS: LinkOptions = {
    replace: false,
    showError: true,
    timeout: 5000,
    errorMessages: {
        validation: '抱歉，该页面不存在或已被移除',
        navigation: '页面跳转失败，请稍后重试',
        beforeJump: '操作被阻止，请检查相关条件',
        timeout: '页面跳转超时，请稍后重试'
    }
};

function validateRoute(router: Router, to: RouteLocationRaw): boolean {
    try {
        const resolved = router.resolve(to);
        return !!resolved.matched.length;
    } catch (error) {
        logger.warn('Route validation failed', { to, error });
        return false;
    }
}

export function linkPage(
    router: Router,
    to: RouteLocationRaw,
    options: LinkOptions = {}
): Promise<RouteLocationNormalized> {
    // 合并配置，确保错误消息有合理默认值
    const config = {
        ...DEFAULT_OPTIONS,
        ...options,
        errorMessages: {
            ...DEFAULT_OPTIONS.errorMessages,
            ...options.errorMessages
        }
    };

    const fromRoute = router.currentRoute.value;

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
        abortController.abort(new Error('Navigation timed out'));
    }, config.timeout);

    return new Promise<RouteLocationNormalized>(async (resolve, reject) => {
        try {
            // 前置钩子验证
            if (config.beforeJump) {
                const canJump = await config.beforeJump();
                if (!canJump) {
                    const error = new Error('Navigation aborted by beforeJump hook');
                    config.onError?.(error, 'beforeJump');

                    // 前置钩子阻止时的用户提示
                    if (config.showError) {
                        Message.error(config.errorMessages?.beforeJump || '操作无法完成');
                    }

                    return reject(error);
                }
            }

            // 路由存在性验证
            if (!validateRoute(router, to)) {
                const error = new Error(config.errorMessages?.validation || 'Route does not exist');
                config.onError?.(error, 'validation');

                // 路由不存在时的用户提示（关键增强）
                if (config.showError) {
                    Message.error(config.errorMessages?.validation);
                }

                return reject(error);
            }

            // 超时/中断处理
            abortController.signal.addEventListener('abort', (event) => {
                const error = event.target instanceof ErrorEvent
                    ? event.target.error
                    : new Error('Navigation aborted');

                logger.error('Navigation aborted', { to, error, from: fromRoute.fullPath });
                config.onError?.(error as Error, 'navigation');

                // 超时时的用户提示
                if (config.showError) {
                    Message.error(config.errorMessages?.timeout);
                }

                reject(error);
            });

            // 执行导航
            let navigationPromise: Promise<RouteLocationNormalized | void>;
            if (config.replace) {
                navigationPromise = router.replace(to);
            } else {
                navigationPromise = router.push(to);
            }

            // 等待导航完成
            const toRoute = await navigationPromise;
            clearTimeout(timeoutId);

            const finalToRoute = toRoute || router.currentRoute.value;

            logger.info('Navigation successful', {
                from: fromRoute.fullPath,
                to: finalToRoute.fullPath
            });

            config.onSuccess?.(finalToRoute);
            resolve(finalToRoute);

        } catch (error) {
            clearTimeout(timeoutId);

            const navError = error instanceof Error ? error : new Error(String(error));
            logger.error('Navigation failed', {
                from: fromRoute.fullPath,
                to,
                error: navError
            });

            config.onError?.(navError, 'navigation');

            // 导航过程中出错的用户提示
            if (config.showError) {
                // 优先使用自定义消息，其次使用错误对象的消息，最后使用默认消息
                const errorMessage =
                    config.errorMessages?.navigation ||
                    navError.message ||
                    '页面跳转发生错误';
                Message.error(errorMessage);
            }

            reject(navError);
        }
    });
}

export function goTo(
    router: Router,
    to: RouteLocationRaw,
    replace = false
): Promise<RouteLocationNormalized> {
    return linkPage(router, to, { replace });
}

export function goBack(
    router: Router,
    fallback: RouteLocationRaw = '/',
    fallbackMessage = '已经是首页了'
): Promise<RouteLocationNormalized> {
    const fromRoute = router.currentRoute.value;

    if (router.history.index > 0) {
        return new Promise(resolve => {
            router.back();
            setTimeout(() => {
                const toRoute = router.currentRoute.value;
                logger.info('Navigation back successful', {
                    from: fromRoute.fullPath,
                    to: toRoute.fullPath
                });
                resolve(toRoute);
            }, 0);
        });
    } else {
        // 返回失败时的用户提示
        Message.info(fallbackMessage);
        return goTo(router, fallback);
    }
}
