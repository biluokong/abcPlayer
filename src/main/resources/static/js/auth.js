/**
 * 认证工具类
 * 用于管理JWT Token和用户认证状态
 */

const AuthUtil = {
  // Token存储键名
  TOKEN_KEY: 'abc_player_token',
  USER_INFO_KEY: 'abc_player_user_info',

  /**
   * 保存Token到本地存储
   * @param {string} token - JWT Token
   */
  saveToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token)
  },

  /**
   * 获取Token
   * @returns {string|null} Token或null
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY)
  },

  /**
   * 删除Token
   */
  removeToken() {
    localStorage.removeItem(this.TOKEN_KEY)
  },

  /**
   * 保存用户信息
   * @param {Object} userInfo - 用户信息对象
   */
  saveUserInfo(userInfo) {
    localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo))
  },

  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息或null
   */
  async getUserInfo() {
    const { data } = await HttpUtil.get('/api/user/info')
    AuthUtil.saveUserInfo(data)
    const info = localStorage.getItem(this.USER_INFO_KEY)
    return info ? JSON.parse(info) : null
  },

  /**
   * 删除用户信息
   */
  removeUserInfo() {
    localStorage.removeItem(this.USER_INFO_KEY)
  },

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    const token = this.getToken()
    return token !== null && token !== ''
  },

  /**
   * 登出（清除所有认证信息）
   */
  logout() {
    this.removeToken()
    this.removeUserInfo()
  },

  /**
   * 获取带有认证头的请求配置
   * @param {Object} config - 原始配置
   * @returns {Object} 包含Authorization头的配置
   */
  getAuthConfig(config = {}) {
    const token = this.getToken()
    if (token) {
      return {
        ...config,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        }
      }
    }
    return config
  },

  /**
   * 执行带认证的fetch请求
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise} fetch Promise
   */
  async fetchWithAuth(url, options = {}) {
    const config = this.getAuthConfig(options)

    try {
      const response = await fetch(url, config)

      // 如果返回401，说明Token失效，跳转到登录页
      if (response.status === 401) {
        this.logout()
        window.location.href = '/login.html'
        throw new Error('未授权，请重新登录')
      }

      return response
    } catch (error) {
      console.error('请求失败:', error)
      throw error
    }
  },

  /**
   * 检查登录状态，未登录则跳转到登录页
   */
  checkLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = '/login.html'
      return false
    }
    return true
  }
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthUtil
}

const pathname = window.location.pathname
const menu = pathname.substring(1, pathname.lastIndexOf('.'))

// 检查登录状态
if (menu !== 'login' && AuthUtil.checkLogin()) {
  // 显示当前用户信息
  (async () => {
    const userInfo = await AuthUtil.getUserInfo()
    if (!userInfo.menuPermissions.split(',').includes(menu)) {
      alert('无权限访问此页面')
      window.history.back();
    }
    document.getElementById('currentUser').textContent = '欢迎，' + (userInfo.nickname || userInfo.username)
  })()
}

// 登出处理
function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    AuthUtil.logout()
    window.location.href = '/login.html'
  }
}

// 显示修改密码模态框
function showChangePasswordModal() {
  document.getElementById('changeUserInfoModal').style.display = 'block'
  // 清空表单和消息
  document.getElementById('changeUserInfoForm').reset()
  const info = JSON.parse(localStorage.getItem(AuthUtil.USER_INFO_KEY) || '{}')
  document.getElementById('nickname').value = info?.nickname || ''
  document.getElementById('passwordMessage').textContent = ''
  document.getElementById('passwordMessage').className = 'message'
}

// 关闭修改密码模态框
function closeChangeUserInfoModal() {
  document.getElementById('changeUserInfoModal').style.display = 'none'
}

// 处理修改密码表单提交
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('changeUserInfoForm')
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault()

      const nickname = document.getElementById('nickname').value
      const oldPassword = document.getElementById('oldPassword').value
      const newPassword = document.getElementById('newPassword').value
      const confirmPassword = document.getElementById('confirmPassword').value
      const messageEl = document.getElementById('passwordMessage')
      
      if (newPassword) {
        if (newPassword.length < 6) {
          messageEl.textContent = '新密码长度不能少于6位'
          messageEl.className = 'message error'
          return
        }

        // 验证新密码
        if (newPassword !== confirmPassword) {
          messageEl.textContent = '两次输入的新密码不一致'
          messageEl.className = 'message error'
          return
        }
      }
      
      try {
        // 调用后端API修改信息
        const result = await HttpUtil.put('/api/user', {
          nickname: nickname,
          oldPassword: oldPassword,
          newPassword: newPassword
        })

        messageEl.textContent = result.message || '修改成功'
        messageEl.className = 'message success'

        // 1.5秒后关闭模态框
        setTimeout(() => {
          closeChangeUserInfoModal()
          alert('修改成功，请重新登录')
          // 清除token并跳转到登录页
          AuthUtil.logout()
          window.location.href = '/login.html'
        }, 1500)
        
        if (result.code === 200) {

        } else {

          messageEl.className = 'message error'
        }
      } catch (error) {
        console.error('修改失败:', error)
        messageEl.textContent = error.message || '修改失败'
        messageEl.className = 'message error'
      }
    })
  }
})
