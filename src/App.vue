<template>
    <a-config-provider :locale="locale">
        <router-view />
        <global-setting />
    </a-config-provider>
</template>

<script lang="ts" setup>
import GlobalSetting from '@/components/global-setting/index.vue'
</script>
