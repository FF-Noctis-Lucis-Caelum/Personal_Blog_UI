import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'
import { createRouter, createWebHashHistory } from 'vue-router'

import createRouteGuard from './guard'
import { appRoutes } from './routes'
import { NOT_FOUND_ROUTE, REDIRECT_MAIN } from './routes/base'
import { useUserStore } from '@/store'
import { getToken } from '@/utils/auth'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const router = createRouter({
    history: createWebHashHistory('./'),
    routes: [
        {
            path: '/',
            redirect: 'login',
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/Rbac/login.vue'),
            meta: {
                requiresAuth: false,
            },
        },
        {
            path: '/register',
            name: "register",
            component: () => import('@/views/Rbac/register.vue'),
            meta: {
                requiresAuth: false,
            }
        },
        {
            path: '/hello',
            name: 'hello',
            component: () => import('@/components/HelloWorld.vue')
        },
        ...appRoutes,
        REDIRECT_MAIN,
        NOT_FOUND_ROUTE,
    ],
    scrollBehavior() {
        return { top: 0 }
    },
})

createRouteGuard(router)

export default router
