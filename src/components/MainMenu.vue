<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

const play = () => {
    router.push("/levels");
};
const settings = () => {
    console.log("settings is clicked")
}
const learnMore = () => {
    console.log("learnMore is clicked")
}
</script>

<template>
    <div class="bg-[url('/assets/MainMenu-bg.jpg')] bg-cover flex items-center justify-end flex-col pb-16 h-screen">
        <h1 class="text-white text-6xl pb-32">Quest World</h1>

        <button @click="play" class="text-gray-900 bg-white border border-gray-700 hover:bg-gray-100 font-medium rounded text-xl px-5 py-2.5 me-2 mb-8 w-56">Play</button>
        <button @click="settings" class="text-gray-900 bg-white border border-gray-700 hover:bg-gray-100 font-medium rounded text-xl px-5 py-2.5 me-2 mb-8 w-56">Settings</button>
        <button @click="learnMore" class="text-gray-900 bg-white border border-gray-700 hover:bg-gray-100 font-medium rounded text-xl px-5 py-2.5 me-2 mb-8 w-56">Learn More</button>
    </div>
</template>