<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Message } from "@arco-design/web-vue";
import 'animate.css/animate.min.css';

// 国际化配置
const { t } = useI18n();

// 博客路由导航结构（添加特色图标）
const navItems = ref([
    {
        name: 'home',
        label: 'nav.home',
        icon: 'fa-house-chimney' // 首页图标
    },
    {
        name: 'articles',
        label: 'nav.articles',
        icon: 'fa-book-open', // 文章图标
        children: [
            { name: 'articles-latest', label: 'nav.latest', icon: 'fa-clock-rotate-left' },
            { name: 'articles-popular', label: 'nav.popular', icon: 'fa-fire-flame-curved' },
            { name: 'articles-archive', label: 'nav.archive', icon: 'fa-box-archive' }
        ]
    },
    {
        name: 'categories',
        label: 'nav.categories',
        icon: 'fa-folder-tree', // 分类图标
        children: [
            { name: 'category-tech', label: 'nav.tech', icon: 'fa-microchip' },
            { name: 'category-life', label: 'nav.life', icon: 'fa-heart' },
            { name: 'category-study', label: 'nav.study', icon: 'fa-graduation-cap' }
        ]
    },
    {
        name: 'tags',
        label: 'nav.tags',
        icon: 'fa-tags' // 标签图标
    },
    {
        name: 'about',
        label: 'nav.about',
        icon: 'fa-user-secret' // 关于图标
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

// 初始化
onMounted(() => {
    const initialMatch = findActiveNavItem(router.currentRoute.value.name as string, navItems.value);
    currentNavItem.value = initialMatch?.label || 'nav.home';

    // 初始化主题
    applyTheme(themes.value[0].colors);
});

// 路由跳转
const navTo = (name: string) => {
    if (router.hasRoute(name)) {
        router.push({ name });
        // 关闭菜单和搜索框
        isCollapsed.value = true;
        isSearchExpanded.value = false;
        searchQuery.value = '';
    } else {
        // 确保提示在最上层
        Message.error(t('message.pageNotFound'));
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

// 折叠状态
const isCollapsed = ref(true);
const changeCollapsed = () => {
    isCollapsed.value = !isCollapsed.value;
    if (isCollapsed.value) {
        isSearchExpanded.value = false;
        searchQuery.value = '';
        activeDropdown.value = null;
        isThemePanelOpen.value = false; // 关闭主题面板
    }
};

// 搜索功能
const searchQuery = ref('');
const isSearchExpanded = ref(false);
const searchInputRef = ref<HTMLInputElement>(null);

const toggleSearch = (event?: MouseEvent) => {
    if (event) event.stopPropagation();
    isSearchExpanded.value = !isSearchExpanded.value;
    if (isSearchExpanded.value) {
        nextTick(() => {
            searchInputRef.value?.focus();
        });
    } else {
        searchQuery.value = '';
    }
};

const handleSearch = (e?: KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    if (searchQuery.value.trim()) {
        router.push({ name: 'search', query: { q: searchQuery.value.trim() } });
        searchQuery.value = '';
        isSearchExpanded.value = false;
        isCollapsed.value = true;
    }
};

onMounted(() => {
    document.addEventListener('click', () => {
        if (!isMouseOverDropdown.value) {
            activeDropdown.value = null;
        }
    });
});

// 主题相关状态管理
const isThemePanelOpen = ref(false);
const currentTheme = ref('purple'); // 默认主题

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
    }
};

// 更新自定义颜色
const updateCustomColor = (key: string, value: string) => {
    customColors.value[key] = value;
    applyTheme(customColors.value);
    currentTheme.value = 'custom'; // 标记为自定义主题
};
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

                        <div class="theme-actions">
                            <button
                                class="reset-button"
                                @click="switchTheme('purple')"
                            >
                                {{ t('theme.reset') }}
                            </button>
                        </div>
                    </div>
                </transition>

                <!-- 菜单内容容器 -->
                <div class="menu-content">
                    <!-- Logo（艺术字体） -->
                    <div class="logo" @click="navTo('home')">
                        <span class="logo-text">{{ t('blog.title') }}</span>
                        <span class="logo-sub">Insights</span>
                    </div>

                    <!-- 搜索区域 -->
                    <div class="search-section" @click.stop>
                        <div class="search-wrapper">
                            <input
                                ref="searchInputRef"
                                v-model="searchQuery"
                                type="text"
                                placeholder="搜索文章、标签或分类..."
                                class="search-input"
                                @keyup.enter="handleSearch"
                                :class="{ focused: isSearchExpanded || searchQuery }"
                                @focus="isSearchExpanded = true"
                                @blur="!searchQuery && (isSearchExpanded = false)"
                            >
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
                    </div>

                    <!-- 主导航项（带特色图标） -->
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
// 核心变量 - 使用CSS变量实现主题切换
$transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); // 流畅过渡

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
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 50%;
    background: rgba(30, 41, 59, 0.9);
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
    justify-content: flex-end;
    margin-top: 2rem;
}

.reset-button {
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: 1px solid var(--primary);
    color: var(--primary);
    border-radius: 6px;
    cursor: pointer;
    transition: $transition;
    @include artistic-font;

    &:hover {
        background: var(--primary);
        color: var(--text-primary);
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
        width: 48px;
        height: 48px;
        border: none;
        border-radius: 50%;
        background: rgba(30, 41, 59, 0.9);
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

    // Logo（艺术字体）
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

    // 搜索区域
    .search-section {
        width: 100%;
        max-width: 600px;
        padding: 1rem 0;

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
        gap: 0.8rem; // 图标与文字间距
        padding: 0.9rem 1.5rem;
        color: var(--text-secondary);
        font-size: 1.15rem;
        border-radius: 10px;
        transition: $transition;
        @include artistic-font;

        // 菜单项图标样式
        .nav-icon {
            color: var(--primary-light);
            font-size: 1.25rem;
            width: 1.5rem; // 图标固定宽度，确保对齐
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

        // 子菜单项
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

            // 子项图标
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

    // 底部信息（艺术字体）
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
}

// 确保提示在最顶层
:root {
    --arco-message-z-index: 1002 !important;
}
</style>
