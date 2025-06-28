import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import svgLoader from 'vite-svg-loader'
import configArcoStyleImportPlugin from './plugin/arcoStyleImport'
import {CommonConfig} from "../src/config";
import { Message } from '@arco-design/web-vue'

// 环境变量处理（开发环境优先）
const API_BASE =
    process.env.VITE_API_BASE_URL ||
    process.env.npm_config_api_base ||  // 支持 npm run dev --api_base=http://xxx
    CommonConfig.dev

export default defineConfig( {
    base: './',
    plugins: [vue(), vueJsx(), svgLoader({ svgoConfig: {} }), configArcoStyleImportPlugin()],
    resolve: {
        alias: [
            {
                find: '@',
                replacement: resolve(__dirname, '../src'),
            },
            {
                find: 'assets',
                replacement: resolve(__dirname, '../src/assets'),
            },
            {
                find: 'vue-i18n',
                replacement: 'vue-i18n/dist/vue-i18n.cjs.js', // Resolve the i18n warning issue
            },
            {
                find: 'vue',
                replacement: 'vue/dist/vue.esm-bundler.js', // compile template
            },
        ],
        extensions: ['.ts', '.js'],
    },
    define: {
        'process.env': {},
        // 添加默认值保障
        'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
            process.env.VITE_API_BASE_URL || 'http://localhost:9090/'
        )
    },
    css: {
        preprocessorOptions: {
            less: {
                modifyVars: {
                    hack: `true; @import (reference) "${resolve('src/assets/style/breakpoint.less')}";`,
                },
                javascriptEnabled: true,
            },
            scss: {
                api: 'modern-compiler',
            },
        },
    },
    server: {
        proxy: {
            '/api': {
                target: CommonConfig.gateway,
                changeOrigin: true,
                rewrite: path => path.replace(/^\/api/, ''),
                // 开发环境代理校验
                configure: (proxy) => {
                    proxy.on('error', (err) => {
                        console.error('🚨 代理服务器错误:', err)
                        Message.error('开发服务器连接异常，请检查后端服务')
                    })
                }
            },
            '/ai': {
                target: CommonConfig.ai,
                changeOrigin: true,
                rewrite: path => path.replace(/^\/ai/, ''),
                // 开发环境代理校验
                configure: (proxy) => {
                    proxy.on('error', (err) => {
                        console.error('🚨 代理服务器错误:', err)
                        Message.error('开发服务器连接异常，请检查后端服务')
                    })
                }
            },
        }
    }
})
