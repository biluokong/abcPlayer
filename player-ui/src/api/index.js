import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router/index.js'

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
  timeout: 10000,
})

// 防止重复处理 401
let isHandling401 = false

// 请求拦截器
request.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('abc_player_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
    (response) => {
      const data = response.data

      // 处理 401
      if (data.code === 401) {
        return handleUnauthorized(response.config)
      }

      // 处理业务错误
      if (data.code !== 200) {
        ElMessage.error(data.message || '请求失败')
        return Promise.reject(data.message || '请求失败')
      }

      return data
    },
    (error) => {
      // 网络错误或 HTTP 状态码错误
      if (error.response?.status === 401) {
        return handleUnauthorized(error.config)
      }

      ElMessage.error(error.message || '网络请求失败')
      return Promise.reject(error)
    }
)

// 统一处理 401
function handleUnauthorized(config) {
  if (isHandling401) {
    // 如果已经在处理，直接返回错误
    return Promise.reject(new Error('未授权'))
  }

  isHandling401 = true

  ElMessage.error('登录已过期，请重新登录！')

  // 避免在登录页循环跳转
  if (router.currentRoute.value.path !== '/login') {
    router.replace({ name: 'login' })
  }

  // 重置标志（延迟重置，避免短时间内多次触发）
  setTimeout(() => {
    isHandling401 = false
  }, 1000)

  return Promise.reject(new Error('未授权'))
}

export default request