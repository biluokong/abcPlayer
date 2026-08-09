import request from '@/api/index.js'

// 番茄简谱转ABC谱
export const fqConvertAbcApi = (content) => {
  return request.get('/convert/fqToAbc', { params: { fq: content } })
}

/**
 * 简谱转洞洞谱
 * @param text 简谱文本
 * @param mode 指法模式
 */
export const convertDdpApi = (text, mode) => {
  return request.get('/convert/toDdp', { params: { text, mode } })
}