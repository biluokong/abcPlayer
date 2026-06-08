<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useScoreStore } from '@/stores/score'
import ChangeUserInfoDialog from './ChangeUserInfoDialog.vue'

const userStore = useUserStore()
const scoreStore = useScoreStore()

// 修改用户信息弹窗
const userDialogVisible = ref(false)

// 状态消息
const statusText = ref('')
const statusClass = ref('')

// 总时长显示
const totalDuration = ref('0:00')
let intervalId = null

// 游标控制器类
class CursorControl {
  beatSubDivision = 2

  constructor() {
    this.beatSubDivision = 2
    this.cursor = null
    this.svg = null
  }

  onReady() {
    console.log('✅ 音频引擎已准备就绪')
  }

  onStart() {
    this.svg = document.querySelector('#score-container svg')
    if (!this.svg) return
    this.cursor = this.svg.querySelector('.abcjs-cursor')
    if (!this.cursor) {
      this.cursor = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      this.cursor.setAttribute('class', 'abcjs-cursor')
      this.cursor.setAttribute('x1', '0')
      this.cursor.setAttribute('y1', '0')
      this.cursor.setAttribute('x2', '0')
      this.cursor.setAttribute('y2', '0')
      this.svg.appendChild(this.cursor)
    }
  }

  onEvent(ev) {
    const svg = document.querySelector('#score-container svg')
    if (!svg) return
    svg.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'))
    if (ev.elements) {
      ev.elements.forEach(noteGroup => {
        if (noteGroup && noteGroup.length) {
          noteGroup.forEach(element => {
            if (element) element.classList.add('highlight')
          })
        }
      })
    }
    this.cursor = svg.querySelector('.abcjs-cursor')
    if (this.cursor) {
      this.cursor.setAttribute('x1', String(ev.left - 3))
      this.cursor.setAttribute('x2', String(ev.left - 3))
      this.cursor.setAttribute('y1', String(ev.top))
      this.cursor.setAttribute('y2', String(ev.top + ev.height))
    }
  }

  onFinished() {
    const svg = document.querySelector('#score-container svg')
    if (!svg) return
    svg.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'))
    this.cursor = svg.querySelector('.abcjs-cursor')
    if (this.cursor) {
      this.cursor.setAttribute('x1', '0')
      this.cursor.setAttribute('x2', '0')
      this.cursor.setAttribute('y1', '0')
      this.cursor.setAttribute('y2', '0')
    }
  }

  onBeat() {}
}

const cursorControl = new CursorControl()

// 音色库配置
const SOUNDFONT_URLS = {
  common: './sound/',
  backup: 'https://cdn.rawgit.com/gleitz/midi-js-soundfonts/master/FluidR3_GM/',
}
let currentSoundfontUrl = SOUNDFONT_URLS.common

// 渲染乐谱
async function renderScore() {
  const abcString = scoreStore.abcText.trim()
  if (!abcString) {
    scoreStore.showStatus('请输入ABC乐谱！', 'error')
    return
  }

  try {
    stopPlayback()

    const visualObjs = ABCJS.renderAbc('score-container', abcString, {
      responsive: 'resize',
      staffwidth: 600,
      add_classes: true,
    })

    if (!visualObjs || visualObjs.length === 0) {
      scoreStore.showStatus('无法解析乐谱，请检查ABC格式！', 'error')
      return
    }

    scoreStore.currentVisualObj = visualObjs[0]
    scoreStore.currentVisualObj.setTiming()
    scoreStore.totalTime = scoreStore.currentVisualObj.getTotalTime()
    totalDuration.value = scoreStore.formatTime(scoreStore.totalTime)
    scoreStore.showStatus('✅ 乐谱渲染成功！点击"启用音频"按钮后即可播放', 'success')

    if (scoreStore.isAudioEnabled && scoreStore.audioContext && scoreStore.audioContext.state === 'running') {
      await initAudio()
    }
  } catch (error) {
    console.error('渲染错误:', error)
    scoreStore.showStatus('❌ 渲染失败：' + error.message, 'error')
  }
}

