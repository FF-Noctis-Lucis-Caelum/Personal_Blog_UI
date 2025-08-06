import {IChartSpec} from "@visactor/vchart";

export function initLineChart(id: string, title: string, data: any[]): IChartSpec {
    return {
        type: 'line',
        data: {
            id: id,
            values: data
        },
        title: {
            visible: true,
            text: title
        },
        stack: true,
        xField: 'type',
        yField: 'value',
        seriesField: 'time',
        lineLabel: {
            visible: true,
            syncState: true,
            state: {
                blur: { opacity: 0.2 }
            }
        },
        legends: [{ visible: true, position: 'middle', orient: 'bottom' }],
        line: {
            state: {
                highlight: {
                    lineWidth: 4
                },
                blur: {
                    opacity: 0.2
                }
            }
        },
        point: {
            state: {
                blur: {
                    opacity: 0.2
                }
            }
        },
        hover: false,
        interactions: [
            {
                type: 'element-highlight-by-group'
            }
        ],
        dataZoom: [
            {
                start: 0.9,
                end: 1,
                orient: 'bottom',
                backgroundChart: {
                    area: { style: { lineWidth: 1, fill: '#D1DBEE' } },
                    line: { style: { stroke: '#D1DBEE', lineWidth: 1 } },
                },
                selectedBackgroundChart: {
                    area: { style: { lineWidth: 1, fill: '#fbb934' } },
                    line: { style: { stroke: '#fbb934', lineWidth: 1 } },
                },
            },
        ]
    }
}
