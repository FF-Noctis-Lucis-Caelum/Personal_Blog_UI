import { Notify } from '@/utils/notification.ts'

class ErrorNotifier {
  private errorQueue: Array<{ message: string, priority: number }> = [] // 错误队列
  private mergeDelay = 500 // 合并窗口期（ms）
  private timer: NodeJS.Timeout | null = null // 合并定时器
  private maxVisibleCount = 2 // 最多同时显示的通知数量
  private visibleCount = 0 // 当前显示的通知数量

  // 单例实例
  private static instance: ErrorNotifier
  private constructor() {}

  public static getInstance(): ErrorNotifier {
    if (!ErrorNotifier.instance) {
      ErrorNotifier.instance = new ErrorNotifier()
    }
    return ErrorNotifier.instance
  }

  // 添加错误到队列，触发合并逻辑
  public addError(message: string, priority = 1) {
    // 高优先级错误（如登录失效）直接显示，不合并
    if (priority >= 10) {
      this.showNotification(message)
      return
    }

    // 普通错误加入队列
    this.errorQueue.push({ message, priority })

    // 重置合并定时器
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      this.processQueue() // 窗口期结束后处理队列
    }, this.mergeDelay)
  }

  // 处理错误队列，生成合并通知
  private processQueue() {
    if (this.errorQueue.length === 0) {
      return
    }

    let notificationMessage: string
    // 单个错误：直接显示具体信息
    if (this.errorQueue.length === 1) {
      notificationMessage = this.errorQueue[0].message
    }
    // 多个错误：合并提示（可保留关键错误信息）
    else {
      const uniqueMessages = [...new Set(this.errorQueue.map(item => item.message))]
      notificationMessage = `有 ${this.errorQueue.length} 个请求失败：${
        uniqueMessages.length > 1 ? `${uniqueMessages[0]} 等` : uniqueMessages[0]
      }`
    }

    // 显示合并后的通知
    this.showNotification(notificationMessage)

    // 清空队列
    this.errorQueue = []
    this.timer = null
  }

  // 显示通知（控制同时显示数量）
  private showNotification(message: string) {
    if (this.visibleCount >= this.maxVisibleCount) {
      // 超过最大显示数量时，延迟显示
      setTimeout(() => this.showNotification(message), 1000)
      return
    }

    this.visibleCount++
    // 调用Notify组件（假设支持onClose回调）
    Notify.error({
      message,
      onClose: () => {
        this.visibleCount--
      },
    })
  }
}

export const errorNotifier = ErrorNotifier.getInstance()
