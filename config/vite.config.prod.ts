import { mergeConfig } from 'vite'
import configArcoResolverPlugin from './plugin/arcoResolver'
import configCompressPlugin from './plugin/compress'
import configVisualizerPlugin from './plugin/visualizer'
import baseConfig from './vite.config.base'
import vue from '@vitejs/plugin-vue'
import tsconfigPaths from 'vite-tsconfig-paths'

export default mergeConfig(
    {
        mode: 'production',
        plugins: [
            // 确保 Vue 插件存在
            vue(),
            // 使用 tsconfigPaths 插件来处理路径别名
            tsconfigPaths(),
            configCompressPlugin('gzip'),
            configVisualizerPlugin(),
            configArcoResolverPlugin()
        ],
        resolve: {
            // 定义路径别名，与 tsconfig.json 保持一致
            alias: {
                '@': '/src'
            }
        },
        build: {
            chunkSizeWarningLimit: 20480,
            reportCompressedSize: false,
            rollupOptions: {
                output: {
                    chunkFileNames: 'static/js/[name]-[hash].js',
                    entryFileNames: 'static/js/[name]-[hash].js',
                    assetFileNames: 'static/[ext]/[name]-[hash].[ext]'
                }
            },
            minify: 'esbuild',
            target: 'es2015',
            sourcemap: false,
            // 明确指定 TypeScript 配置
            typescript: {
                // 与 vue-tsc 使用相同的选项
                tsconfig: './tsconfig.json'
            }
        }
    },
    baseConfig
)