// 启用音频
async function enableAudio() {
  if (scoreStore.isAudioEnabled) {
    scoreStore.showStatus('音频已启用', 'info')
    return
  }

  try {
    scoreStore.showStatus('正在启用音频...', 'info')

    if (!scoreStore.audioContext) {
      scoreStore.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }

    if (scoreStore.audioContext.state === 'suspended') {
      await scoreStore.audioContext.resume()
    }

    scoreStore.isAudioEnabled = true
    scoreStore.showStatus('✅ 音频已启用，现在可以播放了！', 'success')

    if (scoreStore.currentVisualObj) {
      await initAudio()
    }
  } catch (error) {
    console.error('启用音频失败:', error)
    scoreStore.showStatus('❌ 启用音频失败: ' + error.message, 'error')
  }
}

// 初始化音频
async function initAudio() {
  if (!ABCJS.synth.supportsAudio()) {
    scoreStore.showStatus('⚠️ 您的浏览器不支持Web Audio API', 'error')
    return
  }

  try {
    if (!scoreStore.audioContext) {
      scoreStore.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }

    if (scoreStore.audioContext.state === 'suspended') {
      scoreStore.showStatus('⏸️ 音频已暂停，点击"启用音频"按钮', 'warning')
      return
    }

    if (!scoreStore.currentSynth) {
      scoreStore.currentSynth = new ABCJS.synth.CreateSynth()
    }

    if (!scoreStore.currentSynthControl) {
      scoreStore.currentSynthControl = new ABCJS.synth.SynthController()
    }

    scoreStore.currentSynthControl.load('#audio-controls', cursorControl, {
      displayPlay: true,
      displayRestart: true,
      displayProgress: true,
      displayWarp: true,
      displayLoop: true,
    })

    await scoreStore.currentSynth.init({
      visualObj: scoreStore.currentVisualObj,
      audioContext: scoreStore.audioContext,
      options: {
        soundFontUrl: currentSoundfontUrl,
      },
    })

    await scoreStore.currentSynthControl.setTune(scoreStore.currentVisualObj, false)

    // 绑定播放按钮的时长更新逻辑
    setTimeout(() => {
      const playButton = document.querySelector('.abcjs-midi-start')
      const clock = document.querySelector('.abcjs-midi-clock')
      if (playButton && clock) {
        playButton.addEventListener('click', () => {
          clearInterval(intervalId)
          intervalId = setInterval(() => {
            const isPlaying = playButton.classList.contains('abcjs-pushed')
            if (isPlaying) {
              const [mins, secs] = clock.textContent.split(':').map(Number)
              const elapsed = mins * 60 + secs
              const remaining = scoreStore.totalTime - elapsed
              totalDuration.value = scoreStore.formatTime(Math.max(0, remaining))
            } else {
              clearInterval(intervalId)
              if (clock.textContent === '0:00') {
                setTimeout(() => {
                  totalDuration.value = scoreStore.formatTime(scoreStore.totalTime)
                }, 500)
              }
            }
          }, 200)
        })
      }
    }, 100)

    scoreStore.showStatus('🎵 音频加载完成，点击播放按钮！', 'success')
  } catch (error) {
    console.error('音频初始化错误:', error)
    if (currentSoundfontUrl === SOUNDFONT_URLS.common) {
      scoreStore.showStatus('⚠️ 正在尝试使用备用音色库...', 'warning')
      currentSoundfontUrl = SOUNDFONT_URLS.backup
      await initAudio()
    } else {
      scoreStore.showStatus('⚠️ 音频加载失败，但乐谱显示正常。', 'error')
    }
  }
}

