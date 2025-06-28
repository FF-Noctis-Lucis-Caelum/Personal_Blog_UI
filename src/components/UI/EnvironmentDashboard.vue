<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GaugeChart } from 'echarts/charts'
import VChart from 'vue-echarts'
import { useCPStore } from '@/store/cathodicProtection'
import * as echarts from 'echarts'
use([CanvasRenderer, GaugeChart])

const store = useCPStore()

const gaugeOption = (value: number, name: string, color: string) => ({
    tooltip: {
        formatter: '{b}: <strong style="color:#fff;font-size:18px">{c}</strong>',
        backgroundColor: 'rgba(8,20,40,0.95)',
        borderColor: '#2b91d9',
        borderWidth: 1,
        textStyle: {
            color: '#fff',
            fontSize: 16
        },
        trigger: 'item',
        position: function (pos: number[]) {
            return [pos[0] + 20, pos[1] - 40];
        },
        extraCssText: `
            box-shadow: 0 0 15px rgba(43, 145, 217, 0.5);
            border-radius: 6px;
            padding: 12px 20px;
        `
    },
    series: [{
        type: 'gauge',
        min: Math.max(0, value - 50),
        max: value + 50,
        startAngle: 225,
        endAngle: -45,
        pointer: {
            show: true,
            length: '70%',
            width: 6,
            itemStyle: {
                color: 'auto',
                shadowBlur: 10,
                shadowColor: 'rgba(255,255,255,0.3)'
            }
        },
        axisLine: {
            lineStyle: {
                width: 20,
                color: [
                    [1, '#57524e'] // 进度条背景渐变
                ],
                shadowColor: 'rgba(0,0,0,0.3)',
                shadowBlur: 8
            }
        },
        progress: {
            show: true,
            width: 20,
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: color },
                    { offset: 1, color: color + '88' }
                ])
            }
        },
        axisTick: {
            length: 12,
            lineStyle: {
                color: 'rgba(255,255,255,0.5)',
                width: 2
            }
        },
        splitLine: {
            length: 20,
            lineStyle: {
                color: 'rgba(255,255,255,0.6)',
                width: 3
            }
        },
        axisLabel: {
            distance: 35,
            color: '#a3c6e0',
            fontSize: 14,
            formatter: (val: number) => val.toFixed(0)
        },
        detail: {
            formatter: `{value|${name}}`,
            fontSize: 24,
            offsetCenter: [0, '65%'],
            color: '#fff',
            rich: {
                value: {
                    color: '#fff',
                    fontSize: 24,
                    padding: [8, 0],
                    textShadowBlur: 10,
                    textShadowColor: color
                }
            }
        },
        data: [{value, name}],
        animationDuration: 2000,
        animationEasing: 'cubicOut'
    }]
})
</script>

<template>
    <div class="chart-container3">
        <h3 class="chart-title">特征仪表盘</h3>
        <div class="gauge-grid">
            <VChart :option="gaugeOption(store.temperature, '温度', '#ff6b6b')" />
            <VChart :option="gaugeOption(store.phValue, 'PH值', '#4ce0b3')" />
            <VChart :option="gaugeOption(store.groundResistance, '接地电阻', '#6c8cff')" />
        </div>
    </div>
</template>

<style scoped>
.chart-container3 {
    height: 500px;
    padding: 20px;
    background: #081428;
    border: 1px solid #1e4a7a;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    margin-top: 2rem;
}

.gauge-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    height: calc(100% - 40px);
    padding: 10px 0;
}

.chart-title {
    color: #fff;
    font-size: 22px;
    margin: 0 0 15px 0;
    padding-bottom: 15px;
    border-bottom: 2px solid #2b91d9;
    position: relative;
}

.chart-title::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100px;
    height: 2px;
    background: linear-gradient(90deg, #2b91d9, transparent);
}

.echarts {
    height: 100% !important;
    transition: transform 0.3s ease;
}

.echarts:hover {
    transform: scale(1.02);
}
</style>
