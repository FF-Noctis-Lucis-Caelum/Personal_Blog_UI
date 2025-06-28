import {createApp} from 'vue'
import './style.css'
import globalComponents from '@/components'
import App from './App.vue'
import i18n from './locale'
import store from './store'
import directive from './directive'

import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'

// Styles are imported via arco-plugin. See config/plugin/arcoStyleImport.ts in the directory for details
// 样式通过 arco-plugin 插件导入。详见目录文件 config/plugin/arcoStyleImport.ts
// https://arco.design/docs/designlab/use-theme-package
import '@/api/interceptor'
import '@/assets/style/global.less'
import '@icon-park/vue-next/styles/index.css';

// 引入echarts
import Echarts from 'vue-echarts'
import * as echarts from 'echarts'

import BaseEChart from "@/components/chart/BaseEChart.vue";
import BaseVChart from "@/components/chart/BaseVChart.vue";

import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faServer,
    faDesktop,
    // 添加其他需要的图标
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// 引入路由
import router from './router'

const app = createApp(App)

library.add(faServer, faDesktop /* 其他图标 */)
app.component('font-awesome-icon', FontAwesomeIcon)

// 使用组件
app.component('BaseEChart', BaseEChart)
app.component('BaseVChart', BaseVChart)
app.component('e-charts', Echarts) // 全局注册 ECharts
app.config.globalProperties.$echarts = echarts;
app.use(ArcoVue)
app.use(ArcoVueIcon)
app.use(router)
app.use(store)
app.use(directive)
app.use(i18n)
app.use(globalComponents)
app.mount('#app')
