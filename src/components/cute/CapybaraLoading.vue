<script setup lang="ts">
import { defineProps, computed } from 'vue'
import AnimatedLoadingText from "@/components/cute/AnimatedLoadingText.vue";


const props = defineProps({
    // 控制加载组件是否显示
    visible: {
        type: Boolean,
        default: false
    },
    // 加载提示文本
    text: {
        type: String,
        default: '加载中'
    },
    // 水豚动画宽度
    width: {
        type: String,
        default: '14em'
    },
    // 水豚动画高度
    height: {
        type: String,
        default: '10em'
    },
    // 与文字距离
    marginBottom: {
        type: String,
        default: '-50px'
    },
    // 是否显示背景遮罩
    showMask: {
        type: Boolean,
        default: true
    },
    // 背景遮罩透明度
    maskOpacity: {
        type: Number,
        default: 0.7
    },
    // 背景遮罩颜色
    maskColor: {
        type: String,
        default: '#ffffff'
    },
    // 文字颜色
    textColor: {
        type: String,
        default: '#53381c'
    },
    // 文字大小
    textSize: {
        type: String,
        default: '1.5em'
    },
    // 文字动画速度 (秒)
    textSpeed: {
        type: Number,
        default: 1.5
    },
    // 文字动画类型
    textAnimation: {
        type: String,
        default: 'scale'
    },
    // 水豚缩放
    scale: {
        type: Number,
        default: 0.75
    }
})

// 计算遮罩样式
const maskStyle = computed(() => ({
    backgroundColor: props.maskColor,
    opacity: props.maskOpacity
}))

// 计算加载组件显示状态
const containerStyle = computed(() => ({
    display: props.visible ? 'flex' : 'none'
}))
</script>

<template>
    <!-- 加载组件容器 -->
    <div
        class="loading-container"
        :style="containerStyle"
    >
        <!-- 背景遮罩 -->
        <div
            class="loading-mask"
            v-if="showMask"
            :style="maskStyle"
        ></div>

        <!-- 加载内容 -->
        <div class="loading-content">
            <!-- 水豚加载动画 -->
            <div class="capybara-loader" :style="{ width, height, marginBottom, transform: `scale(${props.scale})` }">
                <div class="capybara">
                    <div class="capybara-head">
                        <div class="capybara-ear">
                            <div class="capybara-ear-inner"></div>
                        </div>
                        <div class="capybara-ear"></div>
                        <div class="capybara-mouth">
                            <div class="capybara-lip"></div>
                            <div class="capybara-lip"></div>
                        </div>
                        <div class="capybara-eye"></div>
                        <div class="capybara-eye"></div>
                    </div>
                    <div class="capybara-leg"></div>
                    <div class="capybara-leg-2"></div>
                    <div class="capybara-leg-2"></div>
                    <div class="capybara-body"></div>
                </div>
                <div class="loader">
                    <div class="loader-line"></div>
                </div>
            </div>

            <!-- 使用动画文字组件 -->
            <AnimatedLoadingText
                :text="text"
                :color="textColor"
                :font-size="textSize"
                :speed="textSpeed"
                :left="left"
                :top="top"
                :animation="textAnimation"
            />
        </div>
    </div>
</template>

<style scoped>
/* 保持原有样式不变 */
.loading-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    justify-content: center;
    align-items: center;
}

.loading-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: opacity 0.3s;
}

.loading-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5em;
}

