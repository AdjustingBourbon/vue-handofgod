import { createRouter, createWebHashHistory } from 'vue-router'  // 改用 hash 模式
import App from '../App.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: App
  }
]

const router = createRouter({
  history: createWebHashHistory(),  // 使用 hash 模式
  routes
})

export default router 