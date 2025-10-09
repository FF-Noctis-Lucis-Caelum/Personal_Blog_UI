import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'
import { createRouter, createWebHashHistory } from 'vue-router'

import createRouteGuard from './guard'
import { appRoutes } from './routes'
import { useLoading } from '@/hooks/CyLoading'
import type { UseLoadingCacheStore } from '@/store/modules/loading/LoadingCache'
import {useLoadingCacheStore} from "@/store/modules/loading/LoadingCache";
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
                waitForMount: true,
                loadingOpId: null // 用于存储加载操作ID
            },
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/Rbac/login.vue'),
            meta: {
                requiresAuth: false,
                waitForMount: false,
                loadingOpId: null
            },
        },
        {
            path: '/register',
            name: "register",
            component: () => import('@/views/Rbac/register.vue'),
            meta: {
                requiresAuth: false,
                loadingOpId: null
            }
        },
        ...appRoutes.map(route => ({
            ...route,
            meta: {
                ...route.meta,
                loadingOpId: null // 为所有路由添加加载操作ID字段
            }
        }))
    ],
    scrollBehavior() {
        return { top: 0 }
    },
})

createRouteGuard(router)

const { showLoading, hideLoading } = useLoading()
// 不在这里直接初始化，而是在守卫内部获取
let loadingCacheStore: UseLoadingCacheStore | null = null
let currentRouteNeedWait = false // 记录当前路由是否需要等待挂载

// 全局前置守卫 - 路由跳转开始时显示加载
router.beforeEach((to, from, next) => {
    // 在守卫内部获取store实例，确保Pinia已初始化
    if (!loadingCacheStore) {
        loadingCacheStore = useLoadingCacheStore()
    }

    // 1. 不需要登录的页面直接放行
    if (!to.meta.requiresAuth) return next();

    currentRouteNeedWait = to.meta.waitForMount === true
    console.log('当前路由是否需要等待挂载:', currentRouteNeedWait)

    // 显示加载并获取操作ID
    const opId = showLoading()

    // 如果路由有名称，使用名称作为key存储opId
    if (to.name) {
        loadingCacheStore.setRouteOpId(to.name.toString(), opId)
        console.log(`路由[${to.name}]加载开始，操作ID: ${opId}已缓存`)
    }

    next()
})

router.afterEach((to) => {
    if (!loadingCacheStore) {
        return
    }

    if( !currentRouteNeedWait && to.name ) {
        // 从缓存中获取并移除操作ID
        const opId = loadingCacheStore.takeRouteOpId(to.name.toString())
        if (opId) {
            console.log(`路由[${to.name}]加载完成，操作ID: ${opId}已释放`)
            hideLoading(opId)
        } else {
            hideLoading()
        }
    }
})

export default router

