import NProgress from 'nprogress' // progress bar
import type { LocationQueryRaw, Router } from 'vue-router'

import { useUserStore } from '@/store'
import { isLogin } from '@/utils/auth'

export default function setupUserLoginInfoGuard(router: Router) {
    router.beforeEach(async (to, from, next) => {
        NProgress.start()
        const userStore = useUserStore()

        // 增加白名单判断
        if (!to.meta.requiresAuth) {
            next()
            return
        }

        if (isLogin()) {
            try {
                if (!userStore.checkInfo) {
                    await userStore.info()
                }
                return next()
            } catch (error) {
                console.error('用户信息加载失败:', error)
                await userStore.logout()
                return next({
                    name: 'login',
                    query: { redirect: to.path, ...to.query } as LocationQueryRaw
                })
            }
        } else {
            if (to.name === 'login') {
                next()
                return
            }
            next({
                name: 'login',
                query: {
                    redirect: to.name,
                    ...to.query,
                } as LocationQueryRaw,
            })
        }
    })
}
