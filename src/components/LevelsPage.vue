<script setup>
import { useRouter } from "vue-router"
const router = useRouter()

const back = () => router.push("/")
const startLevel = (level) => {
    console.log("Proceed Level:", level.name)
    router.push(`/levels/${level.path}`)
}

const levels = [
    {
        name: "Level 1: Python Variables",
        description: "We will be introducing what variable is in python and how to use them",
        image: "/assets/levels/level1.png",
        path: "level-1"
    },
    {
        name: "Level 2: Python While-Loop",
        description: "We will be introducing what variable is in python and how to use them",
        image: "/assets/levels/level2.png",
        path: "level-2"
    },
    {
        name: "Level 3: Bonus Level",
        description: "We will be introducing what variable is in python and how to use them",
        image: "/assets/levels/level2.png",
        path: "level-3"
    },
]
</script>

<template>
    <div class="bg-[url('/assets/MainMenu-bg.jpg')] relative bg-cover h-screen flex flex-col justify-center items-center">
        <button @click="back" class="absolute left-0 top-0 bg-white font-semibold py-2 rounded w-1/6 m-4" >Back</button>

        <h1 class="text-white text-6xl pb-32">Quest World Levels</h1>

        <div id="card-wrapper" class="flex gap-6">
            <div v-for="(level, index) in levels" :key="index" id="card" class="shadow-xl w-80 p-6 rounded-lg border space-y-6 bg-black">
                <img :src="level.image" alt="Level Image" class="rounded rounded-lg" >
                <h2 class="text-xl font-semibold text-white mb-2">{{ level.name }}</h2>
                <p class="text-white mb-4">{{ level.description }}</p>
                <button @click="startLevel(level)" class="w-full bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600">Start Level</button>
            </div>
        </div>
    </div>
</template>