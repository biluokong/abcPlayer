import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/api'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('abc_player_token') || '')

  // 是否已登录
  const isLoggedIn = () => !!token.value

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const res = await request.get('/api/user/info')
      if (res.code === 200) {
        userInfo.value = res.data
        localStorage.setItem('abc_player_user_info', JSON.stringify(res.data))
      }
      return userInfo.value
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  // 修改用户信息
  const updateUserInfo = async (data) => {
    const res = await request.put('/api/user', data)
    if (res.code === 200) {
      // 修改成功后清除登录状态
      logout()
    }
    return res
  }

  // 保存 token
  const saveToken = (t) => {
    token.value = t
    localStorage.setItem('abc_player_token', t)
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('abc_player_token')
    localStorage.removeItem('abc_player_user_info')
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    fetchUserInfo,
    updateUserInfo,
    saveToken,
    logout,
  }
})
