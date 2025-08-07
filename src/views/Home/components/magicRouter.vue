<script setup lang="ts">
import {nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {Message} from "@arco-design/web-vue";
import 'animate.css/animate.min.css';

// 国际化配置
const { t } = useI18n();

// 博客路由导航结构
const navItems = ref([
    {
        name: 'home',
        label: 'nav.home',
        icon: 'fa-house-chimney'
    },
    {
        name: 'articles',
        label: 'nav.articles',
        icon: 'fa-book-open',
        children: [
            { name: 'articles-latest', label: 'nav.latest', icon: 'fa-clock-rotate-left' },
            { name: 'articles-popular', label: 'nav.popular', icon: 'fa-fire-flame-curved' },
            { name: 'articles-archive', label: 'nav.archive', icon: 'fa-box-archive' }
        ]
    },
    {
        name: 'categories',
        label: 'nav.categories',
        icon: 'fa-folder-tree',
        children: [
            { name: 'category-tech', label: 'nav.tech', icon: 'fa-microchip' },
            { name: 'category-life', label: 'nav.life', icon: 'fa-heart' },
            { name: 'category-study', label: 'nav.study', icon: 'fa-graduation-cap' }
        ]
    },
    {
        name: 'tags',
        label: 'nav.tags',
        icon: 'fa-tags'
    },
    {
        name: 'about',
        label: 'nav.about',
        icon: 'fa-user-secret'
    }
]);

const router = useRouter();
const currentNavItem = ref('');

// 路由变化时更新导航状态
watch(() => router.currentRoute.value.name, (newVal) => {
    const matchedItem = findActiveNavItem(newVal as string, navItems.value);
    currentNavItem.value = matchedItem?.label || '';
});

// 查找激活的导航项
const findActiveNavItem = (routeName: string, items: any[]): any => {
    for (const item of items) {
        if (item.name === routeName) return item;
        if (item.children) {
            const childMatch = item.children.find((child: any) => child.name === routeName);
            if (childMatch) return item;
        }
    }
    return null;
};

// 折叠状态
const isCollapsed = ref(true);
const changeCollapsed = () => {
    isCollapsed.value = !isCollapsed.value;
    if (isCollapsed.value) {
        isSearchExpanded.value = false;
        searchQuery.value = '';
        activeDropdown.value = null;
        isThemePanelOpen.value = false;
        searchResults.value = []; // 关闭菜单时清空搜索结果
    }
};

// 搜索功能 - 实时检索实现
const searchQuery = ref('');
const isSearchExpanded = ref(false);
const searchInputRef = ref<HTMLInputElement>(null);
const searchResults = ref<any[]>([]);
const isSearching = ref(false);
const selectedResultIndex = ref(-1);

// 防抖函数 - 减少API请求次数
const debounce = (func: Function, delay: number) => {
    let timeoutId: number | null = null;
    return (...args: any[]) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

// 【修复1：完善错误处理和状态重置】
const performSearch = async (query: string) => {
    // 确保每次搜索前重置状态
    isSearching.value = true;
    searchResults.value = [];

    if (query.trim().length < 2) {
        isSearching.value = false; // 立即重置状态
        return;
    }

    try {
        console.log('开始搜索:', query);
        const mockResults = await mockSearchAPI(query);
        console.log('搜索结果:', mockResults);

        // 确保在DOM更新前设置结果
        await nextTick(() => {
            searchResults.value = mockResults;
            isSearching.value = false;
        });
    } catch (error) {
        console.error('搜索失败:', error);
        Message.error(t('search.error'));
        isSearching.value = false; // 错误时也需要重置
    }
};


// 防抖处理后的搜索函数
const debouncedSearch = debounce(performSearch, 300);

// 监听搜索输入变化
watch(searchQuery, (newVal) => {
    debouncedSearch(newVal);
});

// 【修复2：改进模拟API，确保可靠返回】
const mockSearchAPI = (query: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        // 模拟网络延迟
        const timer = setTimeout(() => {
            clearTimeout(timer);

            // 模拟极端情况的错误处理
            if (!query || query.length < 1) {
                reject(new Error('无效的搜索关键词'));
                return;
            }

            // 生成模拟结果
            const results = [
                // 文章结果
                {
                    id: 1,
                    title: `如何理解${query}的文化背景`,
                    type: 'article',
                    route: 'article',
                    params: { id: 1 },
                    excerpt: `本文探讨了${query}的文化起源和发展历程...`,
                    date: '2023-05-15'
                },
                {
                    id: 2,
                    title: `${query}旅游指南`,
                    type: 'article',
                    route: 'article',
                    params: { id: 2 },
                    excerpt: `这是一份详细的${query}旅游攻略，包含必去景点和美食推荐...`,
                    date: '2023-06-20'
                },
                // 标签结果
                {
                    id: 101,
                    name: query,
                    type: 'tag',
                    route: 'tag',
                    params: { name: query },
                    count: 15
                },
                {
                    id: 102,
                    name: `${query}历史`,
                    type: 'tag',
                    route: 'tag',
                    params: { name: `${query}历史` },
                    count: 8
                },
                // 分类结果
                {
                    id: 201,
                    name: `${query}文化`,
                    type: 'category',
                    route: 'category',
                    params: { name: `${query}文化` },
                    count: 23
                }
            ];
            resolve(results);
        }, 300);
    });
};

