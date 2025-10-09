<template>
    <div class="WelComeBox">
        <MagicRouter @toggle-hidden="handleToggleHidden"  />
        <!-- 背景容器（限制显示区域） -->
        <div class="container">
            <!-- 内部背景盒子（用于偏移的元素） -->
            <div
                ref="backgroundRef"
                class="bg_img"
                :style="{
                    transform: !isHidden ? `scale(1.1) translate(${-offsetX}px, ${-offsetY}px)` : 'none',
                }"
            />
            <!--   左侧阴影         -->
            <div class="trapezoid">
                <div class="Author">FinalFantasy · Notics</div>
                <div class="epigram">
                    <div class="timeLine">2025-06-25 12:00 ~ {{ curTime }}</div>
                    <div class="text">所谓英雄，不是永不跌倒的人，而是带着伤痛依然把剑递给同伴的人</div>
                    <div class="subText">愿你的生命里有 “诺克提斯式” 的成长，有 “普朗托式” 的欢笑，有 “伊格尼斯式” 的守护，有 “格拉迪欧拉斯式” 的可靠 —— 毕竟，独行是宿命，并肩才是救赎</div>
                </div>
            </div>

        </div>

        <!-- 镜头效果 -->
        <div :style="{display: isHidden ? 'none' : 'block'}" class="lens-effect" />

    </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import 'dayjs/locale/zh-cn'; // 中文支持
import { ref, onMounted, onBeforeUnmount, watchEffect } from 'vue'
import { useLoading } from '@/hooks/CyLoading'
import {useRoute} from "vue-router";
import {useLoadingCacheStore} from "@/store/modules/loading/LoadingCache";
import MagicRouter from "@/views/Home/components/magicRouter.vue";
const route = useRoute()
const { hideLoading } = useLoading()
const loadingCacheStore = useLoadingCacheStore()
// 响应式数据
const backgroundRef = ref(null)
const offsetX = ref(0)
const offsetY = ref(0)
const maxOffset = 15 // 最大偏移量（像素）- 比原来更小
const bgSizeRatio = 1.1 // 背景图片比视口大10% - 比原来幅度小
dayjs.locale('zh-cn');
const curTime = ref(dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'))
// 处理鼠标移动
// 处理鼠标移动 - 修改部分：减小放大倍数并添加平滑过渡
const handleMouseMove = (e) => {
    // 计算鼠标在视口中的相对位置
    const xPercent = e.clientX / window.innerWidth - 0.5
    const yPercent = e.clientY / window.innerHeight - 0.5

    // 减小放大倍数（从8改为2-3），使移动更缓慢
    const speedFactor = 4.5; // 可根据需要调整这个值
    const targetX = xPercent * maxOffset * speedFactor
    const targetY = yPercent * maxOffset * speedFactor

    // 添加平滑过渡效果 - 只移动一部分距离，而不是直接跳到目标值
    offsetX.value += (targetX - offsetX.value) * 0.1; // 0.15是缓动系数，值越小越平滑
    offsetY.value += (targetY - offsetY.value) * 0.1;
}

const isHidden = ref(false);  // 初始隐藏
const handleToggleHidden = (newVal: boolean) => {
    isHidden.value = !newVal;
}

// 设置背景尺寸
const setBackgroundSize = () => {
    if (!backgroundRef.value) return

    const bgElement = backgroundRef.value
    // 计算并设置背景盒子大小（比视口大）
    bgElement.style.width = `${window.innerWidth * bgSizeRatio}px`
    bgElement.style.height = `${window.innerHeight * bgSizeRatio}px`
    // 居中背景盒子
    bgElement.style.top = `${-(window.innerHeight * (bgSizeRatio - 1)) / 2}px`
    bgElement.style.left = `${-(window.innerWidth * (bgSizeRatio - 1)) / 2}px`
}

// 生命周期钩子
onMounted(() => {
    // 从Pinia缓存中获取并移除当前路由的opId
    if (route.name) {
        const opId = loadingCacheStore.takeRouteOpId(route.name.toString())
        if (opId) {
            console.log(`组件[${route.name}]挂载完成，关闭加载，操作ID: [${opId}]`)
            hideLoading(opId)
        } else {
            // 异常情况处理
            console.warn(`组件[${route.name}]未找到对应的操作ID`)
            hideLoading()
        }
    }
    setBackgroundSize()
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', setBackgroundSize)
})

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('resize', setBackgroundSize)
})

// 响应窗口大小变化
watchEffect(() => {
    if (backgroundRef.value) {
        setBackgroundSize()
    }
})
</script>

<style scoped lang="scss">
@use '@/assets/style/home/welcome.scss' as *;
</style>
