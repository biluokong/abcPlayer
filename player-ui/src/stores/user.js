import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getUserInfoApi } from '@/api/user.js'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref({
    nickname: null,
    username: null,
    menuPermissions: null,
  })
  const token = ref(localStorage.getItem('abc_player_token') || '')
  const menuPermissions = computed(() => (userInfo.value?.menuPermissions || '')
      .split(',').map(m => m.trim()).filter(Boolean)
  )

  // 设置登录信息
  const saveLoginInfo = (data) => {
    userInfo.value = data
    localStorage.setItem('abc_player_token', data.token)
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    const { data } = await getUserInfoApi()
    userInfo.value = data
    return data
  }

  // 登出
  const logout = () => {
    userInfo.value = null
    localStorage.removeItem('abc_player_token')
    token.value = ''
  }

  return {
    userInfo,
    menuPermissions,
    token,
    saveLoginInfo,
    fetchUserInfo,
    logout,
  }
})
