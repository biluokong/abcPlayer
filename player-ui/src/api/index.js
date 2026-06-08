import axios from 'axios'

const request = axios.create({
  baseURL: '',
  timeout: 10000,
})

// 请求拦截器 - 自动携带 Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('abc_player_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const data = response.data

    // 处理 401 未授权
    if (data.code === 401) {
      ElMessage.error(data.message || '登录已过期，请重新登录！')
      localStorage.removeItem('abc_player_token')
      localStorage.removeItem('abc_player_user_info')
      window.location.href = '/login.html'
      return Promise.reject(new Error(data.message || '未授权'))
    }

    if (data.code !== 200) {
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message || '请求失败'))
    }

    return data
  },
  (error) => {
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录！')
      localStorage.removeItem('abc_player_token')
      localStorage.removeItem('abc_player_user_info')
      window.location.href = '/login.html'
    } else {
      ElMessage.error(error.message || '请求错误')
    }
    return Promise.reject(error)
  },
)

export default request
