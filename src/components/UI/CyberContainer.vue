<script setup lang="ts">
defineProps<{ glow?: boolean }>()
</script>

<template>
    <div :class="['cyber-container', { 'glowing-border': glow }]">
        <slot name="header" />
        <slot />
    </div>
</template>

<style scoped lang="scss">
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
.cyber-container {
    min-height: 100vh;
    position: relative;
    padding: 4rem 2rem;
    background: linear-gradient(45deg, #0a192fdd 30%, rgba(79, 133, 205, 0.87));
    border: 2px solid var(--neon-blue);
    box-shadow: 0 0 30px 12px #00f3ff33;
}

.glowing-border::after {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg,
        var(--neon-blue),
        transparent 30%,
        var(--neon-blue));
    z-index: -1;
    filter: blur(10px);
    animation: glow 3s linear infinite;
}

@keyframes glow {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
}
</style>
