<template>
    <a-layout :class="{ mobile: appStore.hideMenu }" class="layout">
        <div v-if="navbar" class="layout-navbar">
            <NavBar />
        </div>
        <a-layout>
            <a-layout>
                <a-layout-sider
                    v-if="renderMenu"
                    v-show="!hideMenu"
                    :breakpoint="'xl'"
                    :collapsible="true"
                    :hide-trigger="true"
                    :style="{ paddingTop: navbar ? '60px' : '' }"
                    :width="menuWidth"
                    class="layout-sider"
                    @collapse="setCollapsed"
                >
                    <div class="menu-wrapper">
                        <div class="left-side">
                            <!-- 给a-space添加尺寸 -->
                            <a-space>
                                <Logo view-size="0 0 128 128" />
                                <a-typography-title>Eccp Dams</a-typography-title>
                            </a-space>
                        </div>
                        <Menu />
                    </div>
                </a-layout-sider>
                <a-drawer
                    v-if="hideMenu"
                    :closable="false"
                    :footer="false"
                    :visible="drawerVisible"
                    mask-closable
                    placement="left"
                    @cancel="drawerCancel"
                >
                    <Menu />
                </a-drawer>
                <a-layout :style="paddingStyle" class="layout-content">
                    <TabBar v-if="appStore.tabBar" />
                    <a-layout-content>
                        <PageLayout />
                    </a-layout-content>
                    <Footer v-if="footer" />
                </a-layout>
            </a-layout>
        </a-layout>
    </a-layout>
</template>

<script lang="ts" setup>
import Footer from '@/components/footer/index.vue'
import Menu from '@/components/menu/index.vue'
import NavBar from '@/components/navbar/index.vue'
import TabBar from '@/components/tab-bar/index.vue'
import usePermission from '@/hooks/permission'
import useResponsive from '@/hooks/responsive'
import { useAppStore, useUserStore } from '@/store'
import { computed, onMounted, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageLayout from './page-layout.vue'
import Logo from "@/components/layout/logo.vue";

const isInit = ref(false)
const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const permission = usePermission()
useResponsive(true)
const navbarHeight = `60px`
const navbar = computed(() => appStore.navbar)
const renderMenu = computed(() => appStore.menu && !appStore.topMenu)
const hideMenu = computed(() => appStore.hideMenu)
const footer = computed(() => appStore.footer)
const menuWidth = computed(() => {
    return appStore.menuCollapse ? 48 : appStore.menuWidth
})
const paddingStyle = computed(() => {
    const paddingLeft = renderMenu.value && !hideMenu.value ? { paddingLeft: `${menuWidth.value}px` } : {}
    const paddingTop = navbar.value ? { paddingTop: navbarHeight } : {}
    return { ...paddingLeft, ...paddingTop }
})
const setCollapsed = (val: boolean) => {
    if (!isInit.value) return // for page initialization menu state problem
    appStore.updateSettings({ menuCollapse: val })
}
watch(
    () => userStore.role,
    (roleValue) => {
        if (roleValue && !permission.accessRouter(route)) router.push({ name: 'notFound' })
    }
)
const drawerVisible = ref(false)
const drawerCancel = () => {
    drawerVisible.value = false
}
provide('toggleDrawerMenu', () => {
    drawerVisible.value = !drawerVisible.value
})
onMounted(() => {
    isInit.value = true
})
</script>

<style lang="less" scoped>
@nav-size-height: 60px;
@layout-max-width: 1100px;
/* 在全局样式中添加 */
svg {
    display: block;
    width: 60px;
    height: 60px;
}
.layout {
    width: 100%;
    height: 100%;

    .layout-sider {
        background: var(--color-menu-dark-bg);
        position: fixed;
        top: 0;
        left: 0;
        z-index: 99;
        height: 100%;
        padding-top: 0 !important;

        .left-side {
            display: flex;
            align-items: center;
            padding-left: 8px;
            background: var(--color-menu-dark-bg);
            height: 60px;

            .arco-typography {
                color: #fff;
                font-size: 18px;
                width: 200px;
            }
        }

        &::after {
            position: absolute;
            top: 0;
            //right: -1px;
            display: block;
            //width: 1px;
            height: 100%;
            background-color: var(--color-border);
            content: '';
        }

        > :deep(.arco-layout-sider-children) {
            overflow-y: hidden;
            top: 0;
        }

        .menu-wrapper {
            height: 100%;
            overflow: auto;
            overflow-x: hidden;

            :deep(.arco-menu) {
                height: calc(100% - 60px) !important;

                ::-webkit-scrollbar {
                    width: 12px;
                    height: 4px;
                }

                ::-webkit-scrollbar-thumb {
                    border: 4px solid transparent;
                    background-clip: padding-box;
                    border-radius: 7px;
                    background-color: var(--color-text-4);
                }

                ::-webkit-scrollbar-thumb:hover {
                    background-color: var(--color-text-3);
                }
            }
        }
    }

    .layout-content {
        min-width: @layout-max-width;
        min-height: 100vh;
        overflow-y: hidden;
        background-color: var(--color-fill-2);
        transition: all 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);

        .layout-navbar {
            transition: all 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);
            position: fixed;
            top: 0;
            left: 250px;
            z-index: 100;
            width: 100%;
            min-width: @layout-max-width;
            height: @nav-size-height;
        }
    }

    .arco-layout-sider-collapsed {
        .left-side {
            width: 50px;

            .arco-typography {
                color: transparent;
            }
        }

        + .layout-content {
            .layout-navbar {
                left: 50px !important;

                .navbar {
                    width: calc(100% - 50px) !important;
                }
            }
        }
    }
}
</style>