// 停止播放
function stopPlayback() {
  if (scoreStore.currentSynthControl) {
    scoreStore.currentSynthControl.pause()
    scoreStore.currentSynthControl = null
  }
  scoreStore.currentSynth = null
  const audioControlsDiv = document.getElementById('audio-controls')
  if (audioControlsDiv) {
    audioControlsDiv.innerHTML = ''
  }
}

// 加载示例
function loadExample(name) {
  scoreStore.loadExample(name)
  nextTick(() => renderScore())
}

// 清空编辑器
function clearEditor() {
  scoreStore.clearEditor()
  totalDuration.value = '0:00'
}

// 导出图片
function exportAsImage() {
  const svg = document.querySelector('#score-container svg')
  if (!svg) {
    scoreStore.showStatus('❌ 请先渲染乐谱再导出！', 'error')
    return
  }

  try {
    const clone = svg.cloneNode(true)
    const bbox = svg.getBoundingClientRect()
    const width = bbox.width || 800
    const height = bbox.height || 400
    clone.setAttribute('width', width)
    clone.setAttribute('height', height)
    clone.setAttribute('viewBox', `0 0 ${width} ${height}`)

    const serializer = new XMLSerializer()
    let svgString = serializer.serializeToString(clone)
    if (!svgString.includes('xmlns=')) {
      svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
    }

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()

    img.onload = function () {
      const scale = 2
      const maxPageHeight = Math.round(width * Math.sqrt(2))
      const totalPages = Math.ceil(height / maxPageHeight)

      for (let page = 0; page < totalPages; page++) {
        const sourceY = page * maxPageHeight
        const pageHeight = Math.min(maxPageHeight, height - sourceY)
        const canvas = document.createElement('canvas')
        canvas.width = width * scale
        canvas.height = pageHeight * scale
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.scale(scale, scale)
        ctx.drawImage(img, 0, sourceY, width, pageHeight, 0, 0, width, pageHeight)

        canvas.toBlob(function (blob) {
          const downloadUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = downloadUrl
          a.download = totalPages === 1 ? '五线谱.png' : `五线谱_${page + 1}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          setTimeout(() => URL.revokeObjectURL(downloadUrl), 100)
        }, 'image/png')
      }
      setTimeout(() => URL.revokeObjectURL(url), 100)

      const msg = totalPages === 1
        ? '✅ 图片导出成功！（五线谱.png）'
        : `✅ 图片导出成功！共 ${totalPages} 张（五线谱_1.png ~ 五线谱_${totalPages}.png）`
      scoreStore.showStatus(msg, 'success')
    }

    img.onerror = function () {
      URL.revokeObjectURL(url)
      scoreStore.showStatus('❌ 图片导出失败，请重试', 'error')
    }
    img.src = url
  } catch (error) {
    console.error('导出图片失败:', error)
    scoreStore.showStatus('❌ 导出失败：' + error.message, 'error')
  }
}

// 导出 PDF
function exportAsPdf() {
  const originalContainer = document.querySelector('#score-container')
  const svg = originalContainer?.querySelector('svg')
  if (!svg) {
    scoreStore.showStatus('❌ 请先渲染乐谱再导出！', 'error')
    return
  }

  scoreStore.showStatus('📄 正在生成PDF...', 'info')

  try {
    const printContent = originalContainer.cloneNode(true)
    const iframe = document.createElement('iframe')
    iframe.style.position = 'absolute'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentWindow.document
    iframeDoc.open()
    iframeDoc.write(`<!DOCTYPE html><html><head><title>乐谱打印</title><meta charset="utf-8"><style>body{margin:0;padding:0;display:flex;justify-content:center;align-items:center;font-family:sans-serif}#score-container{max-width:100%;height:auto}svg{width:100%;height:auto}@media print{body{padding:0}}</style></head><body>${printContent.outerHTML}</body></html>`)
    iframeDoc.close()

    iframe.onload = () => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      setTimeout(() => {
        document.body.removeChild(iframe)
        scoreStore.showStatus('✅ PDF 生成完毕（如需保存，请在打印对话框中选择"另存为 PDF"）', 'success')
      }, 500)
    }
    if (iframe.contentWindow.document.readyState === 'complete') {
      iframe.onload()
    }
  } catch (err) {
    console.error('导出失败:', err)
    scoreStore.showStatus('❌ PDF导出失败，请重试', 'error')
  }
}

// 导出 MIDI
function exportAsMidi() {
  if (!scoreStore.currentVisualObj) {
    scoreStore.showStatus('❌ 请先渲染乐谱再导出！', 'error')
    return
  }

  try {
    const midiFile = ABCJS.synth.getMidiFile(scoreStore.currentVisualObj, {
      midiOutputType: 'encoded',
    })

    if (!midiFile) {
      scoreStore.showStatus('❌ MIDI生成失败，请检查乐谱是否有效', 'error')
      return
    }

    let downloadUrl
    if (typeof midiFile === 'string' && midiFile.startsWith('data:')) {
      downloadUrl = midiFile
    } else {
      let byteArray
      if (typeof midiFile === 'string') {
        const binaryString = atob(midiFile)
        byteArray = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          byteArray[i] = binaryString.charCodeAt(i)
        }
      } else {
        byteArray = midiFile
      }
      const blob = new Blob([byteArray], { type: 'audio/midi' })
      downloadUrl = URL.createObjectURL(blob)
    }

    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = 'score.mid'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    if (!downloadUrl.startsWith('data:')) {
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 100)
    }

    scoreStore.showStatus('✅ MIDI导出成功！（score.mid）', 'success')
  } catch (error) {
    console.error('导出MIDI失败:', error)
    scoreStore.showStatus('❌ MIDI导出失败：' + error.message, 'error')
  }
}

// 登出
function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    userStore.logout()
    window.location.href = '/login.html'
  }).catch(() => {})
}