// 关键词高亮函数
const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
};

// 处理搜索结果点击
const handleResultClick = (result: any) => {
    router.push({ name: result.route, params: result.params });
    searchQuery.value = '';
    searchResults.value = [];
    isCollapsed.value = true;
};

// 键盘导航处理
const handleKeydown = (e: KeyboardEvent) => {
    // 上下箭头导航
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedResultIndex.value = (selectedResultIndex.value + 1) % searchResults.value.length;
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedResultIndex.value = (selectedResultIndex.value - 1 + searchResults.value.length) % searchResults.value.length;
    }
    // 回车选中
    else if (e.key === 'Enter' && selectedResultIndex.value !== -1) {
        e.preventDefault();
        handleResultClick(searchResults.value[selectedResultIndex.value]);
    }
    // ESC清除
    else if (e.key === 'Escape') {
        searchQuery.value = '';
        searchResults.value = [];
        selectedResultIndex.value = -1;
    }
};

// 搜索框聚焦/失焦处理
const toggleSearch = (event?: MouseEvent) => {
    if (event) event.stopPropagation();
    isSearchExpanded.value = !isSearchExpanded.value;
    if (isSearchExpanded.value) {
        nextTick(() => {
            searchInputRef.value?.focus();
        });
    } else {
        // 失焦时不清空，保持用户输入
        selectedResultIndex.value = -1;
    }
};

const handleSearch = (e?: KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    if (searchQuery.value.trim()) {
        // 如果有选中的结果，直接跳转
        if (selectedResultIndex.value !== -1 && searchResults.value.length > 0) {
            handleResultClick(searchResults.value[selectedResultIndex.value]);
        } else {
            // 否则跳转到搜索结果页
            router.push({ name: 'search', query: { q: searchQuery.value.trim() } });
            searchQuery.value = '';
            searchResults.value = [];
            isCollapsed.value = true;
        }
    }
};

// 下拉菜单状态管理
const activeDropdown = ref<string | null>(null);
const isMouseOverDropdown = ref(false);

const showDropdown = (itemLabel: string, event: MouseEvent) => {
    event.stopPropagation();
    activeDropdown.value = itemLabel;
};

const hideDropdown = () => {
    const timer = setTimeout(() => {
        if (!isMouseOverDropdown.value) {
            activeDropdown.value = null;
        }
    }, 200);
    return () => clearTimeout(timer);
};

// 路由跳转
const navTo = (name: string) => {
    if (router.hasRoute(name)) {
        router.push({ name });
        // 关闭菜单和搜索框
        isCollapsed.value = true;
        isSearchExpanded.value = false;
        searchQuery.value = '';
        searchResults.value = [];
    } else {
        Message.error(t('message.pageNotFound'));
    }
};

// 主题相关状态管理
const isThemePanelOpen = ref(false);
const currentTheme = ref('purple');
const themeSaved = ref(false);

// 预设主题配置
const themes = ref([
    {
        id: 'purple',
        name: '优雅紫色',
        colors: {
            primary: '#7c3aed',
            primaryLight: '#a855f7',
            accent: '#ec4899',
            textPrimary: '#f5f3ff',
            textSecondary: '#c4b5fd',
            textTertiary: '#a78bfa',
            bgOverlay: '#0f172a',
            bgHighlight: 'rgba(124, 58, 237, 0.15)',
            shadow: '0 4px 30px rgba(124, 58, 237, 0.15)'
        }
    },
    {
        id: 'blue',
        name: '冷静蓝色',
        colors: {
            primary: '#3b82f6',
            primaryLight: '#60a5fa',
            accent: '#06b6d4',
            textPrimary: '#f8fafc',
            textSecondary: '#bfdbfe',
            textTertiary: '#93c5fd',
            bgOverlay: '#0f172a',
            bgHighlight: 'rgba(59, 130, 246, 0.15)',
            shadow: '0 4px 30px rgba(59, 130, 246, 0.15)'
        }
    },
    {
        id: 'green',
        name: '自然绿色',
        colors: {
            primary: '#10b981',
            primaryLight: '#34d399',
            accent: '#f59e0b',
            textPrimary: '#f0fdf4',
            textSecondary: '#a7f3d0',
            textTertiary: '#6ee7b7',
            bgOverlay: '#0f172a',
            bgHighlight: 'rgba(16, 185, 129, 0.15)',
            shadow: '0 4px 30px rgba(16, 185, 129, 0.15)'
        }
    },
    {
        id: 'dark',
        name: '深邃暗黑',
        colors: {
            primary: '#4f46e5',
            primaryLight: '#6366f1',
            accent: '#8b5cf6',
            textPrimary: '#e2e8f0',
            textSecondary: '#94a3b8',
            textTertiary: '#64748b',
            bgOverlay: '#020617',
            bgHighlight: 'rgba(79, 70, 229, 0.15)',
            shadow: '0 4px 30px rgba(79, 70, 229, 0.2)'
        }
    }
]);

