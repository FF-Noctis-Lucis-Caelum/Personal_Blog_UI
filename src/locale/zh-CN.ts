import localeMessageBox from '@/components/message-box/locale/zh-CN'

import localeWorkplace from '@/views/dashboard/workplace/locale/zh-CN'
/** simple */
import localeMonitor from '@/views/dashboard/monitor/locale/zh-CN.js'

import localeDataAnalysis from '@/views/visualization/data-analysis/locale/zh-CN'
import localeMultiDAnalysis from '@/views/visualization/multi-dimension-data-analysis/locale/zh-CN'
/** simple end */
import localeSettings from './zh-CN/settings'

export default {
    'menu.dashboard': '仪表盘',
    'menu.server.dashboard': '仪表盘-服务端',
    'menu.server.workplace': '工作台-服务端',
    'menu.server.monitor': '实时监控-服务端',
    'menu.list': '列表页',
    'menu.result': '结果页',
    'menu.exception': '异常页',
    'menu.form': '表单页',
    'menu.profile': '详情页',
    'menu.visualization': '数据可视化',
    'menu.user': '个人中心',
    'menu.arcoWebsite': 'Arco Design',
    'menu.ai': 'AI助手',
    'menu.server': '智能中心',
    'menu.server.mate': 'MateChat',

    /* UI中心 */
    'ui.interactive': '交互中心',
    'ui.center': 'UI主页',

    'ui.center.team': '我的团队',
    'ui.team': '团队中心',
    'ui.team.project': '项目中心',

    'ui.technology': '技术中心',
    'ui.technology.framework': '架构中心',
    'ui.technology.realTime': '实时数据中心',
    'ui.technology.threeD': '3D动态管理',

    'ui.ai': 'AI中心',
    'ui.ai.chat': '智能聊天',


    'ui.menu': '菜单',

    /* 详情中心 */
    'detail.center': '详情中心',
    'detail_digital': '资产详情',

    /*管理平台*/
    'menu.manager': '管理平台',
    'menu.manager.user': '用户管理',
    'menu.manager.role': '角色管理',
    'menu.manager.permission': '权限管理',
    'menu.manager.department': '部门管理',

    /* 日志模块 */
    'menu.log': '日志模块',
    'menu.log.center': '日志管理中心',


    /* 工作流模块 */
    'menu.workFlow': '工作流',
    'menu.workFlow.approval_category': '审批分类',
    'menu.workFlow.workFlow_template': '审批模板',
    'menu.workFlow.workFlow_node': '审批节点',
    'menu.workFlow.approval_instance': '审批实例',
    'menu.workFlow.approval_record': '审批记录',

    /* 数据资产模块 */
    'menu.digital': '资产中心',
    'menu.digital.home': '数据资产' ,
    'menu.digital.file': '文件中心',

    /* 定时任务模块 */
    'menu.control': '控制中心',
    'menu.control.task': '定时任务',

    /* 数据监控模块 */
    'menu.cpMonitor.analyse': '数据分析中心',
    'menu.cpMonitor.data.collect': '数据采集',
    'menu.cpMonitor.data.mining': '数据挖掘',
    'menu.cpMonitor.data.trend.analyse': '预测分析',
    'menu.cpMonitor.data.cluster-analysis': '设备聚列分析',

    /* 报告中心 */
    'menu.report': '报告中心',
    'menu.report.home': '情况汇报',

    'menu.faq': '常见问题',
    'navbar.docs': '文档中心',
    'navbar.action.locale': '切换为中文',
    ...localeSettings,
    ...localeMessageBox,
    ...localeWorkplace,
    /** simple */
    ...localeMonitor,
    ...localeDataAnalysis,
    ...localeMultiDAnalysis,
    /** simple end */
}
