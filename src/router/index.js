import { createRouter, createWebHistory } from "vue-router";
import MainMenu from "@/components/MainMenu.vue"
import LevelsPage from "@/components/LevelsPage.vue"

const routes = [
    { path: "/", name: "MainMenu", component: MainMenu },
    { path: "/levels", name: "LevelsPage", component: LevelsPage },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router
 