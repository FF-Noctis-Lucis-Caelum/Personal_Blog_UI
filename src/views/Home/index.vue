<script setup lang="ts">

import MyLogo from "@/components/frequent/MyLogo.vue";
import MenuBar from "@/views/Home/components/menuBar.vue";
</script>

<template>
    <div class="Home_Page">
        <div class="view_header">
            <MyLogo />
            <MenuBar />
        </div>
    </div>
</template>

<style scoped lang="scss">
.Home_Page {
    width: 100vw;
    height: 100vh;
    background: #507a5b;
    .view_header {
        width: 100%;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: space-around;
    }
}
</style>
