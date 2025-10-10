import { Router, RouteLocationRaw, RouteLocationNormalized } from 'vue-router';
import { ElMessage } from 'element-plus';
import { logger } from './logger';

interface LinkOptions {
    replace?: boolean;
    beforeJump?: () => boolean | Promise<boolean>;
    onSuccess?: (to: RouteLocationNormalized) => void;
    onError?: (error: Error, type: 'validation' | 'navigation' | 'beforeJump') => void;
    showError?: boolean;
    errorMessage?: string;
    timeout?: number;
}

const DEFAULT_OPTIONS: LinkOptions = {
    replace: false,
    showError: true,
    timeout: 5000
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
    const config = { ...DEFAULT_OPTIONS, ...options };

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
        abortController.abort(new Error('Navigation timed out'));
    }, config.timeout);

    return new Promise<RouteLocationNormalized>(async (resolve, reject) => {
        try {
            if (config.beforeJump) {
                const canJump = await config.beforeJump();
                if (!canJump) {
                    const error = new Error('Navigation aborted by beforeJump hook');
                    config.onError?.(error, 'beforeJump');
                    return reject(error);
                }
            }

            if (!validateRoute(router, to)) {
                const error = new Error(config.errorMessage || 'Route does not exist');
                config.onError?.(error, 'validation');

                if (config.showError) {
                    ElMessage.error(error.message);
                }

                return reject(error);
            }

            abortController.signal.addEventListener('abort', (event) => {
                const error = event.target instanceof ErrorEvent ? event.target.error : new Error('Navigation aborted');
                logger.error('Navigation aborted', { to, error });
                config.onError?.(error as Error, 'navigation');

                if (config.showError) {
                    ElMessage.error('Navigation timed out or aborted');
                }

                reject(error);
            });

            let navigationPromise: Promise<RouteLocationNormalized | void>;

            if (config.replace) {
                navigationPromise = router.replace(to);
            } else {
                navigationPromise = router.push(to);
            }

            // 等待跳转完成 - 关键修复：处理可能的undefined返回值
            const toRoute = await navigationPromise;

            // 清除超时
            clearTimeout(timeoutId);

            // 关键修复：使用当前路由作为备选，确保路由信息可用
            const finalToRoute = toRoute || router.currentRoute.value;

            // 记录成功日志 - 增加安全检查
            logger.info('Navigation successful', {
                from: router.currentRoute.value?.fullPath,
                to: finalToRoute?.fullPath
            });

            // 执行成功回调
            config.onSuccess?.(finalToRoute);

            resolve(finalToRoute);

        } catch (error) {
            clearTimeout(timeoutId);

            const navError = error instanceof Error ? error : new Error(String(error));
            logger.error('Navigation failed', { to, error: navError });

            config.onError?.(navError, 'navigation');

            if (config.showError) {
                ElMessage.error(config.errorMessage || navError.message || 'Failed to navigate');
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
    fallback: RouteLocationRaw = '/'
): Promise<RouteLocationNormalized> {
    if (router.history.index > 0) {
        return new Promise(resolve => {
            router.back();
            setTimeout(() => {
                resolve(router.currentRoute.value);
            }, 0);
        });
    } else {
        return goTo(router, fallback);
    }
}
