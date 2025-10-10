<script setup lang="ts">

import {useRouter} from "vue-router";
import {linkPage} from "@/utils/extreme/routeHelper";
const router = useRouter();
</script>

<template>
    <div class="Menu_Bar">
        <div class="menu">
            <el-text @click="linkPage(router, { name: 'welcome'})">Home</el-text>
        </div>
        <div class="menu">
            <router-link to="/welcome">How It Works</router-link>
        </div>
        <div class="menu">
            <router-link to="/home">Program</router-link>
        </div>
        <div class="menu">
            <router-link to="/home">Support</router-link>
        </div>
        <div class="menu">
            <router-link to="/home">Careers</router-link>
        </div>
        <div class="menu">
            <router-link to="/home">Become a Partner</router-link>
        </div>
        <div class="menu sp">
            <router-link to="/home">Login/Register</router-link>
        </div>
    </div>
</template>

<style scoped lang="scss">
.Menu_Bar {
    width: 600px;
    height: 45px;
    background: rgba(255, 255, 255, 0.1);
    padding: 4px;
    border-radius: 8px;
    display: flex;
    gap: 14px;
    .menu {
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
    }
}
</style>