// 当前自定义颜色
const customColors = ref({...themes.value[0].colors});

// 应用主题颜色到CSS变量
const applyTheme = (themeColors: any) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', themeColors.primary);
    root.style.setProperty('--primary-light', themeColors.primaryLight);
    root.style.setProperty('--accent', themeColors.accent);
    root.style.setProperty('--text-primary', themeColors.textPrimary);
    root.style.setProperty('--text-secondary', themeColors.textSecondary);
    root.style.setProperty('--text-tertiary', themeColors.textTertiary);
    root.style.setProperty('--bg-overlay', themeColors.bgOverlay);
    root.style.setProperty('--bg-highlight', themeColors.bgHighlight);
    root.style.setProperty('--shadow', themeColors.shadow);
};

// 切换预设主题
const switchTheme = (themeId: string) => {
    const theme = themes.value.find(t => t.id === themeId);
    if (theme) {
        currentTheme.value = themeId;
        customColors.value = {...theme.colors};
        applyTheme(theme.colors);
        themeSaved.value = false;
    }
};

// 更新自定义颜色
const updateCustomColor = (key: string, value: string) => {
    customColors.value[key] = value;
    applyTheme(customColors.value);
    currentTheme.value = 'custom';
    themeSaved.value = false;
};

// 保存主题到localStorage
const saveThemeToLocalStorage = () => {
    try {
        const themeData = {
            currentTheme: currentTheme.value,
            colors: customColors.value,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('blogThemeSettings', JSON.stringify(themeData));
        themeSaved.value = true;

        setTimeout(() => {
            themeSaved.value = false;
        }, 2000);

        Message.success(t('theme.saveSuccess'));
    } catch (error) {
        console.error('Failed to save theme:', error);
        Message.error(t('theme.saveError'));
    }
};

// 从localStorage加载主题
const loadThemeFromLocalStorage = () => {
    try {
        const savedTheme = localStorage.getItem('blogThemeSettings');
        if (savedTheme) {
            const themeData = JSON.parse(savedTheme);
            currentTheme.value = themeData.currentTheme;
            customColors.value = themeData.colors;
            applyTheme(themeData.colors);
            return true;
        }
    } catch (error) {
        console.error('Failed to load theme:', error);
    }
    return false;
};

// 清除保存的主题
const clearSavedTheme = () => {
    localStorage.removeItem('blogThemeSettings');
    switchTheme('purple');
    themeSaved.value = false;
    Message.info(t('theme.clearSuccess'));
};

// 点击外部关闭搜索结果
const handleClickOutside = (event: MouseEvent) => {
    if (searchInputRef.value && !searchInputRef.value.contains(event.target as Node) &&
        !document.querySelector('.search-results')?.contains(event.target as Node)) {
        searchResults.value = [];
        selectedResultIndex.value = -1;
    }
};

// 初始化
onMounted(() => {
    // 初始化导航状态
    const initialMatch = findActiveNavItem(router.currentRoute.value.name as string, navItems.value);
    currentNavItem.value = initialMatch?.label || 'nav.home';

    // 尝试加载保存的主题
    const themeLoaded = loadThemeFromLocalStorage();
    if (!themeLoaded) {
        applyTheme(themes.value[0].colors);
    }

    // 事件监听
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', () => {
        if (!isMouseOverDropdown.value) {
            activeDropdown.value = null;
        }
    });
});

