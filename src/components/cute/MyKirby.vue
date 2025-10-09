<script setup lang="ts">
defineProps({
    kScale: {
        type: Number,
        default: 0.3
    },
    isMirror: {
        type: Boolean,
        default: false
    },
    kTop: {
        type: String,
        default: '0'
    },
    kLeft: {
        type: String,
        default: '0'
    }
})
</script>

<template>
    <div class="my-kirby" :style="{ scale: kScale, transform: isMirror? 'scaleX(-1)' : 'unset', top: kTop, left: kLeft }">
        <div class="hand-left"></div>
        <div class="hand-right"></div>
        <div class="head">
            <div class="eye eye-left">
                <div class="eye-inner"></div>
            </div>
            <div class="eye eye-right">
                <div class="eye-inner"></div>
            </div>
            <div class="cheek cheek-left"></div>
            <div class="cheek cheek-right"></div>
            <div class="mouth"></div>
        </div>
        <div class="foot-left"></div>
        <div class="foot-right"></div>
    </div>
</template>

<style scoped lang="scss">
@use '@/assets/cute/kirby_variables' as *;
.my-kirby {
    width: 400px;
    height: 370px;
    position: absolute;
    z-index: 1000;
    .head {
        width: 100%;
        height: 100%;
        top: 100px;
        background-color: $body-color;
        border-radius: 100%;
        box-shadow: inset 10px -35px 60px 0 $body-shadow-color, 40px 20px 64px 0 rgba(0, 0, 0, 0.2);
        z-index: 1;
        .eye {
            width: 35px;
            height: 91px;
            background-color: $black-color;
            position: absolute;
            border-radius: 50px/100px;
            transform: rotate(17deg);
            box-shadow: 0 0 3px $black-color;
        }

        .eye-left {
            top: 70px;
            left: 200px;
        }

        .eye-right {
            top: 87px;
            left: 275px;
        }

        .eye-inner {
            background-color: $white-color;
            width: 22px;
            height: 30px;
            border-radius: 70px/100px;
            box-shadow: 0 0 3px $white-color;
            position: absolute;
            left: 7px;
            top: 4.2px;
        }

        .eye-inner::before {
            content: '';
            position: absolute;
            width: 22px;
            height: 35px;
            background-color: $blue-color;
            border-radius: 70px/100px;
            left: 0;
            top: 47px;
            box-shadow: 0 0 3px $black-color;
        }

        .eye-inner::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            background-color: $black-color;
            border-radius: 70px/100px;
            left: 3px;
            top: 46px;
            box-shadow: 0 0 9px 8px $black-color;
        }

        .cheek {
            width: 60px;
            height: 30px;
            background-color: $cheek-color;
            border-radius: 100%;
            position: absolute;
            transform: rotate(22deg);
            box-shadow: 0 0 3px $cheek-color;
        }

        .cheek-left {
            top: 125px;
            left: 110px;
        }

        .cheek-right {
            top: 185px;
            left: 308px;
        }

        .mouth {
            width: 70px;
            height: 50px;
            background-color: $mouth-one-color;
            border-radius: 50px 50px 150px 150px;
            transform: rotate(15deg);
            position: absolute;
            left: 195px;
            top: 187px;
        }

        .mouth:before {
            content: '';
            position: absolute;
            width: 57px;
            height: 35px;
            background-color: $mouth-two-color;
            border-radius: 48px 50px 150px 150px;
            box-shadow: inset 1px 2px 11px 1px $mouth-one-color;
            top: 12px;
            left: 5px;
        }
    }

    .hand-left {
        position: absolute;
        width: 150px;
        height: 250px;
        background-color: $body-color;
        border-radius: 100% 100% 0 40%/100% 100% 0 100%;
        box-shadow: inset 0px -35px 60px 0 $body-shadow-color, 40px 20px 64px 0 rgba(0, 0, 0, 0.2);
        z-index: -1;
        transform: rotate(16deg);
        top: -90px;
        left: 50px;
    }

    .hand-right {
        position: absolute;
        width: 150px;
        height: 250px;
        background-color: $right-hand-color;
        top: 61px;
        left: 254px;
        z-index: -1;
        transform: rotate(90deg);
        border-radius: 100% 100% 0 40%/100% 100% 0 100%;
        box-shadow: inset 0px -45px 25px -5px $white-color, 40px 20px 64px 0 rgb(0 0 0 / 20%);
    }

    .foot-left {
        position: absolute;
        width: 150px;
        height: 232px;
        background-color: $foot-color;
        top: 239px;
        left: 32px;
        z-index: -1;
        transform: rotate(-7deg);
        border-radius: 50% 50% 60% 60%/40% 40% 80% 80%;
        box-shadow: inset -15px -2px 50px 4px $mouth-one-color;
    }

    .foot-right {
        position: absolute;
        width: 150px;
        height: 200px;
        background-color: $foot-color;
        top: 219px;
        left: 239px;
        z-index: 1;
        transform: rotate(53deg);
        border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        box-shadow: inset 4px -20px 20px 1px rgb(255 255 255 / 10%), inset -4px -5px 32px 3px rgb(255 255 255 / 10%), 25px 6px 20px -10px rgb(0 0 0 / 40%);
    }
}

</style>
