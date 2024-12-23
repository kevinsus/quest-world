<script setup>
import { useRouter } from "vue-router"
const router = useRouter()

const back = () => router.push("/")
const startLevel = (level) => {
    console.log("Proceed Level:", level.name)
    router.push(`/levels/${level.name.toLowerCase().replace(/\s+/g, "-")}`)
}

const levels = [
    {
        name: "Level 1: Python Variables",
        description: "We will be introducing what variable is in python and how to use them",
        image: "@/assets/levels/level1",
    },
    {
        name: "Level 2: Python If-Statements",
        description: "We will be introducing what variable is in python and how to use them",
        image: "@/assets/levels/level2",
    },
    {
        name: "Level 3: Python While-Loop",
        description: "We will be introducing what variable is in python and how to use them",
        image: "@/assets/levels/level3",
    },
]
</script>

<template>
    <div class="h-screen flex flex-col justify-center items-center">
        <h1 class="text-3xl font-bold">Quest World Levels</h1>

        <div id="card-wrapper" class="flex gap-6">
            <div v-for="(level, index) in levels" :key="index" id="card" class="shadow-xl w-80 p-6 rounded-lg border">
                <img :src="level.image" alt="Level Image">
                <h2 class="text-xl font-semibold text-gray-800 mb-2">{{ level.name }}</h2>
                <p class="text-gray-600 mb-4">{{ level.description }}</p>
                <button @click="startLevel(level)" class="w-full bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600">Start Level</button>
            </div>
        </div>
        <button @click="back">Back</button>
    </div>
</template>