<template>
    <transition name="fade">
        <div v-if="visible" class="loading-overlay">
            <div class="loading-content">
                <div class="spinner">
                    <div class="spinner-inner">
                        <div v-for="i in 8" :key="i" :style="getBarStyle(i)"></div>
                    </div>
                </div>
                <p class="loading-text">{{ text || '加载中...' }}</p>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
    name: 'LoadingOverlay',
    props: {
        visible: {
            type: Boolean,
            required: true
        },
        text: {
            type: String,
            default: ''
        },
        color: {
            type: String,
            default: '#4fd1c5'
        }
    },
    setup(props) {
        const getBarStyle = (index: number) => {
            const rotate = index * 45;
            const delay = index * 0.1;
            return {
                transform: `rotate(${rotate}deg)`,
                animationDelay: `${delay}s`,
                backgroundColor: props.color
            };
        };

        return {
            getBarStyle
        };
    }
});
</script>

<style scoped>
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    backdrop-filter: blur(1px);
}

.loading-content {
    text-align: center;
    color: white;
}

.spinner {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
}

.spinner-inner {
    position: relative;
    width: 100%;
    height: 100%;
}

.spinner-inner div {
    position: absolute;
    width: 6px;
    height: 24px;
    border-radius: 3px;
    left: 50%;
    top: 50%;
    margin-left: -3px;
    margin-top: -12px;
    transform-origin: 3px 42px;
    animation: spinner 1.2s infinite ease;
    opacity: 0;
}

@keyframes spinner {
    0% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
}

.loading-text {
    margin-top: 50px;
    font-size: 18px;
    letter-spacing: 1px;
    font-weight: 300;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
