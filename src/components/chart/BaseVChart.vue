<template>
    <div ref="chartContainer" class="chart-container"></div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import VChart, { IChartSpec } from '@visactor/vchart';

// 定义 Props 类型
interface Props {
    chartSpec: IChartSpec;
    autoUpdate?: boolean;
    updateInterval?: number;
}

// 定义 Props
const props = defineProps<Props>();

// 定义 Emits 类型
interface Emits {
    (e: 'data-updated', updatedValues: any[]): void;
}

// 定义 Emits
const emit = defineEmits<Emits>();

// 动态生成的 DOM 容器
const chartContainer = ref<HTMLElement | null>(null);

// VChart 实例
let chart: VChart | null = null;

// 初始化图表
const initChart = () => {
    if (!chartContainer.value) return;
    chart = new VChart(props.chartSpec, { dom: chartContainer.value });
    chart.renderAsync();
};

// 更新图表数据
const updateChart = () => {
    if (!chart || !props.chartSpec.data?.id) return;

    // 确保 spec 中的 data.id 被正确指定
    const dataId = props.chartSpec.data.id;
    const updatedValues = props.chartSpec.data.values;

    // 添加新的数据点，而不是替换整个数据集
    chart.updateData(dataId, updatedValues);

    // 触发事件通知父组件数据已更新
    emit('data-updated', updatedValues);
};

// 监听 chartSpec 的变化并重新渲染图表
watch(
    () => props.chartSpec,
    (newSpec, oldSpec) => {
        // 排除数据变化的配置比较
        const oldConfig = { ...oldSpec, data: null };
        const newConfig = { ...newSpec, data: null };

        if (JSON.stringify(oldConfig) !== JSON.stringify(newConfig)) {
            // 配置变化时重新渲染
            if (chart) chart.release();
            initChart();
        } else {
            // 仅数据变化时增量更新
            updateChart();
        }
    },
    { deep: true }
);

onMounted(() => {
    initChart();
});

onBeforeUnmount(() => {
    if (chart) {
        chart.release();
        chart = null;
    }

    console.log('Chart component is unmounting');
});

// 暴露公共方法供外部调用
defineExpose({
    updateChart,
});
</script>

<style scoped>
.chart-container {
    width: 100%;
    height: 100%;
}
</style>
