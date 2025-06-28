// useChart.ts
import { onMounted, onBeforeUnmount, type Ref } from 'vue';
import VChart, { type ISpec } from '@visactor/vchart';

export interface ChartHook {
    updateData: (newValues: any[]) => void;
    resetData: () => void;
}

export function useChart(
    containerRef: Ref<HTMLElement | undefined>,
    initialSpec: ISpec,
    initialData: any[]
): ChartHook {
    let vchart: VChart | null = null;
    let currentData = [...initialData];
    
    const initChart = () => {
        if (!containerRef.value) return;
        
        const fullSpec = {
            ...initialSpec,
            data: {
                ...initialSpec.data,
                values: currentData
            }
        };
        
        vchart = new VChart(fullSpec, { dom: containerRef.value });
        vchart.renderAsync().then();
    };
    
    const updateChartData = (newValues: any[]) => {
        if (!vchart) return;
        
        currentData = [...currentData, ...newValues];
        vchart.updateData('data', currentData).then();
    };
    
    const resetChartData = () => {
        currentData = [...initialData];
        updateChartData([]);
    };
    
    onMounted(initChart);
    
    onBeforeUnmount(() => {
        if (vchart) {
            vchart.release();
            vchart = null;
        }
    });
    
    return {
        updateData: updateChartData,
        resetData: resetChartData
    };
}
