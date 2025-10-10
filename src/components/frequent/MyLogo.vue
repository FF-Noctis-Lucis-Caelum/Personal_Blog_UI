<script setup lang="ts">
defineProps({
    iWidth: {
        type: Number,
        default: 50
    },
    iHeight: {
        type: Number,
        default: 50
    }
})
</script>

<template>
    <div class="my-logo">
        <img src="@/assets/images/ly-logo.png" alt="Logo" :width="iWidth" :height="iHeight" />
    </div>
</template>

<style scoped>

</style>
