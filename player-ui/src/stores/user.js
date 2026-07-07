import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfoApi, updateUserInfoApi } from '@/api/user.js'

export const useUserStore = defineStore('user', () => {
  // 从 localStorage 恢复用户信息
  const savedUserInfo = localStorage.getItem('abc_player_user_info')
  const userInfo = ref(savedUserInfo ? JSON.parse(savedUserInfo) : {
    nickname: null,
    username: null,
    menuPermissions: null,
    token: null
  })
  const token = ref(localStorage.getItem('abc_player_token') || '')

  // 是否已登录
  const isLoggedIn = () => !!token.value

  // 获取用户信息
  const saveUserInfo = (data) => {
    localStorage.setItem('abc_player_user_info', JSON.stringify(data))
    localStorage.setItem('abc_player_token', data.token)
    userInfo.value = data
    token.value = data.token
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const { data } = await getUserInfoApi()
      localStorage.setItem('abc_player_user_info', JSON.stringify(data))
      userInfo.value = data
      return data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  // 修改用户信息（修改密码）
  const updateUserInfo = async (params) => {
    const { data } = await updateUserInfoApi(params)
    localStorage.setItem('abc_player_user_info', JSON.stringify(data))
    userInfo.value = data
    return data
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('abc_player_token')
    localStorage.removeItem('abc_player_user_info')
  }

  // 获取权限菜单
  const getMenuPermissions = () => {
    const menuPermissions = userInfo.value?.menuPermissions || ''
    return menuPermissions.split(',').map(m => m.trim()).filter(Boolean)
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    saveUserInfo,
    fetchUserInfo,
    updateUserInfo,
    logout,
    getMenuPermissions,
  }
})
