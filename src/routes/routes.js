import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { name: '首頁', path: '/2048', component: () => import('../page/index.vue') },
  { name: '取消訂閱', path: '/2048/unsubscribe', component: () => import('../page/unsubscribe.vue') },
  { name: 'NotFound', path: '/2048/404', component: () => import('../page/404.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/2048/404' } 
]

const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    // 始终滚动到顶部
    return { top: 0 }
  },
  history: createWebHistory(),
  routes,//路由表
  mode: 'history' // history 改为 hash
})
export default router