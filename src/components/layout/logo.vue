<script setup lang="ts">
const props = defineProps({
    viewSize: {
        type: String,
        default: '0 0 128 128'
    },
    width: {
        type: String,
        default: '32px'
    },
    height: {
        type: String,
        default: '32px'
    },
    left: {
        type: String,
        default: '0'
    },
    top: {
        type: String,
        default: '0'
    }
})
</script>

<template>
    <div class="logo" :style="{ width: width, height: height, left: left, top: top }">
        <svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewSize">
            <!-- 底层服务器架构 -->
            <path d="M12 104h104v12H12z" fill="#4a5568" opacity="0.2" />

            <!-- 晶体防护层 -->
            <g transform="translate(64 64)">
                <path d="M-28 0l28 48-28 48-28-48z" fill="none" stroke="#38b2ac" stroke-width="2" />
                <path d="M28 0l-28 48 28 48 28-48z" fill="none" stroke="#38b2ac" stroke-width="2" />
            </g>

            <!-- 数据电极核心 -->
            <g transform="translate(64 64)">
                <circle cx="0" cy="0" r="32" fill="none" stroke="#2d3748" stroke-width="4" />
                <text x="-24" y="-8" font-size="6" fill="#63b3ed">0</text>
                <text x="18" y="16" font-size="6" fill="#63b3ed">1</text>
                <path d="M-24 24l48 -48" stroke="#f6ad55" stroke-width="3" stroke-linecap="round" />
            </g>

            <!-- 动态电流波纹 -->
            <path d="M64 36c12 8 20 24 20 40" fill="none" stroke="#4299e1" stroke-width="2" stroke-dasharray="4 2">
                <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
            </path>
        </svg>
    </div>
</template>

<style scoped lang="less">
.logo {
    position: relative;
    z-index: 100;
}
</style>