// 监听 store 状态消息
watch(
  () => scoreStore.statusMessage,
  (msg) => {
    if (msg) {
      statusText.value = msg
      statusClass.value = scoreStore.statusType
    }
  },
)

import { nextTick } from 'vue'

onMounted(async () => {
  // 获取用户信息
  await userStore.fetchUserInfo()

  // 自动渲染默认乐谱
  nextTick(() => renderScore())

  // 页面首次点击时尝试启用音频
  document.body.addEventListener(
    'click',
    async () => {
      if (!scoreStore.isAudioEnabled && scoreStore.audioContext && scoreStore.audioContext.state === 'suspended') {
        await enableAudio()
      }
    },
    { once: true },
  )
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
  stopPlayback()
  if (scoreStore.audioContext) {
    scoreStore.audioContext.close()
  }
})
</script>

<template>
  <div class="home-container">
    <!-- 顶部用户信息栏 -->
    <el-row class="header-bar" justify="space-between" align="middle">
      <h1>🎵 ABC谱播放器</h1>
      <div class="user-info">
        <span>欢迎，{{ userStore.userInfo?.nickname || userStore.userInfo?.username || '用户' }}</span>
        <el-button type="primary" plain @click="userDialogVisible = true">
          <el-icon><Edit /></el-icon>
          修改用户信息
        </el-button>
        <el-button type="danger" plain @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-button>
      </div>
    </el-row>

    <!-- 功能导航 -->
    <el-card class="nav-card" shadow="hover">
      <div class="nav-content">
        <span class="nav-brand">其他功能：</span>
        <div class="nav-tabs">
          <el-button type="default" @click="$router.push('/fq-convert-abc')">
            🍅 番茄简谱转ABC
          </el-button>
          <el-button type="default" disabled>
            🕳️ ABC转洞洞谱(开发中)
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 主内容区 -->
    <el-row :gutter="20" class="main-content">
      <!-- 编辑器面板 -->
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>
            <h2>📝 ABC乐谱编辑器</h2>
          </template>

          <el-input
            id="abcInput"
            v-model="scoreStore.abcText"
            type="textarea"
            :rows="18"
            placeholder="在这里输入ABC格式的乐谱..."
            resize="vertical"
          />

          <div class="btn-group">
            <el-button type="primary" @click="renderScore">
              <el-icon><VideoPlay /></el-icon>
              渲染乐谱
            </el-button>
            <el-button type="info" plain @click="clearEditor">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
            <el-button type="success" @click="enableAudio">
              <el-icon><Headset /></el-icon>
              启用音频
            </el-button>
            <el-tag v-if="totalDuration !== '0:00'" type="primary" effect="dark" round>
              ⏱️ {{ totalDuration }}
            </el-tag>
          </div>

          <el-divider />

          <div class="btn-group">
            <el-button type="success" @click="exportAsImage">
              <el-icon><Picture /></el-icon>
              导出图片
            </el-button>
            <el-button type="danger" @click="exportAsPdf">
              <el-icon><Document /></el-icon>
              导出PDF
            </el-button>
            <el-button type="warning" @click="exportAsMidi">
              <el-icon><FolderOpened /></el-icon>
              导出MIDI
            </el-button>
          </div>

          <div v-if="statusText" class="status-bar">
            <el-alert :title="statusText" :type="statusClass" :closable="false" show-icon />
          </div>
        </el-card>
      </el-col>

      <!-- 乐谱显示面板 -->
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>
            <h2>🎼 五线谱预览</h2>
          </template>

          <div id="audio-controls" class="audio-controls"></div>
          <div id="score-container" class="score-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 示例曲谱 -->
    <el-card class="examples-card" shadow="hover">
      <template #header>
        <h3>🎵 快速体验示例</h3>
      </template>
      <div class="example-buttons">
        <el-button type="primary" plain @click="loadExample('twinkle')">⭐ 小星星</el-button>
        <el-button type="primary" plain @click="loadExample('ode')">🎉 欢乐颂</el-button>
        <el-button type="primary" plain @click="loadExample('scale')">🎹 C大调音阶</el-button>
      </div>
    </el-card>

    <!-- 底部说明 -->
    <el-card class="bottom-card" shadow="hover">
      <h3>相关说明</h3>
      <ol>
        <li>交流群：128108872</li>
      </ol>
    </el-card>

    <!-- 修改用户信息弹窗 -->
    <ChangeUserInfoDialog v-model="userDialogVisible" />
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

