// src/utils/routeGuard.ts

// 防止路径注入（可选扩展）
const SAFE_PATH_REGEX = /^[a-zA-Z0-9_-]+$/

// 安全路由白名单（根据实际路由配置修改）
const SAFE_REDIRECT_NAMES = new Set([
    'Workplace',      // 工作台
    'Dashboard',      // 仪表盘
    'Profile',        // 个人中心
    'ProjectList',    // 项目列表
    'Notification'    // 通知中心
])

// 默认安全路由
const DEFAULT_SAFE_ROUTE = 'Workplace'

/**
 * 安全路由验证函数
 * @param target 需要验证的路由名称（支持字符串或路由对象）
 * @returns 通过验证的安全路由名称
 */
export const validateRedirect = (target: unknown): string => {
    // 处理路由对象形式
    if (typeof target === 'object' && target !== null) {
        const routeObj = target as { name?: string }
        return routeObj?.name ? validateRedirect(routeObj.name) : DEFAULT_SAFE_ROUTE
    }

    // 标准化输入为字符串
    const normalized = String(target).trim()

    // 空值处理
    if (!normalized) return DEFAULT_SAFE_ROUTE

    // 白名单验证
    return SAFE_REDIRECT_NAMES.has(normalized)
        ? normalized
        : DEFAULT_SAFE_ROUTE
}

export function validatePath(target: string) {
    return SAFE_PATH_REGEX.test(target)
        ? target
        : DEFAULT_SAFE_ROUTE
}

// 类型守卫（可选）
export const isSafeRedirect = (target: unknown): target is string => {
    return typeof target === 'string' && SAFE_REDIRECT_NAMES.has(target)
}
