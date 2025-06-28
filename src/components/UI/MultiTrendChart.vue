<script setup lang="ts">
import { useCPStore } from '@/store/cathodicProtection'
import { ref, watch } from 'vue'
import VChart from "vue-echarts"
import * as echarts from 'echarts'

const store = useCPStore()

const option = ref({
    color: ['#00f3ff', '#ff4455', '#00ff99', '#ffcc00'],
    legend: {
        top: 10,
        textStyle: { color: '#fff' },
        itemGap: 20,
        icon: 'rect'
    },
    grid: {
        top: 60,
        bottom: 30,
        left: 50,
        right: 50
    },
    toolbox: {
        feature: {
            saveAsImage: {}
        }
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            label: {
                backgroundColor: '#6a7985'
            }
        },
        formatter: (params: any) => {
            const date = new Date(params[0].value[0])
            return `
                <div class="tooltip-box">
                    <div style="color: lightblue; font-weight: 800;">时间：${date.toLocaleTimeString()}</div>
                    ${params.map((item: any) => `
                        <div style="color:${item.color}; font-weight: 800">
                            ${item.seriesName}：${item.value[1].toFixed(2)}${item.seriesName === '温度' ? '℃' : ''}
                        </div>
                    `).join('')}
                </div>
            `
        }
    },
    xAxis: {
        type: 'time',
        axisLine: {
            lineStyle: {
                color: '#2b7acf',
                width: 2
            }
        }
    },
    yAxis: [
        {
            type: 'value',
            name: 'PH值/温度 (℃)',
            position: 'left',
            axisLine: {
                lineStyle: {
                    color: '#00f3ff',
                    width: 2
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#14325a',
                    type: 'dashed'
                }
            }
        },
        {
            type: 'value',
            name: '电阻 (Ω)/腐蚀速率 (mm/a)',
            position: 'right',
            axisLine: {
                lineStyle: {
                    color: '#ff4455',
                    width: 2
                }
            },
            splitLine: { show: false }
        }
    ],
    series: [
        {
            name: 'PH值',
            type: 'line',
            stack: 'LeftStack',
            yAxisIndex: 0,
            smooth: true,
            symbol: 'none',
            areaStyle: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00f3ff33' },
                { offset: 1, color: '#00f3ff00' }
            ]),
            lineStyle: { width: 2 },
            data: [] as Array<[Date, number]>
        },
        {
            name: '温度',
            type: 'line',
            stack: 'LeftStack',
            yAxisIndex: 0,
            smooth: true,
            symbol: 'none',
            areaStyle: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00ff9933' },
                { offset: 1, color: '#00ff9900' }
            ]),
            lineStyle: { width: 2, color: '#00ff99' },
            data: [] as Array<[Date, number]>
        },
        {
            name: '接地电阻',
            type: 'line',
            stack: 'RightStack',
            yAxisIndex: 1,
            smooth: true,
            symbol: 'circle',
            areaStyle: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#ff445533' },
                { offset: 1, color: '#ff445500' }
            ]),
            lineStyle: { width: 2, color: '#ff4455' },
            data: [] as Array<[Date, number]>
        },
        {
            name: '腐蚀速率',
            type: 'line',
            stack: 'RightStack',
            yAxisIndex: 1,
            smooth: true,
            symbol: 'triangle',
            areaStyle: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#ffcc0033' },
                { offset: 1, color: '#ffcc0000' }
            ]),
            lineStyle: { width: 2, color: '#ffcc00' },
            data: [] as Array<[Date, number]>
        }
    ]
})

watch(() => store.historyData, (newData) => {
    option.value.series[0].data = newData.map(d => [d.timestamp, d.phValue])
    option.value.series[1].data = newData.map(d => [d.timestamp, d.temperature])
    option.value.series[2].data = newData.map(d => [d.timestamp, d.groundResistance])
    option.value.series[3].data = newData.map(d => [d.timestamp, d.corrosionRate])
}, { deep: true })
</script>

<template>
    <div class="multi-trend-container">
        <h3 class="chart-title">环境参数堆叠趋势</h3>
        <VChart :option="option" autoresize class="chart" />
    </div>
</template>

<style scoped>
/* 原有样式保持不变 */
.multi-trend-container {
    height: 640px;
    margin: 2rem 0;
    background: linear-gradient(152deg, #081639 0%, #0a1a3f 100%);
    border: 1px solid rgba(43, 122, 207, 0.8);
    border-radius: 12px;
    position: relative;
    box-shadow: 0 8px 32px rgba(0, 91, 255, 0.2);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.multi-trend-container:hover {
    box-shadow: 0 12px 40px rgba(0, 91, 255, 0.3);
}

.chart-title {
    position: absolute;
    top: 24px;
    left: 32px;
    color: #6efcf9;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 1px;
    text-shadow: 0 0 15px rgba(110, 252, 249, 0.4);
    display: flex;
    align-items: center;
    gap: 12px;
}

.chart-title::before {
    content: '';
    display: block;
    width: 4px;
    height: 24px;
    background: linear-gradient(180deg, #6efcf9 0%, #2573d5 100%);
    border-radius: 2px;
}

.chart {
    width: calc(100% - 40px);
    height: calc(100% - 80px);
    margin: 80px 20px 0;
}

/* 增强tooltip样式 */
:deep(.tooltip-box) {
    padding: 12px 16px;
    background: linear-gradient(152deg, #0a1a3f 0%, #081639 100%) !important;
    border: 1px solid rgba(110, 252, 249, 0.3);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

:deep(.tooltip-box div) {
    font-size: 14px;
    line-height: 1.8;
    font-family: 'Helvetica Neue', Arial, sans-serif;
}
</style>
