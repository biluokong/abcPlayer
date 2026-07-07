import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

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
    name: 'home',
    component: () => import('@/views/home/index.vue')
  },
  {
    path: '/fqConvertAbc',
    name: 'fqConvertAbc',
    component: () => import('@/views/convertAbc/fq.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 白名单
const whiteList = ['403', 'home']


// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('abc_player_token')
  const userInfoStr = localStorage.getItem('abc_player_user_info')

  if (to.name === 'login') {
    next()
    return
  }

  if (!token || !userInfoStr) {
    next({ name: 'login' })
    return
  }

  let userInfo = null
  try {
    userInfo = JSON.parse(userInfoStr)
  } catch (e) {
    // 解析失败，清除登录状态
    localStorage.removeItem('abc_player_token')
    localStorage.removeItem('abc_player_user_info')
    next({ name: 'login' })
    return
  }

  const allowedMenus = (userInfo.menuPermissions || '').split(',').map(m => m.trim()).filter(Boolean)

  // 白名单放行
  if (whiteList.includes(to.name)) {
    next()
    return
  }

  if (!allowedMenus.includes(to.name)) {
    next({ name: '403' })
    return
  }

  next()
})

export default router