// 清理事件监听
onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
    <div class="navContainer">
        <!-- 全局菜单按钮 -->
        <button
            class="menu-toggle"
            :class="{ 'is-active': !isCollapsed }"
            @click="changeCollapsed"
            aria-label="切换菜单"
        >
            <i class="fas fa-bars" v-if="isCollapsed"></i>
            <i class="fas fa-times" v-else></i>
        </button>

        <!-- 全屏遮罩菜单 -->
        <transition
            enter-active-class="animate__animated animate__slideInDown"
            leave-active-class="animate__animated animate__slideOutUp"
        >
            <div v-show="!isCollapsed" class="fullscreen-overlay">
                <!-- 主题设置按钮 -->
                <button
                    class="theme-settings-button"
                    @click.stop="isThemePanelOpen = !isThemePanelOpen"
                    aria-label="主题设置"
                >
                    <i class="fas fa-palette"></i>
                </button>

                <!-- 主题设置面板 -->
                <transition
                    enter-active-class="animate__animated animate__slideInRight"
                    leave-active-class="animate__animated animate__slideOutRight"
                >
                    <div v-if="isThemePanelOpen" class="theme-panel" @click.stop>
                        <div class="theme-panel-header">
                            <h3 class="panel-title">{{ t('theme.title') }}</h3>
                            <button
                                class="close-panel"
                                @click="isThemePanelOpen = false"
                                aria-label="关闭主题面板"
                            >
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <!-- 预设主题选择 -->
                        <div class="theme-section">
                            <h4 class="section-title">{{ t('theme.presets') }}</h4>
                            <div class="preset-themes">
                                <div
                                    v-for="theme in themes"
                                    :key="theme.id"
                                    class="preset-theme"
                                    :class="{ 'active': currentTheme === theme.id }"
                                    @click="switchTheme(theme.id)"
                                >
                                    <div class="theme-color-indicator" :style="{ backgroundColor: theme.colors.primary }"></div>
                                    <span class="theme-name">{{ theme.name }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- 自定义颜色设置 -->
                        <div class="theme-section">
                            <h4 class="section-title">{{ t('theme.custom') }}</h4>
                            <div class="color-options">
                                <div class="color-option">
                                    <label class="color-label">{{ t('theme.primary') }}</label>
                                    <div class="color-control">
                                        <input
                                            type="color"
                                            :value="customColors.primary"
                                            @input="updateCustomColor('primary', $event.target.value)"
                                            class="color-picker"
                                        >
                                        <input
                                            type="text"
                                            :value="customColors.primary"
                                            @input="updateCustomColor('primary', $event.target.value)"
                                            class="color-value"
                                        >
                                    </div>
                                </div>

                                <div class="color-option">
                                    <label class="color-label">{{ t('theme.primaryLight') }}</label>
                                    <div class="color-control">
                                        <input
                                            type="color"
                                            :value="customColors.primaryLight"
                                            @input="updateCustomColor('primaryLight', $event.target.value)"
                                            class="color-picker"
                                        >
                                        <input
                                            type="text"
                                            :value="customColors.primaryLight"
                                            @input="updateCustomColor('primaryLight', $event.target.value)"
                                            class="color-value"
                                        >
                                    </div>
                                </div>

                                <div class="color-option">
                                    <label class="color-label">{{ t('theme.accent') }}</label>
                                    <div class="color-control">
                                        <input
                                            type="color"
                                            :value="customColors.accent"
                                            @input="updateCustomColor('accent', $event.target.value)"
                                            class="color-picker"
                                        >
                                        <input
                                            type="text"
                                            :value="customColors.accent"
                                            @input="updateCustomColor('accent', $event.target.value)"
                                            class="color-value"
                                        >
                                    </div>
                                </div>

                                <div class="color-option">
                                    <label class="color-label">{{ t('theme.bgOverlay') }}</label>
                                    <div class="color-control">
                                        <input
                                            type="color"
                                            :value="customColors.bgOverlay"
                                            @input="updateCustomColor('bgOverlay', $event.target.value)"
                                            class="color-picker"
                                        >
                                        <input
                                            type="text"
                                            :value="customColors.bgOverlay"
                                            @input="updateCustomColor('bgOverlay', $event.target.value)"
                                            class="color-value"
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 主题操作按钮组 -->
                        <div class="theme-actions">
                            <button
                                class="clear-button"
                                @click="clearSavedTheme"
                            >
                                {{ t('theme.clear') }}
                            </button>
                            <button
                                class="save-button"
                                @click="saveThemeToLocalStorage"
                                :class="{ 'saved': themeSaved }"
                            >
                                <i class="fas fa-check" v-if="themeSaved"></i>
                                {{ themeSaved ? t('theme.saved') : t('theme.save') }}
                            </button>
                        </div>
                    </div>
                </transition>

                <!-- 菜单内容容器 -->
                <div class="menu-content">
                    <!-- Logo -->
                    <div class="logo" @click="navTo('home')">
                        <span class="logo-text">{{ t('blog.title') }}</span>
                        <span class="logo-sub">Insights</span>
                    </div>

                    <div class="search-section" @click.stop>
                        <div class="search-wrapper">
                            <!-- 搜索输入框 -->
                            <input
                                ref="searchInputRef"
                                v-model="searchQuery"
                                type="text"
                                :placeholder="t('search.placeholder')"
                                class="search-input"
                                @keyup.enter="handleSearch"
                                :class="{ focused: isSearchExpanded || searchQuery }"
                                @focus="isSearchExpanded = true"
                                @blur="!searchQuery && (isSearchExpanded = false)"
                            >
                            <!-- 搜索按钮等 -->
                            <button class="search-button" @click="handleSearch" aria-label="搜索">
                                <i class="fas fa-search"></i>
                            </button>
                            <button
                                v-if="searchQuery"
                                class="clear-button"
                                @click="searchQuery = ''"
                                aria-label="清空搜索"
                            >
                                <i class="fas fa-times"></i>
                            </button>
                            <div class="search-underline" :class="{ expanded: isSearchExpanded || searchQuery }"></div>
                        </div>

                        <!-- 实时搜索结果展示 - 修复条件判断 -->
                        <transition
                            enter-active-class="animate__animated animate__fadeIn animate__fast"
                            leave-active-class="animate__animated animate__fadeOut animate__fast"
                        >
                            <div
                                v-if="(isSearching || searchResults.length > 0) && (isSearchExpanded || searchQuery)"
                                class="search-results"
                            >
                                <!-- 加载状态 -->
                                <div v-if="isSearching" class="search-loading">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    <span>{{ t('search.searching') }}</span>
                                </div>

                                <!-- 无结果状态 (仅当不加载且结果为空时) -->
                                <div v-else-if="searchResults.length === 0" class="search-no-results">
                                    <i class="fas fa-search"></i>
                                    <span>{{ t('search.noResults') }}</span>
                                </div>

                                <!-- 搜索结果列表 -->
                                <div v-else class="search-results-list">
                                    <!-- 文章结果分组 -->
                                    <div v-if="searchResults.some(r => r.type === 'article')" class="results-group">
                                        <h5 class="results-group-title">{{ t('search.articles') }}</h5>
                                        <div class="results-group-items">
                                            <div
                                                v-for="result in searchResults.filter(r => r.type === 'article')"
                                                :key="result.id"
                                                class="search-result-item"
                                                :class="{ 'selected': selectedResultIndex === searchResults.indexOf(result) }"
                                                @click="handleResultClick(result)"
                                            >
                                                <div class="result-type-icon">
                                                    <i class="fas fa-file-alt"></i>
                                                </div>
                                                <div class="result-content">
                                                    <div class="result-title" v-html="highlightMatch(result.title, searchQuery)"></div>
                                                    <div class="result-excerpt" v-html="highlightMatch(result.excerpt, searchQuery)"></div>
                                                    <div class="result-meta">
                                                        <i class="fas fa-calendar-alt"></i>
                                                        <span>{{ result.date }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- 标签结果分组 -->
                                    <div v-if="searchResults.some(r => r.type === 'tag')" class="results-group">
                                        <!-- 标签展示 -->
                                    </div>

                                    <!-- 分类结果分组 -->
                                    <div v-if="searchResults.some(r => r.type === 'category')" class="results-group">
                                        <!-- 分类展示 -->
                                    </div>

                                    <!-- 查看全部结果 -->
                                    <div class="view-all-results">
                                        <button @click="handleSearch">
                                            {{ t('search.viewAllResults', { query: searchQuery }) }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </transition>
                    </div>

                    <!-- 主导航项 -->
                    <nav class="main-nav">
                        <div
                            v-for="item in navItems"
                            :key="item.label"
                            class="nav-item"
                            @click.stop
                        >
                            <div
                                class="nav-link-container"
                                @mouseenter="showDropdown(item.label, $event)"
                                @mouseleave="hideDropdown"
                                @click="!item.children && navTo(item.name)"
                            >
                <span class="nav-link" :class="{ active: currentNavItem === item.label }">
                    <!-- 菜单项图标 -->
                    <i class="fas nav-icon" :class="item.icon"></i>
                    {{ t(item.label) }}
                    <i class="fas fa-chevron-down dropdown-indicator" v-if="item.children"></i>
                </span>
                            </div>

                            <!-- 下拉菜单（带子项图标） -->
                            <transition name="dropdown">
                                <div
                                    v-if="item.children && activeDropdown === item.label"
                                    class="dropdown-menu"
                                    @mouseenter="isMouseOverDropdown = true"
                                    @mouseleave="isMouseOverDropdown = false; hideDropdown()"
                                >
                                    <a
                                        v-for="subItem in item.children"
                                        :key="subItem.name"
                                        class="dropdown-item"
                                        @click="navTo(subItem.name)"
                                    >
                                        <i class="fas sub-icon" :class="subItem.icon"></i>
                                        {{ t(subItem.label) }}
                                    </a>
                                </div>
                            </transition>
                        </div>
                    </nav>

                    <!-- 底部信息（艺术字体） -->
                    <div class="menu-footer">
                        <p>{{ t('blog.copyright') }}</p>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped lang="scss">
@use '@/assets/style/global.scss' as *;
// 核心变量
$transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

// 艺术字体核心样式
@mixin artistic-font {
    font-family: "Segoe Print", "Bradley Hand", cursive, "Brush Script MT", serif;
    letter-spacing: 0.05em;
    text-shadow: 1px 1px 3px rgba(124, 58, 237, 0.3);
    transition: all 0.3s ease;
}

// 主题设置按钮
.theme-settings-button {
    position: fixed;
    top: 1.5rem;
    left: 1.5rem;
    z-index: 1002;
    @include BoxSize(40px, 40px);
    cursor: pointer;
    border: none;
    border-radius: 50%;
    //background: rgba(30, 41, 59, 0.9);
    background: rgba(47, 103, 195, 0.9);
    color: var(--text-primary);
    transition: $transition;
    box-shadow: var(--shadow);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;

    &:hover {
        transform: scale(1.1) rotate(10deg);
        background: var(--primary);
        box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
    }

    @media (max-width: 576px) {
        width: 42px;
        height: 42px;
        top: 1rem;
        left: 1rem;
    }
}

// 主题设置面板
.theme-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: 400px;
    background: var(--bg-overlay);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 1003;
    padding: 2rem;
    overflow-y: auto;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);

    @media (max-width: 576px) {
        max-width: 100%;
        padding: 1.5rem;
    }
}

.theme-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.5rem;
    @include artistic-font;
}

