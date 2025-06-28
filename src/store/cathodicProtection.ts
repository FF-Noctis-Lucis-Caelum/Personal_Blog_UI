import { defineStore } from 'pinia'
import { ref } from 'vue'

interface HistoryData {
    timestamp: Date
    potential: number       // 电位
    currentDensity: number  // 电流密度
    phValue: number        // PH值
    groundResistance: number // 接地电阻
    corrosionRate: number   // 腐蚀速率
    temperature: number     // 温度
    value: number
}

export const useCPStore = defineStore('cathodicProtection', () => {
    // 实时数据
    const potential = ref(-850)
    const currentDensity = ref(3.45)
    const efficiency = ref(92)
    const phValue = ref(7.0)
    const groundResistance = ref(2.5)
    const corrosionRate = ref(0.02)
    const temperature = ref(35.0)
    const polarizationCurve = ref<Array<[number, number]>>([])

    // 历史数据（包含所有指标）
    const historyData = ref<HistoryData[]>([])

    let ws: WebSocket | null = null

    const initWebSocket = () => {
        ws = new WebSocket('ws://your-backend-url/ws/cp-data')

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            potential.value = data.potential
            currentDensity.value = data.currentDensity
            efficiency.value = data.efficiency


            if (historyData.value.length > 60) {
                historyData.value.shift()
            }
        }

        ws.onerror = (error) => {
            console.error('WebSocket error:', error)
        }
    }

    const closeWebSocket = () => {
        ws?.close()
    }

    // -----------------------------------------------------------

    let mockTimer: ReturnType<typeof setInterval> | null = null

    // 新增模拟数据方法
    const startMockData = () => {
        // 初始化历史数据
        const initHistoryData = () => {
            const now = Date.now()
            return Array.from({ length: 60 }, (_, i) => ({
                timestamp: new Date(now - (60 - i) * 1000),
                potential: -850 + Math.random() * 20 - 10,
                currentDensity: 3 + Math.random() * 0.5,
                phValue: 6.5 + Math.random() * 1.5,
                groundResistance: 2 + Math.random(),
                corrosionRate: 0.01 + Math.random() * 0.03,
                temperature: 30 + Math.random() * 10,
                value: -850 + Math.random() * 20 - 10
            }))
        }

        historyData.value = initHistoryData()

        const updateData = () => {
            const newData = {
                timestamp: new Date(),
                potential: Number((-850 + Math.random() * 20 - 10).toFixed(1)),
                currentDensity: Number((3 + Math.random() * 0.5).toFixed(2)),
                phValue: Number((6.5 + Math.random() * 1.5).toFixed(1)),
                groundResistance: Number((2 + Math.random()).toFixed(1)),
                corrosionRate: Number((0.01 + Math.random() * 0.03).toFixed(3)),
                temperature: Number((30 + Math.random() * 10).toFixed(1)),
                value: Number((-850 + Math.random() * 20 - 10).toFixed(1)),
            }

            // 更新实时数据
            potential.value = newData.potential
            currentDensity.value = newData.currentDensity
            phValue.value = newData.phValue
            groundResistance.value = newData.groundResistance
            corrosionRate.value = newData.corrosionRate
            temperature.value = newData.temperature

            // 更新历史数据队列
            historyData.value.push(newData as HistoryData)
            if (historyData.value.length > 60) historyData.value.shift()

            // 更新极化曲线数据
            polarizationCurve.value = Array.from({length: 10}, (_, i) => [
                i * 0.1,
                Math.sin(i * 0.5) * 2 + Math.random()
            ])
        }

        mockTimer = setInterval(updateData, 2000)
    }

    // 停止模拟
    const stopMockData = () => {
        if (mockTimer) clearInterval(mockTimer)
    }

    // -----------------------------------------------------------
    return {
        // 实时数据
        potential,
        currentDensity,
        efficiency,
        phValue,
        groundResistance,
        corrosionRate,
        temperature,

        // 历史数据
        historyData,

        // 其他数据
        polarizationCurve,

        // 方法
        initWebSocket,
        closeWebSocket,
        startMockData,
        stopMockData
    }
})
