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
            redirect: 'welcome',
        },
        {
            path: '/welcome',
            name: 'welcome',
            component: () => import('@/views/Home/welcome.vue'),
            meta: {
                requiresAuth: false,
            },
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
        ...appRoutes,
    ],
    scrollBehavior() {
        return { top: 0 }
    },
})

createRouteGuard(router)

export default router
