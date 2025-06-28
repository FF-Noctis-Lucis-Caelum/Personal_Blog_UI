<script setup lang="ts">
import { useCPStore } from '@/store/cathodicProtection'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import {watch} from "vue";
import {ref} from "vue";
import * as echarts from 'echarts'
use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

const store = useCPStore()
const option = ref({
    color: ['#00f3ff'],
    grid: { top: 50, bottom: 30, left: 60, right: 30 },
    xAxis: {
        type: 'time',
        splitLine: { show: false },
        axisLine: { lineStyle: { color: '#2b7acf' } }
    },
    yAxis: {
        type: 'value',
        min: -900,
        max: -800,
        splitLine: { lineStyle: { color: '#14325a' } },
        axisLine: { lineStyle: { color: '#1277e4' } }
    },
    series: [{
        data: [] as Array<[Date, number]>,
        type: 'line',
        smooth: true,
        areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00f3ff66' },
                { offset: 1, color: '#00f3ff00' }
            ])
        },
        lineStyle: { width: 2 }
    }],
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            label: {
                backgroundColor: '#666'
            },
            lineStyle: {
                color: '#1277e4',
                width: 2,
                opacity: 0.8
            }
        },
        formatter: (params: any) => {
            const time = new Date(params[0].value[0]).toLocaleString();
            const value = params[0].value[1];
            return `时间: ${time}<br>值: ${value}`;
        }
    },
    animation: false
})

// 修改watch部分增加边界检查
watch(() => store.historyData, (newData) => {
    if(newData.length > 0) {
        const minY = Math.floor(Math.min(...newData.map(d => d.value)) / 10) * 10 - 10
        const maxY = Math.ceil(Math.max(...newData.map(d => d.value)) / 10) * 10 + 10
        option.value = {
            ...option.value,
            yAxis: {
                ...option.value.yAxis,
                min: minY,
                max: maxY
            },
            series: [{
                ...option.value.series[0],
                data: newData.map(d => [d.timestamp, d.value])
            }]
        }
    }
}, { deep: true })
</script>

<template>
    <div class="chart-container">
        <div class="chart-header">
            <span class="decorative-light"></span>
            <h3 class="chart-title">阴极保护电位趋势图</h3>
        </div>
        <VChart style="width: 100%;height: 90%" :option="option" autoresize />
    </div>
</template>

<style scoped>
.chart-container {
    height: 500px;
    margin-top: 2rem;
    background: linear-gradient(145deg, #081428 0%, #0a1a32 100%);
    border: 1px solid;
    border-image: linear-gradient(45deg, #1e4a7a, #1277e433) 1;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    position: relative;
}

.chart-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(
        90deg,
        rgba(18, 119, 228, 0) 0%,
        rgba(18, 119, 228, 0.1) 50%,
        rgba(18, 119, 228, 0) 100%
    );
    animation: lightSweep 8s infinite linear;
}

.chart-header {
    position: relative;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(30, 74, 122, 0.5);
}

.chart-title {
    color: #e0f0ff;
    font-size: 16px;
    font-weight: 500;
    position: relative;
    padding-left: 24px;
}

.chart-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background: linear-gradient(180deg, #00f3ff 0%, #1277e4 100%);
    border-radius: 2px;
}

.decorative-light {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    background: #00f3ff;
    border-radius: 50%;
    box-shadow: 0 0 12px #00f3ff;
    animation: pulse 1.5s infinite;
}

@keyframes lightSweep {
    0% { transform: translateX(0); }
    100% { transform: translateX(50%); }
}

@keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
}

</style>
