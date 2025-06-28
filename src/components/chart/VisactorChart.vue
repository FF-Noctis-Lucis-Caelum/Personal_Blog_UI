<!-- src/components/chart/VisactorChart.vue -->
<script setup lang="ts">
import { defineExpose, defineProps, onBeforeUnmount, onMounted, ref, watch, withDefaults } from 'vue'
import { type IBarChartSpec, type ILineChartSpec, type IVChart, VChart } from '@visactor/vchart'

// 定义支持的图表类型和对应 Spec 类型
type ChartType = 'line' | 'bar'
type ChartSpec = ILineChartSpec | IBarChartSpec

interface ChartProps {
    /** 图表类型 */
    type?: ChartType
    /** 数据数组 */
    data?: any[]
    /** 颜色主题 */
    colors?: string[]
    /** 图表标题 */
    title?: string
    /** 完整 Spec 配置（高级用法） */
    spec?: ChartSpec
    /** 容器高度 */
    height?: number
    /** 是否显示图例 */
    showLegend?: boolean
}

const props = withDefaults(defineProps<ChartProps>(), {
    type: 'line',
    colors: () => ['#6690F2', '#70D6A3', '#B35E45', '#5B8FF9', '#F6BD16'],
    title: '数据图表',
    height: 400,
    showLegend: true,
    data: () => [],
})

const chartInstance = ref<IVChart | null>(null)
const containerId = `visactor-chart-${Math.random().toString(36).slice(2, 9)}`

// 生成基础配置
const generateBaseSpec = (): ChartSpec => {
    return {
        type: props.type,
        title: {
            visible: !!props.title,
            text: props.title,
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold',
            },
        },
        color: {
            type: 'ordinal',
            range: props.colors,
        },
        legends: props.showLegend
            ? [
                  {
                      visible: true,
                      position: 'middle',
                      orient: 'bottom',
                  },
              ]
            : [],
        tooltip: {
            visible: true,
        },
    }
}

// 合并或创建完整 Spec
const getCurrentSpec = (): ChartSpec => {
    if (props.spec) return props.spec

    return {
        ...generateBaseSpec(),
        data: {
            values: props.data,
        },
        xField: 'category',
        yField: 'value',
        seriesField: 'type',
    } as ChartSpec
}

// 初始化图表
const initChart = () => {
    const container = document.getElementById(containerId)
    if (!container) return

    chartInstance.value = new VChart(getCurrentSpec(), {
        dom: container,
        mode: 'desktop-browser',
        disableDirtyRect: true,
    })
    chartInstance.value.renderAsync()
}

// 更新图表
const updateChart = () => {
    if (!chartInstance.value) return

    chartInstance.value.updateSpec(getCurrentSpec())
    chartInstance.value.renderAsync()
}

// 响应式更新
watch(
    () => [props.data, props.colors, props.title, props.showLegend],
    () => updateChart(),
    { deep: true }
)

// 窗口 resize 处理
const handleResize = () => {
    chartInstance.value?.resize()
}

// 生命周期
onMounted(() => {
    initChart()
    window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
    if (chartInstance.value) {
        chartInstance.value.release()
        chartInstance.value = null
    }
    window.removeEventListener('resize', handleResize)
})

// 暴露实例方法
defineExpose({
    getInstance: () => chartInstance.value,
    updateChart,
    resize: handleResize,
})
</script>

<template>
    <div :id="containerId" class="visactor-chart-container" :style="{ height: `${height}px` }"></div>
</template>

<style scoped>
.visactor-chart-container {
    width: 100%;
    min-height: 300px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
