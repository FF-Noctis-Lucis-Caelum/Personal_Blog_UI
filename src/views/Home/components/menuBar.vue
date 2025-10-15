<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { linkPage } from "@/utils/extreme/routeHelper";
import { ref, onMounted } from 'vue';

const router = useRouter();
const route = useRoute();
const isMobileMenuOpen = ref(false); // 控制移动端菜单展开/折叠

// 定义菜单项数据
const menuItems = [
    { label: 'Home', route: 'home' },
    { label: 'How It Works', route: 'welcome' },
    { label: 'Program', route: 'program' },
    { label: 'Support', route: 'support' },
    { label: 'Careers', route: 'careers' },
    { label: 'Become a Partner', route: 'partner' },
    { label: 'Login/Register', route: 'auth', isSpecial: true }
];

// 检查当前菜单项是否为激活状态
const isActive = (menuRoute: string) => {
    return route.name === menuRoute;
};

// 监听窗口大小变化，在移动设备上默认关闭菜单
onMounted(() => {
    const handleResize = () => {
        if (window.innerWidth >= 768) {
            isMobileMenuOpen.value = false;
        }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
});
</script>

<template>
    <!-- 移动端菜单按钮 -->
    <button
        class="mobile-menu-toggle"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
    >
        <i class="fas" :class="isMobileMenuOpen ? 'fa-times' : 'fa-bars'"></i>
    </button>

    <div class="menu-bar" :class="{ 'mobile-open': isMobileMenuOpen }">
        <div
            v-for="(item, index) in menuItems"
            :key="index"
            class="menu-item"
            :class="{ 'active': isActive(item.route), 'special': item.isSpecial }"
            @click="() => {
                linkPage(router, { name: item.route });
                isMobileMenuOpen = false; // 点击后关闭移动菜单
            }"
        >
            <img
                src="@/assets/images/annex.png"
                alt="Menu icon"
                class="menu-icon"
            >
            <div class="menu-text">{{ item.label }}</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use '@/assets/style/global.scss' as *;

// 果冻动画效果
@keyframes jellySlideIn {
    0% {
        transform: translateX(-12px) scale(0.7);
        opacity: 0;
    }
    60% {
        transform: translateX(3px) scale(1.1);
        opacity: 0.9;
    }
    100% {
        transform: translateX(0) scale(1);
        opacity: 1;
    }
}

// 移动端菜单按钮 - 默认隐藏
.mobile-menu-toggle {
    display: none;
    position: fixed;
    top: 15px;
    right: 15px;
    z-index: 100;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(10px);
    border: none;
    border-radius: 8px;
    width: 40px;
    height: 40px;
    color: white;
    font-size: 18px;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255,255,255,0.25);
    }
}

.menu-bar {
    height: 50px;
    padding: 5px;
    border-radius: 15px;
    display: flex;
    gap: 5px;
    backdrop-filter: blur(50px);
    background: linear-gradient(
            135deg,
            rgba(255,255,255,0.1) 0%,
            rgba(255,255,255,0.05) 100%
    ), rgba(255,255,255,0.15);
    transition: all 0.3s ease;

    .menu-item {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 10px;
        min-width: 80px;
        gap: 5px;
        border-radius: 10px;
        cursor: pointer;
        color: #deeae0;
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

        .menu-icon {
            @include BoxSize(13px, 13px);
            opacity: 0;
            transform: translateX(-12px);
            transition: all 0.25s ease-out;
        }

        &:not(.active):not(.special):hover {
            background: rgba(255, 255, 255, 0.1);
            color: #f0f7f1;
            transform: translateY(-1px);

            .menu-icon {
                opacity: 1;
                transform: translateX(0);
                animation: jellySlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
        }
    }

    .active {
        color: white;
        backdrop-filter: blur(20px);
        box-shadow: 0 0 12px rgba(255,255,255,0.2);
        background: rgba(255,255,255,0.25);

        .menu-icon {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .special {
        border: 1px solid rgba(255,255,255,0.3);
        background: linear-gradient(
                135deg,
                rgba(255,255,255,0.1) 0%,
                rgba(255,255,255,0.05) 100%
        );
        transition: all 0.2s ease;

        &:hover {
            transform: scale(1.02);
            box-shadow: 0 0 16px rgba(255,255,255,0.25);

            .menu-icon {
                opacity: 1;
                transform: translateX(0);
                animation: jellySlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
        }
    }
}

// 平板设备适配 (768px - 1024px)
@media (max-width: 1024px) {
    .menu-bar {
        height: 45px;
        gap: 3px;
        padding: 3px;

        .menu-item {
            min-width: 65px;
            padding: 0 8px;
            font-size: 14px;

            .menu-icon {
                @include BoxSize(12px, 12px);
            }
        }
    }
}

// 移动设备适配 (小于768px)
@media (max-width: 768px) {
    .mobile-menu-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .menu-bar {
        position: fixed;
        top: 0;
        right: 0;
        height: 100vh;
        width: 250px;
        flex-direction: column;
        gap: 8px;
        padding: 70px 15px 20px;
        border-radius: 15px 0 0 15px;
        transform: translateX(100%);
        opacity: 0;
        pointer-events: none;
        transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

        &.mobile-open {
            transform: translateX(0);
            opacity: 1;
            pointer-events: auto;
            box-shadow: -5px 0 25px rgba(0,0,0,0.15);
        }

        .menu-item {
            min-width: auto;
            width: 100%;
            padding: 12px 15px;
            justify-content: flex-start;
            font-size: 15px;

            .menu-icon {
                @include BoxSize(14px, 14px);
                opacity: 1;
                transform: translateX(0);
            }
        }

        // 为移动端菜单项添加逐个动画效果
        .menu-item {
            opacity: 0;
            transform: translateX(20px);
            transition: all 0.3s ease;

            &:nth-child(1) { transition-delay: 0.05s; }
            &:nth-child(2) { transition-delay: 0.1s; }
            &:nth-child(3) { transition-delay: 0.15s; }
            &:nth-child(4) { transition-delay: 0.2s; }
            &:nth-child(5) { transition-delay: 0.25s; }
            &:nth-child(6) { transition-delay: 0.3s; }
            &:nth-child(7) { transition-delay: 0.35s; }
        }

        &.mobile-open .menu-item {
            opacity: 1;
            transform: translateX(0);
        }
    }
}

// 小屏手机适配 (小于480px)
@media (max-width: 480px) {
    .menu-bar {
        width: 220px;

        .menu-item {
            font-size: 14px;
            padding: 10px 12px;
        }
    }
}
</style>
