import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'
import { createRouter, createWebHashHistory } from 'vue-router'

import createRouteGuard from './guard'
import { appRoutes } from './routes'
import { useLoading } from '@/hooks/CyLoading'
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
                waitForMount: true
            },
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/Rbac/login.vue'),
            meta: {
                requiresAuth: false,
                waitForMount: false
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

const { showLoading, hideLoading } = useLoading()
let currentRouteNeedWait = false // 记录当前路由是否需要等待挂载
// 全局前置守卫 - 路由跳转开始时显示加载
router.beforeEach((to, from, next) => {
    currentRouteNeedWait = to.meta.waitForMount === true
    console.log(currentRouteNeedWait)
    showLoading()
    next()
})

router.afterEach(() => {
    if( !currentRouteNeedWait ) {
        hideLoading()
    }
})

export default router