/* 水豚动画样式保持不变 */
.capybara-loader {
    position: relative;
    z-index: 1;
    --color: rgb(204, 125, 45);
    --color2: rgb(83, 56, 28);
    transform: scale(0.75);
}
.capybara {
    width: 100%;
    height: 7.5em;
    position: relative;
    z-index: 1;
}
.loader {
    width: 100%;
    height: 2.5em;
    position: relative;
    z-index: 1;
    overflow: hidden;
}
.capybara-body {
    width: 85%;
    height: 100%;
    background: linear-gradient(var(--color), 90%, var(--color2));
    border-radius: 45%;
    position: relative;
    z-index: 1;
    animation: move-body 1s linear infinite;
}
.capybara-head {
    width: 7.5em;
    height: 7em;
    bottom: 0;
    right: 0;
    position: absolute;
    background-color: var(--color);
    z-index: 3;
    border-radius: 3.5em;
    box-shadow: -1em 0 var(--color2);
    animation: move-body 1s linear infinite;
}
.capybara-ear {
    width: 2em;
    height: 2em;
    background: linear-gradient(-45deg, var(--color), 90%, var(--color2));
    top: 0;
    left: 0;
    border-radius: 100%;
    position: absolute;
    overflow: hidden;
    z-index: 3;
}
.capybara-ear:nth-child(2) {
    left: 5em;
    background: linear-gradient(25deg, var(--color), 90%, var(--color2));
}
.capybara-ear-inner {
    width: 100%;
    height: 1em;
    background-color: var(--color2);
    bottom: 0;
    left: 0.5em;
    border-radius: 100%;
    position: absolute;
    transform: rotate(-45deg);
}
.capybara-mouth {
    width: 3.5em;
    height: 2em;
    background-color: var(--color2);
    position: absolute;
    bottom: 0;
    left: 2.5em;
    border-radius: 50%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0.5em;
}
.capybara-lip {
    width: 0.25em;
    height: 0.75em;
    border-radius: 100%;
    transform: rotate(-45deg);
    background-color: var(--color);
}
.capybara-lip:nth-child(2) {
    transform: rotate(45deg);
}
.capybara-eye {
    width: 2em;
    height: 0.5em;
    background-color: var(--color2);
    position: absolute;
    bottom: 3.5em;
    left: 1.5em;
    border-radius: 5em;
    transform: rotate(45deg);
}
.capybara-eye:nth-child(4) {
    transform: rotate(-45deg);
    left: 5.5em;
    width: 1.75em;
}
.capybara-leg {
    width: 6em;
    height: 5em;
    bottom: 0;
    left: 0;
    position: absolute;
    background: linear-gradient(var(--color), 95%, var(--color2));
    z-index: 2;
    border-radius: 2em;
    animation: move-body 1s linear infinite;
}
.capybara-leg-2 {
    width: 1.75em;
    height: 3em;
    bottom: 0;
    left: 3.25em;
    position: absolute;
    background: linear-gradient(var(--color), 80%, var(--color2));
    z-index: 2;
    border-radius: 0.75em;
    box-shadow: inset 0 -0.5em var(--color2);
    animation: move-leg 1s linear infinite;
}
.capybara-leg-2:nth-child(3) {
    width: 1.25em;
    left: 0.5em;
    height: 2em;
    animation: move-leg-2 1s linear infinite 0.075s;
}

@keyframes move-leg {
    0% {
        transform: rotate(-45deg) translateX(-5%);
    }
    50% {
        transform: rotate(45deg) translateX(5%);
    }
    100% {
        transform: rotate(-45deg) translateX(-5%);
    }
}

@keyframes move-leg-2 {
    0% {
        transform: rotate(45deg);
    }
    50% {
        transform: rotate(-45deg);
    }
    100% {
        transform: rotate(45deg);
    }
}

@keyframes move-body {
    0% {
        transform: translateX(0);
    }
    50% {
        transform: translateX(2%);
    }
    100% {
        transform: translateX(0);
    }
}

.loader-line {
    width: 50em;
    height: 0.5em;
    border-top: 0.5em dashed var(--color2);
    animation: move-line 10s linear infinite;
}

@keyframes move-line {
    0% {
        transform: translateX(0);
        opacity: 0;
    }
    5% {
        opacity: 100%;
    }
    95% {
        opacity: 100%;
    }
    100% {
        opacity: 0;
        transform: translateX(-70%);
    }
}
</style>
