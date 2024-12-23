<script setup>
const levels = [
  { id: 1, name: "Level 1", objective: "Learn variables", image: "@/assets/level1.png" },
  { id: 2, name: "Level 2", objective: "Learn loops", image: "@/assets/level2.png" },
  { id: 3, name: "Level 3", objective: "Learn conditionals", image: "@/assets/level3.png" },
];

const selectLevel = (levelId) => {
  console.log(`Level ${levelId} selected`);
  // Add navigation to the game interface later
};
</script>

<template>
  <div class="h-screen bg-gray-100 flex flex-col items-center">
    <h1 class="text-4xl font-bold mt-8 mb-4">Select a Level</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
      <div 
        v-for="level in levels" 
        :key="level.id" 
        @click="selectLevel(level.id)" 
        class="cursor-pointer bg-white shadow-md rounded-md p-4 text-center"
      >
        <img :src="level.image" alt="Level image" class="h-32 w-32 mx-auto mb-4">
        <h2 class="text-2xl font-semibold mb-2">{{ level.name }}</h2>
        <p class="text-gray-700">{{ level.objective }}</p>
      </div>
    </div>
  </div>
</template>
