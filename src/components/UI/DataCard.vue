<script setup lang="ts">
defineProps<{
    label: string
    value: string | number
    unit?: string
}>()
</script>

<template>
    <div class="data-card">
        <div class="param-label">{{ label }}</div>
        <div class="param-value">
            {{ value }}<span v-if="unit" class="unit">{{ unit }}</span>
        </div>
    </div>
</template>

<style scoped lang="scss">
.data-card {
    background: #0d2344;
    padding: 1.5rem;
    border: 1px solid #1e4a7a;
    position: relative;
    transition: 0.3s;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(45deg, transparent 40%, #00f3ff33);
        pointer-events: none;
    }

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 20px #00f3ff33;
    }

    .param-label {
        color: #7ed4ff;
        margin-bottom: 0.5rem;
    }

    .param-value {
        font-size: 2.5rem;
        color: rgba(255, 255, 255, 0.93);
        font-weight: bold;
        text-shadow: 0 0 15px var(--neon-blue);

        .unit {
            font-size: 1rem;
            margin-left: 0.5rem;
        }
    }
}
</style>