.close-panel {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 1.2rem;
    cursor: pointer;
    transition: $transition;

    &:hover {
        color: var(--accent);
        transform: rotate(90deg);
    }
}

.theme-section {
    margin-bottom: 2rem;

    &:last-child {
        margin-bottom: 3rem;
    }
}

.section-title {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
    font-size: 1.2rem;
    @include artistic-font;
}

// 预设主题选择
.preset-themes {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.preset-theme {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    cursor: pointer;
    transition: $transition;
    border: 1px solid transparent;

    &:hover {
        background: var(--bg-highlight);
        transform: translateY(-3px);
    }

    &.active {
        border-color: var(--primary);
        background: var(--bg-highlight);
        box-shadow: var(--shadow);
    }
}

.theme-color-indicator {
    width: 16px;
    height: 16px;
    border-radius: 50%;
}

.theme-name {
    color: var(--text-secondary);
    @include artistic-font;
}

// 自定义颜色设置
.color-options {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.color-option {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.color-label {
    color: var(--text-secondary);
    font-size: 0.95rem;
    @include artistic-font;
}

.color-control {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

.color-picker {
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    padding: 0;
    background: transparent;
    transition: $transition;

    &:hover {
        transform: scale(1.1);
    }
}

.color-value {
    flex: 1;
    height: 48px;
    padding: 0 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: var(--text-primary);
    outline: none;
    transition: $transition;
    @include artistic-font;

    &:focus {
        border-color: var(--primary);
        background: rgba(255, 255, 255, 0.1);
    }
}

// 主题操作按钮
.theme-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.save-button {
    padding: 0.75rem 1.5rem;
    background: var(--primary);
    border: 1px solid var(--primary);
    color: var(--text-primary);
    border-radius: 6px;
    cursor: pointer;
    transition: $transition;
    @include artistic-font;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: var(--primary-light);
        transform: translateY(-2px);
    }

    &.saved {
        background: #10b981;
        border-color: #10b981;
    }
}

.clear-button {
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: 1px solid var(--text-tertiary);
    color: var(--text-tertiary);
    border-radius: 6px;
    cursor: pointer;
    transition: $transition;
    @include artistic-font;

    &:hover {
        color: var(--text-primary);
        border-color: var(--text-primary);
        transform: translateY(-2px);
    }
}

.navContainer {
    // 所有可交互元素指针样式
    .menu-toggle, .logo, .nav-link, .dropdown-item, .search-button, .clear-button {
        cursor: pointer !important;
    }

    // 菜单按钮
    .menu-toggle {
        position: fixed;
        top: 1.5rem;
        right: 1.5rem;
        z-index: 1001;
        @include BoxSize(36px, 36px);
        border: none;
        border-radius: 50%;
        //background: rgba(30, 41, 59, 0.9);
        background: rgba(170, 192, 223, 0.9);
        color: var(--text-primary);
        transition: $transition;
        box-shadow: var(--shadow);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;

        &:hover {
            transform: scale(1.1) rotate(5deg);
            background: var(--primary);
            box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
        }

        &.is-active {
            background: var(--accent);
            transform: rotate(90deg);
        }

        @media (max-width: 576px) {
            width: 42px;
            height: 42px;
            top: 1rem;
            right: 1rem;
        }
    }

    // 全屏遮罩
    .fullscreen-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
        background: var(--bg-overlay);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background-image:
            radial-gradient(circle at 20% 30%, rgba(124, 58, 237, 0.1) 0%, transparent 20%),
            radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 20%);
    }

    // 菜单内容容器
    .menu-content {
        width: 100%;
        max-width: 1200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4rem;
        position: relative;
    }

    // Logo
    .logo {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 0;
        @include artistic-font;

        .logo-text {
            font-size: 2.8rem;
            font-weight: 600;
            color: var(--text-primary);
            transform: skewX(-5deg);
            letter-spacing: 0.1em;

            &:hover {
                transform: skewX(-5deg) scale(1.05);
                color: var(--primary-light);
            }
        }

        .logo-sub {
            font-size: 1.2rem;
            color: var(--text-secondary);
            position: relative;
            padding-left: 1.5rem;
            transform: skewX(5deg);

            &::before {
                content: '·';
                position: absolute;
                left: 0;
                color: var(--accent);
                font-size: 2rem;
            }

            &:hover {
                color: var(--accent);
            }
        }

        @media (max-width: 768px) {
            .logo-text {
                font-size: 2.2rem;
            }
            .logo-sub {
                display: none;
            }
        }
    }

    // 搜索区域 - 带实时检索样式
    .search-section {
        width: 100%;
        max-width: 600px;
        padding: 1rem 0;
        position: relative;

        .search-wrapper {
            position: relative;
            width: 100%;
            display: flex;
            align-items: center;
        }

        .search-input {
            width: 100%;
            height: 52px;
            padding: 0 55px 0 15px;
            background: transparent;
            border: none;
            color: var(--text-primary);
            font-size: 1.1rem;
            outline: none;
            transition: $transition;
            @include artistic-font;

            &::placeholder {
                color: var(--text-tertiary);
                font-size: 1rem;
                letter-spacing: 0.08em;
            }

            &.focused {
                padding-right: 85px;
            }
        }

        .search-button {
            position: absolute;
            right: 0;
            width: 52px;
            height: 52px;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            transition: $transition;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;

            &:hover {
                color: var(--primary-light);
                transform: rotate(15deg);
            }
        }

        .clear-button {
            position: absolute;
            right: 52px;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: none;
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-secondary);
            transition: $transition;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transform: translateX(10px);
            pointer-events: none;

            .search-input.focused & {
                opacity: 1;
                transform: translateX(0);
                pointer-events: all;
            }

            &:hover {
                color: var(--text-primary);
                background: rgba(255, 255, 255, 0.2);
                transform: rotate(90deg);
            }
        }

        .search-underline {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 60px;
            height: 2px;
            background: var(--text-tertiary);
            transition: $transition;

            &.expanded {
                width: 100%;
                background: linear-gradient(90deg, var(--primary), var(--accent));
                height: 2px;
            }
        }

        // 实时搜索结果样式
        .search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-overlay);
            border-radius: 8px;
            margin-top: 8px;
            box-shadow: var(--shadow);
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 1005;
            overflow: hidden;
            max-height: 400px;
            overflow-y: auto;
        }

        .search-loading, .search-no-results {
            padding: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: var(--text-secondary);

            i {
                font-size: 1.2rem;
                color: var(--primary-light);
            }
        }

        .search-results-list {
            padding: 0.5rem 0;
        }

        .results-group {
            margin-bottom: 1rem;

            &:last-child {
                margin-bottom: 0;
            }
        }

        .results-group-title {
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-tertiary);
            margin: 0 0 0.5rem 1.5rem;
            padding-top: 0.5rem;
        }

        .results-group-items {
            padding: 0 0.5rem;
        }

        .search-result-item {
            padding: 0.8rem 1.5rem;
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            cursor: pointer;
            transition: $transition;

            &:hover {
                background: var(--bg-highlight);
            }

            &.selected {
                background: rgba(124, 58, 237, 0.2);
            }

            .result-type-icon {
                margin-top: 0.25rem;
                color: var(--primary-light);
                width: 1.5rem;
                text-align: center;
            }

            .result-content {
                flex: 1;
            }

            .result-title {
                color: var(--text-primary);
                margin-bottom: 0.25rem;
                @include artistic-font;

                .highlight {
                    color: var(--accent);
                    font-weight: bold;
                    text-decoration: underline;
                    text-underline-offset: 2px;
                }
            }

            .result-excerpt {
                font-size: 0.9rem;
                color: var(--text-secondary);
                margin-bottom: 0.25rem;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;

                .highlight {
                    color: var(--primary-light);
                    font-weight: bold;
                }
            }

            .result-meta {
                font-size: 0.8rem;
                color: var(--text-tertiary);
                display: flex;
                align-items: center;
                gap: 0.5rem;

                i {
                    font-size: 0.75rem;
                }
            }
        }

        .view-all-results {
            padding: 1rem 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;

            button {
                background: transparent;
                border: none;
                color: var(--primary-light);
                cursor: pointer;
                transition: $transition;
                @include artistic-font;

                &:hover {
                    color: var(--primary);
                    transform: scale(1.05);
                }
            }
        }
    }

    // 主导航菜单
    .main-nav {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem;
        padding: 1rem 0;
        width: 100%;
        max-width: 1000px;
    }

    // 导航项样式
    .nav-item {
        position: relative;
        padding: 0.5rem;
    }

    .nav-link-container {
        position: relative;
    }

    .nav-link {
        display: inline-flex;
        align-items: center;
        gap: 0.8rem;
        padding: 0.9rem 1.5rem;
        color: var(--text-secondary);
        font-size: 1.15rem;
        border-radius: 10px;
        transition: $transition;
        @include artistic-font;

        .nav-icon {
            color: var(--primary-light);
            font-size: 1.25rem;
            width: 1.5rem;
            transition: $transition;
        }

        &.active {
            color: var(--text-primary);
            background: var(--bg-highlight);

            .nav-icon {
                color: var(--accent);
                transform: scale(1.2);
            }
        }

        &:hover:not(.active) {
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.07);
            transform: translateY(-5px) scale(1.02);

            .nav-icon {
                color: var(--primary);
                transform: rotate(10deg);
            }

            .dropdown-indicator {
                transform: translateY(2px);
            }
        }

        .dropdown-indicator {
            font-size: 0.7rem;
            opacity: 0.7;
            transition: $transition;
            margin-left: 0.3rem;
        }
    }

    // 下拉菜单
    .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        min-width: 220px;
        background: rgba(15, 23, 42, 0.98);
        border-radius: 10px;
        padding: 0.75rem 0;
        z-index: 1010;
        box-shadow: var(--shadow);
        margin-top: 0.75rem;
        border: 1px solid rgba(124, 58, 237, 0.2);

        &::before {
            content: '';
            position: absolute;
            top: -5px;
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            width: 10px;
            height: 10px;
            background: rgba(15, 23, 42, 0.98);
            border-top: 1px solid rgba(124, 58, 237, 0.2);
            border-left: 1px solid rgba(124, 58, 237, 0.2);
        }

        .dropdown-item {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            width: 100%;
            padding: 0.8rem 1.5rem;
            color: var(--text-secondary);
            transition: $transition;
            font-size: 1rem;
            @include artistic-font;

            .sub-icon {
                color: var(--text-tertiary);
                font-size: 1rem;
                width: 1.25rem;
                transition: $transition;
            }

            &:hover {
                color: var(--text-primary);
                background: var(--bg-highlight);
                padding-left: 1.75rem;

                .sub-icon {
                    color: var(--primary-light);
                    transform: rotate(-5deg);
                }
            }
        }
    }

    // 底部信息
    .menu-footer {
        padding: 2rem 0 1rem;
        color: var(--text-tertiary);
        font-size: 0.95rem;
        letter-spacing: 0.1em;
        @include artistic-font;

        p {
            margin: 0;
            opacity: 0.8;
            transition: $transition;

            &:hover {
                opacity: 1;
                color: var(--text-secondary);
                transform: scale(1.05);
            }
        }
    }
}

// 下拉菜单动画
.dropdown-enter-active,
.dropdown-leave-active {
    transition: $transition;
}
.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
}

// 响应式适配
@media (max-width: 992px) {
    .nav-link {
        font-size: 1.05rem !important;
        padding: 0.8rem 1.25rem !important;
    }
}

@media (max-width: 768px) {
    .fullscreen-overlay {
        padding: 1.5rem;

        .menu-content {
            gap: 3rem;
        }
    }

    .main-nav {
        gap: 0.75rem;
    }

    .search-input {
        font-size: 1rem !important;
    }
}

// 超小屏幕
@media (max-width: 576px) {
    .main-nav {
        flex-direction: column;
        align-items: center;
    }

    .nav-link {
        gap: 0.5rem !important;
        padding: 0.75rem 1.5rem !important;
        width: 100%;
        justify-content: center;
    }

    .dropdown-menu {
        min-width: 180px !important;
    }

    .search-results {
        max-height: 300px;
    }
}

// 确保提示在最顶层
:root {
    --arco-message-z-index: 1002 !important;
}
</style>
