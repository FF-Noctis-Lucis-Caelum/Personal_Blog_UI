import { inject, Ref, ref } from 'vue'

type ChartTheme = 'light' | 'dark'

// 通过Vue提供全局配置
const THEME_SYMBOL = Symbol('chartTheme')

export const useGlobalTheme = () => {
    const globalTheme = inject<Ref<ChartTheme>>(THEME_SYMBOL, ref('light'))
    return { globalTheme }
}

// 在应用入口提供配置
// app.provide(THEME_SYMBOL, ref('dark'))
