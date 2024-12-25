import { createRouter, createWebHistory } from "vue-router";
import MainMenu from "@/components/MainMenu.vue"
import LevelsPage from "@/components/LevelsPage.vue"
import Level1 from "@/components/levels/Level1.vue"
import Level2 from "@/components/levels/Level2.vue"
import Level3 from "@/components/levels/Level3.vue"

const routes = [
    { path: "/", name: "MainMenu", component: MainMenu },
    { path: "/levels", name: "LevelsPage", component: LevelsPage },
    { path: "/levels/level-1", name: "Level1", component: Level1 },
    { path: "/levels/level-2", name: "Level2", component: Level2 },
    { path: "/levels/level-3", name: "Level3", component: Level3 },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router
 