import { defineStore } from 'pinia'

interface LoadingCacheState {
    // 存储路由对应的操作ID，key为路由名称或路径
    routeOpIds: Record<string, string>
    // 存储临时的操作ID（用于非路由相关的临时操作）
    tempOpIds: Record<string, string>
}

export const useLoadingCacheStore = defineStore('loadingCache', {
    state: (): LoadingCacheState => ({
        routeOpIds: {},
        tempOpIds: {}
    }),

    actions: {
        /**
         * 存储路由对应的操作ID
         * @param routeName 路由名称
         * @param opId 操作ID
         */
        setRouteOpId(routeName: string, opId: string) {
            this.routeOpIds[routeName] = opId
        },

        /**
         * 获取路由对应的操作ID
         * @param routeName 路由名称
         * @returns 操作ID或null
         */
        getRouteOpId(routeName: string): string | null {
            return this.routeOpIds[routeName] || null
        },

        /**
         * 移除并返回路由对应的操作ID
         * @param routeName 路由名称
         * @returns 操作ID或null
         */
        takeRouteOpId(routeName: string): string | null {
            const opId = this.getRouteOpId(routeName)
            if (opId) {
                delete this.routeOpIds[routeName]
            }
            return opId
        },

        /**
         * 存储临时操作ID
         * @param key 标识键
         * @param opId 操作ID
         */
        setTempOpId(key: string, opId: string) {
            this.tempOpIds[key] = opId
        },

        /**
         * 获取并移除临时操作ID
         * @param key 标识键
         * @returns 操作ID或null
         */
        takeTempOpId(key: string): string | null {
            const opId = this.tempOpIds[key] || null
            if (opId) {
                delete this.tempOpIds[key]
            }
            return opId
        },

        /**
         * 清空所有缓存的操作ID
         */
        clearAll() {
            this.routeOpIds = {}
            this.tempOpIds = {}
        }
    }
})
