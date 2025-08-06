<template>
    <a-config-provider :locale="locale">
        <router-view />
        <CapybaraLoading
            :visible="isLoading"
            :showMask="true"
            :maskOpacity="1"
            :maskColor="'rgba(122,121,121, 0.95)'"
            width="16em"
            height="12em"
            :text="'Loading...'"
        />
    </a-config-provider>
</template>

<script lang="ts" setup>
import { useLoading } from '@/hooks/CyLoading'

const { isLoading } = useLoading()
</script>
