<script setup lang="ts">

import MyLogo from "@/components/frequent/MyLogo.vue";
import MenuBar from "@/views/Home/components/menuBar.vue";
import LanguageSelector from "@/components/frequent/LanguageSelector.vue";

</script>

<template>
    <div class="Home_Page">
        <div class="view_header">
            <MyLogo />
            <MenuBar />
            <LanguageSelector />
        </div>
    </div>
</template>

<style scoped lang="scss">
.Home_Page {
    width: 100vw;
    height: 100vh;
    //background: #1d1e1d;
    background-image: url(https://images.pexels.com/photos/27700168/pexels-photo-27700168.jpeg);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    .view_header {
        width: 100%;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: space-around;
    }
}
</style>
