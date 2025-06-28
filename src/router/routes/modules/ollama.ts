// import { AppRouteRecordRaw } from '@/router/routes/types'
// import { DEFAULT_LAYOUT } from '@/router/routes/base'
//
// const Ollama: AppRouteRecordRaw = {
//     path: '/ollama',
//     name: 'ollama',
//     component: DEFAULT_LAYOUT,
//     meta: {
//         locale: 'menu.ai',
//         requiresAuth: true,
//         icon: 'icon-list',
//         order: 6,
//     },
//     children: [
//         {
//             path: 'ai',
//             name: 'AI',
//             component: () => import('@/views/Ollama/index.vue'),
//             meta: {
//                 locale: 'menu.server',
//                 requiresAuth: true,
//                 roles: ['*'],
//             },
//         },
//         {
//             path: 'mateChat',
//             name: 'MateChat',
//             component: () => import('@/views/Ollama/MateChat/index.vue'),
//             meta: {
//                 locale: 'menu.server.mate',
//                 requiresAuth: true,
//                 roles: ['*'],
//             },
//         },
//     ],
// }
//
// export default Ollama
