<script setup lang="ts">
import { useCPStore } from '@/store/cathodicProtection'
import {ref, watch} from "vue";
import VChart from "vue-echarts";
const store = useCPStore()
const option = ref({
    color: ['#ffd700'],
    backgroundColor: '#081428',
    textStyle: {
        color: '#fff'
    },
    xAxis: {
        name: '电流密度 (A/m²)',
        nameTextStyle: {
            color: '#a3c6e0'
        },
        type: 'value',
        axisLine: {
            lineStyle: {
                color: '#4a658a'
            }
        },
        axisLabel: {
            color: '#8fadc7'
        },
        splitLine: {
            lineStyle: {
                color: '#1e4a7a',
                opacity: 0.6
            }
        }
    },
    yAxis: {
        name: '电位 (mV)',
        nameTextStyle: {
            color: '#a3c6e0'
        },
        type: 'value',
        axisLine: {
            lineStyle: {
                color: '#4a658a'
            }
        },
        axisLabel: {
            color: '#8fadc7'
        },
        splitLine: {
            lineStyle: {
                color: '#1e4a7a',
                opacity: 0.6
            }
        }
    },
    tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(8,20,40,0.9)',
        borderColor: '#2b91d9',
        borderWidth: 1,
        textStyle: {
            color: '#fff',
            fontSize: 14
        },
        axisPointer: {
            type: 'cross',
            label: {
                backgroundColor: '#2b91d9'
            }
        },
        formatter: (params: any) => {
            const data = params[0].data
            return `电流密度: ${data[0]} A/m²<br>电位: ${data[1]} mV`
        }
    },
    series: [{
        type: 'line',
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
            color: '#ffd700',
            borderColor: '#ffaa00',
            borderWidth: 2
        },
        lineStyle: {
            width: 3,
            shadowColor: 'rgba(255, 215, 0, 0.4)',
            shadowBlur: 10,
            shadowOffsetY: 8
        },
        areaStyle: {
            color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                    offset: 0,
                    color: 'rgba(255, 215, 0, 0.2)'
                }, {
                    offset: 1,
                    color: 'rgba(255, 215, 0, 0)'
                }]
            }
        },
        data: [] as Array<[number, number]>
    }]
})

watch(() => store.polarizationCurve, (newData) => {
    option.value.series[0].data = newData
}, { deep: true })
</script>

<template>
    <div class="chart-container2">
        <h3 class="chart-title">极化特性曲线</h3>
        <VChart style="width: 100%; height: 100%" :option="option" autoresize />
    </div>
</template>

<style scoped>
.chart-container2 {
    height: 500px;
    margin-top: 2rem;
    background: #081428;
    border: 1px solid #1e4a7a;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    .chart-title {
        color: #ffd700;
        font-size: 20px;
        padding: 16px;
        margin: 0;
        background: linear-gradient(90deg, rgba(31, 65, 114, 0.8), transparent);
    }
}
</style>
