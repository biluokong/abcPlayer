import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/home/index.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/player/index.vue')
      },
      {
        path: '/fqConvertAbc',
        name: 'fqConvertAbc',
        component: () => import('@/views/convertAbc/fq.vue')
      },
      {
        path: '/generateDdp',
        name: 'generateDdp',
        component: () => import('@/views/generate/ddp.vue')
      }
    ]
  }
]

const router = createRouter({
  // history: createWebHistory(import.meta.env.VITE_APP_PUBLIC_PATH),
  history: createWebHashHistory(),
  routes
})

export default router
