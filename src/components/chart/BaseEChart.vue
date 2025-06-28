<template>
    <div ref="chartContainer" class="chart-container" :style="{ width, height }"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import type { ECharts, SetOptionOpts } from 'echarts/core'
import type { ECBasicOption } from 'echarts/types/dist/shared'

const props = withDefaults(defineProps<{
    options: ECBasicOption
    width?: string
    height?: string
    theme?: string | object
    autoResize?: boolean
    manualUpdate?: boolean
}>(), {
    width: '100%',
    height: '400px',
    theme: 'default',
    autoResize: true,
    manualUpdate: false
})

const emit = defineEmits(['chart-ready', 'chart-click', 'chart-updated'])

const chartContainer = ref<HTMLElement>()
let chartInstance: ECharts | null = null
let observer: ResizeObserver | null = null

// 初始化图表
const initChart = () => {
    if (!chartContainer.value) return

    chartInstance = echarts.init(chartContainer.value, props.theme)
    chartInstance.setOption(props.options)
    emit('chart-ready', chartInstance)

    // 事件代理
    chartInstance.on('click', params => {
        emit('chart-click', params)
    })
}

// 更新图表
const updateChart = (newOptions: ECBasicOption) => {
    if (!chartInstance) return
    chartInstance.setOption(newOptions, { notMerge: true } as SetOptionOpts)
    emit('chart-updated', chartInstance)
}

// 自适应逻辑
const initResizeObserver = () => {
    if (!props.autoResize || !chartContainer.value) return

    observer = new ResizeObserver(() => {
        chartInstance?.resize()
    })
    observer.observe(chartContainer.value)
}

onMounted(() => {
    initChart()
    initResizeObserver()
})

onUnmounted(() => {
    observer?.disconnect()
    chartInstance?.dispose()
})

watch(() => props.options, (newVal) => {
    if (!props.manualUpdate) {
        updateChart(newVal)
    }
}, { deep: true })

// 暴露方法给父组件
defineExpose({
    getInstance: () => chartInstance,
    updateChart
})
</script>