h1 {
  color: white;
  font-size: 2.2em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  margin: 0;
}

h2 {
  color: #667eea;
  font-size: 1.2em;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

h3 {
  color: #667eea;
  font-size: 1.1em;
  margin: 0;
}

.header-bar {
  margin-bottom: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 15px;
}

.user-info span {
  font-weight: 500;
}

.nav-card {
  margin-bottom: 24px;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.nav-brand {
  font-size: 1.2em;
  font-weight: bold;
  color: #667eea;
}

.nav-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.main-content {
  margin-bottom: 20px;
}

.btn-group {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.status-bar {
  margin-top: 12px;
}

.audio-controls {
  padding: 10px 14px;
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  margin-bottom: 14px;
  min-height: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.score-container {
  min-height: 380px;
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  overflow-x: auto;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.examples-card {
  margin-bottom: 20px;
}

.example-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.bottom-card {
  font-size: 14px;
}

.bottom-card ol {
  padding-left: 20px;
  margin: 8px 0 0;
}

.bottom-card li {
  line-height: 1.8;
}

:deep(.abcjs-cursor) {
  stroke: #ff0000;
  stroke-width: 3;
  stroke-dasharray: 4;
  filter: drop-shadow(0 0 2px rgba(255, 0, 0, 0.5));
}

:deep(.highlight) {
  fill: #ff6b6b !important;
  filter: drop-shadow(0 0 4px rgba(255, 107, 107, 0.5));
  transition: fill 0.1s ease;
}
</style>
