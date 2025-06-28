<!-- src/components/BaseChart.vue -->
<template>
    <VChart
        v-if="renderChart"
        :option="options"
        :autoresize="autoResize"
        :style="{ width, height }"
    />
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
    GridComponent,
    TooltipComponent,
    TitleComponent,
    LegendComponent,
    DataZoomComponent
} from 'echarts/components'

// 按需注册ECharts组件
use([
    CanvasRenderer,
    LineChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    TitleComponent,
    LegendComponent,
    DataZoomComponent
])

defineProps({
    options: { type: Object, required: true },
    autoResize: { type: Boolean, default: true },
    width: { type: String, default: '100%' },
    height: { type: String, default: '400px' }
})

const renderChart = ref(false)
nextTick(() => { renderChart.value = true }) // 解决容器初始化尺寸问题
</script>
