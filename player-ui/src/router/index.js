import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user.js'

const routes = [
  {
    path: '/403',
    name: '403',
    component: () => import('@/views/other/403.vue'),
    meta: { public: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { public: true }
  },
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
  history: createWebHistory(),
  routes
})

// 白名单
const whiteList = ['home']

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('abc_player_token')

  if (to.name === 'login' || to.name === '403') {
    next()
    return
  }

  if (!token) {
    next({ name: 'login' })
    return
  }

  const userStore = useUserStore()
  if (userStore.menuPermissions.length === 0) await userStore.fetchUserInfo()

  // 白名单放行
  if (whiteList.includes(to.name)) {
    next()
    return
  }

  if (!userStore.menuPermissions.includes(to.name)) {
    next({ name: '403' })
    return
  }

  next()
})

export default router
