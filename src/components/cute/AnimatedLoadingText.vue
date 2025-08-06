<script setup lang="ts">
import {computed} from 'vue'

const props = defineProps({
    // 加载文本内容
    text: {
        type: String,
        default: '加载中'
    },
    // 文字颜色
    color: {
        type: String,
        default: '#53381c'
    },
    // 文字大小
    fontSize: {
        type: String,
        default: '1.2em'
    },
    // 动画速度 (秒)
    speed: {
        type: Number,
        default: 1.5
    },
    // 动画类型: bounce(弹跳)、pulse(脉冲)、typing(打字)、float(漂浮)、scale(缩放)
    animation: {
        type: String,
        default: 'bounce',
        validator: (value: string) => {
            return ['bounce', 'pulse', 'typing', 'float', 'scale'].includes(value)
        }
    },
    // 是否显示省略号动画
    showEllipsis: {
        type: Boolean,
        default: true
    },
    // 字体粗细
    fontWeight: {
        type: String,
        default: 'bold'
    },
    // 字体家族
    fontFamily: {
        type: String,
        default: 'Arial, sans-serif'
    }
})

// 计算动画持续时间
const animationDuration = computed(() => `${props.speed}s`)

// 计算文本样式
const textStyle = computed(() => ({
    color: props.color,
    fontSize: props.fontSize,
    fontWeight: props.fontWeight,
    fontFamily: props.fontFamily,
    animationDuration: animationDuration.value
}))

</script>

<template>
    <div class="animated-loading-text">
        <!-- 根据选择的动画类型应用不同的类 -->
        <span
            :class="['loading-text-content', animation]"
            :style="textStyle"
        >
        {{ text }}
        </span>
    </div>
</template>

<style scoped>
.animated-loading-text {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    white-space: nowrap;
}

/* 基础动画样式 */
.loading-text-content {
    display: inline-block;
    transition: all 0.3s ease;
}

/* 弹跳动画 */
.bounce {
    animation: bounce 1s infinite ease-in-out;
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}

/* 脉冲动画 */
.pulse {
    animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

/* 打字动画 */
.typing {
    overflow: hidden;
    position: relative;
}

.typing::after {
    content: '|';
    position: absolute;
    right: -5px;
    animation: blink 1s infinite;
}

@keyframes blink {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
}

/* 漂浮动画 */
.float {
    animation: float 3s infinite ease-in-out;
}

@keyframes float {
    0%, 100% {
        transform: translateY(0) rotate(0deg);
    }
    25% {
        transform: translateY(-5px) rotate(2deg);
    }
    75% {
        transform: translateY(5px) rotate(-2deg);
    }
}

/* 缩放动画 */
.scale {
    animation: scale 1.5s infinite ease-in-out;
}

@keyframes scale {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
}

/* 省略号动画 */
.ellipsis {
    display: inline-flex;
    gap: 0.1em;
}

.ellipsis::before {
    content: '.';
    animation: dot1 1.5s infinite;
    opacity: 0;
}

.ellipsis::after {
    content: '..';
    animation: dot2 1.5s infinite;
    opacity: 0;
}

@keyframes dot1 {
    0% {
        opacity: 0;
    }
    25% {
        opacity: 1;
    }
    100% {
        opacity: 1;
    }
}

@keyframes dot2 {
    0% {
        opacity: 0;
    }
    25% {
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 1;
    }
}
</style>
