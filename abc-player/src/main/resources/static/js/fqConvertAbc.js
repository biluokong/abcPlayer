

/**
 * 发送请求，获取番茄简谱转换为ABC谱的结果
 */
async function renderScore() {
  const fqInput = document.getElementById('fqInput')
  const scoreContainer = document.getElementById('score-container')

  // 验证输入
  const fqText = fqInput.value.trim()
  if (!fqText) {
    confirm('请输入番茄简谱内容！')
    return
  }

  // 显示加载状态
  scoreContainer.innerText = '正在转换简谱...'

  try {
    // 调用后端API进行转换
    const result = await HttpUtil.get('/api/convert/fqToAbc', { fq: fqText })
    // 使用 <pre> 标签保留换行符和空格格式
    scoreContainer.innerHTML = result.data
  } catch (error) {
    console.error('简谱转换错误:', error)
    scoreContainer.innerText = '❌ 转换失败: ' + error.message
  }
}

/**
 * 清空编辑器和乐谱显示
 */
function clearEditor() {
  document.getElementById('fqInput').value = ''
  document.getElementById('score-container').innerHTML = ''
}
