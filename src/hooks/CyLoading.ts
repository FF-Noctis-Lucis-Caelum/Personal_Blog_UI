// src/store/loading.ts
import { ref } from 'vue'
import i18n from "@/locale";
import { Notification } from "@arco-design/web-vue";

// 加载状态
const isLoading = ref(false)
// 加载计数（处理多个并发请求/操作）
let loadingCount = 0
// 最小显示时长（弹性时间，单位：毫秒）
let MINIMUM_LOADING_TIME = 1000 // 可根据需求调整，建议 300-800ms
const MAXIMUM_LOADING_TIME = 2000 // 最大等待时间 2s（防止卡死）
// 记录第一次显示加载的时间
let firstShowTime: number | null = null
// 延迟隐藏的定时器
let hideTimer: NodeJS.Timeout | null = null
// 最大等待定时器
let maxWaitTimer: NodeJS.Timeout | null = null

// 扩展：支持动态设置最小时长
export const setMinimumLoadingTime = (time: number) => {
    if (time > 0) {
        MINIMUM_LOADING_TIME = time
    }
}

export const useLoading = () => {
    // 显示加载
    const showLoading = () => {
        loadingCount++
        console.log(`[Loading] show - 计数变为: ${loadingCount}`)
        // 第一次显示时记录开始时间
        if (loadingCount === 0) {
            firstShowTime = Date.now()
            // 启动最大等待定时器
            maxWaitTimer = setTimeout(() => {
                Notification.warning({
                    content: i18n.global.t('outMaxLoading')
                })
                console.warn(i18n.global.t('outMaxLoading'))
                // 超时后强制隐藏加载
                forceHideLoading()
            }, MAXIMUM_LOADING_TIME)
        }

        isLoading.value = true
    }

    // 隐藏加载（核心：处理弹性时间）
    const hideLoading = () => {
        if (loadingCount <= 0) return // 防止重复调用

        loadingCount--
        console.log(`[Loading] hide - 计数变为: ${loadingCount}`)
        // 当计数减到 0 时，准备隐藏加载
        if (loadingCount === 0) {
            // 计算已显示时长
            const elapsedTime = Date.now() - (firstShowTime || Date.now())
            // 判断是否需要延迟隐藏（确保至少显示 MINIMUM_LOADING_TIME）
            const needDelay = elapsedTime < MINIMUM_LOADING_TIME
            const delayTime = needDelay ? MINIMUM_LOADING_TIME - elapsedTime : 0

            // 清除之前的定时器（避免多个并发操作导致的定时器冲突）
            if (hideTimer) clearTimeout(hideTimer)

            // 延迟隐藏或立即隐藏
            hideTimer = setTimeout(() => {
                isLoading.value = false
                resetLoadingState() // 重置所有定时器和状态
            }, delayTime)
        }
    }

    // 强制隐藏加载（用于特殊场景，比如错误处理）
    const forceHideLoading = () => {
        if (hideTimer) clearTimeout(hideTimer)
        if (maxWaitTimer) clearTimeout(maxWaitTimer)
        loadingCount = 0
        isLoading.value = false
        resetLoadingState()
    }

    // 重置状态
    const resetLoadingState = () => {
        firstShowTime = null
        hideTimer = null
        maxWaitTimer = null
    }

    return {
        isLoading,
        showLoading,
        hideLoading,
        forceHideLoading // 暴露强制隐藏方法，可选
    }
}
