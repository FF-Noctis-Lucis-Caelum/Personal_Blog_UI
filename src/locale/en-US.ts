import localeMessageBox from '@/components/message-box/locale/en-US'

/** simple */
import localeMonitor from '@/views/dashboard/monitor/locale/en-US'

import localeDataAnalysis from '@/views/visualization/data-analysis/locale/en-US'
import localeMultiDAnalysis from '@/views/visualization/multi-dimension-data-analysis/locale/en-US'

/** simple end */
import localeSettings from './en-US/settings'

export default {
    'menu.dashboard': 'Dashboard',
    'menu.server.dashboard': 'Dashboard-Server',
    'menu.server.workplace': 'Workplace-Server',
    'menu.server.monitor': 'Monitor-Server',
    'menu.list': 'List',
    'menu.result': 'Result',
    'menu.exception': 'Exception',
    'menu.form': 'Form',
    'menu.profile': 'Profile',
    'menu.visualization': 'Data Visualization',
    'menu.user': 'User Center',

    /* 管理模块 */
    'menu.manager': 'Manager Center',
    'menu.manager.user': 'User Manager',
    'menu.manager.role': 'Role Manager',
    'menu.manager.permission': 'Permission Manager',
    'menu.manager.department': 'Department Manager',

    /* 工作流模块 */
    'menu.workFlow': 'WorkFlow Center',
    'menu.workFlow.approval_category': 'Approval Category',
    'menu.workFlow.workFlow_template': 'WorkFlow Template',
    'menu.workFlow.workFlow_node': 'WorkFlow Node',
    'menu.workFlow.approval_instance': 'Approval Instance',
    'menu.workFlow.approval_record': 'Approval Record',

    'menu.arcoWebsite': 'Arco Design',
    'menu.faq': 'FAQ',
    'navbar.docs': 'Docs',
    'navbar.action.locale': 'Switch to English',
    ...localeSettings,
    ...localeMessageBox,
    /** simple */
    ...localeMonitor,
    ...localeDataAnalysis,
    ...localeMultiDAnalysis,
    /** simple end */
}
