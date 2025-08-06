import { ref } from 'vue'
import i18n from "@/locale";
import { Notification } from "@arco-design/web-vue";
import {generateOperationId} from "@/utils/extreme/traceOpt";

// 加载状态
const isLoading = ref(false)
// 加载计数（处理多个并发请求/操作）
let loadingCount = ref(0)
// 最小显示时长（弹性时间，单位：毫秒）
let MINIMUM_LOADING_TIME = 1000 // 可根据需求调整，建议 300-800ms
const MAXIMUM_LOADING_TIME = 2000 // 最大等待时间 2s（防止卡死）
// 记录第一次显示加载的时间
let firstShowTime: number | null = null
// 延迟隐藏的定时器
let hideTimer: NodeJS.Timeout | null = null
// 最大等待定时器
let maxWaitTimer: NodeJS.Timeout | null = null
// 操作标识集合，用于追踪不同的加载操作
const operationIds = new Set<string>()

// 扩展：支持动态设置最小时长
export const setMinimumLoadingTime = (time: number) => {
    if (time > 0) {
        MINIMUM_LOADING_TIME = time
    }
}

export const useLoading = () => {
    // 显示加载，返回操作ID用于后续精确控制
    const showLoading = (): string => {
        const operationId = generateOperationId()
        operationIds.add(operationId)

        // 第一次显示时记录开始时间
        if (loadingCount.value === 0) {
            firstShowTime = Date.now()
            // 启动最大等待定时器
            maxWaitTimer = setTimeout(() => {
                // 只有还有未完成的操作时才提示超时
                if (operationIds.size > 0) {
                    Notification.warning({
                        content: i18n.global.t('outMaxLoading')
                    })
                    console.warn(i18n.global.t('outMaxLoading'), '未完成的操作数:', operationIds.size)
                    // 超时后强制隐藏加载
                    forceHideLoading()
                }
            }, MAXIMUM_LOADING_TIME)
        }

        loadingCount.value++
        isLoading.value = true
        console.log(`[Loading] show - 计数变为: ${loadingCount.value}, 操作ID: ${operationId}`)
        return operationId
    }

    // 隐藏加载（可传入操作ID进行精确控制）
    const hideLoading = (operationId?: string) => {
        // 如果指定了操作ID，先移除该操作
        if (operationId && operationIds.has(operationId)) {
            operationIds.delete(operationId)
        } else if (operationId) {
            console.warn(`[Loading] 尝试隐藏不存在的操作: ${operationId}`)
            return
        }

        if (loadingCount.value <= 0) return // 防止重复调用

        loadingCount.value--
        console.log(`[Loading] hide - 计数变为: ${loadingCount.value}`)

        // 当计数减到 0 或没有未完成操作时，准备隐藏加载
        if (loadingCount.value === 0 || operationIds.size === 0) {
            // 计算已显示时长
            const elapsedTime = Date.now() - (firstShowTime || Date.now())
            // 判断是否需要延迟隐藏（确保至少显示 MINIMUM_LOADING_TIME）
            const needDelay = elapsedTime < MINIMUM_LOADING_TIME
            const delayTime = needDelay ? MINIMUM_LOADING_TIME - elapsedTime : 0
            console.log(`${elapsedTime}ms`, `needDelay: ${needDelay}`, `delayTime: ${delayTime}`)

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
        loadingCount.value = 0
        operationIds.clear()
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
        forceHideLoading
    }
}
