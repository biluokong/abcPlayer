
// 番茄简谱转ABC谱
import request from '@/api/index.js'

export const fqConvertAbcApi = (content) => {
  return request.get('/convert/fqToAbc', { params: { fq: content } })
}