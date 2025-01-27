import { createRouter, createWebHistory } from "vue-router";
import MainMenu from "@/components/MainMenu.vue"
import LevelsPage from "@/components/LevelsPage.vue"
import Levels from "@/components/levels/levels.vue"

const routes = [
    { path: "/", name: "MainMenu", component: MainMenu },
    { path: "/levels", name: "LevelsPage", component: LevelsPage },
    { path: "/levels/level1", name: "Level1", component: Levels },
    { path: "/levels/level2", name: "Level2", component: Levels },
    { path: "/levels/level3", name: "Level3", component: Levels },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router
 