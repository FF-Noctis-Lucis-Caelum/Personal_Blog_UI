// src/hooks/usePermissionGuard.ts
import { PermissionError } from '@/api/errors/PermissionError'
import { Message } from '@arco-design/web-vue'
import { useUserStore } from '@/store'
import { Permission } from '@/store/modules/user/types'

const userStore = useUserStore()

// 权限校验装饰器（适用于异步函数）
export function withPermission(requiredPermission?: string) {
    return <T extends (...args: any[]) => Promise<any>>(fn: T): T => {
        return async function (...args: Parameters<T>) {
            // 校验权限（支持空权限表示无需校验）
            if (requiredPermission && !(userStore.permissions as unknown as Permission[]).some(p => p.permKey === requiredPermission)) {
                Message.error(`无权限：需要 ${requiredPermission} 权限`)
                throw new PermissionError() // 抛出可捕获的异常
            }
            return fn.apply(this, args) // 执行原函数
        } as unknown as T
    }
}
