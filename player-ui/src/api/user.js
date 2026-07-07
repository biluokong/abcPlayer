import request from '@/api/index.js'

// 登录
export const loginApi = (params) => {
  return request.post('/user/login', null, { params })
}

// 查询用户信息
export const getUserInfoApi = () => {
  return request.get('/user/info')
}

// 修改用户信息
export const updateUserInfoApi = (params) => {
  return request.put('/user', params)
}

