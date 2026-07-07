<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as abcjs from 'abcjs'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ElMessage } from 'element-plus'
import {
  ArrowDown,
  Document,
  Document as DocIcon,
  DocumentAdd,
  Download,
  Loading
} from '@element-plus/icons-vue'
import './abcjs-audio.css'
import './audio.css'

// ========== 示例乐谱数据 ==========
const sampleScores = [
  { label: '小星星', value: `X:1\nT:小星星\nM:4/4\nL:1/4\nK:C\nC C G G | A A G2 | F F E E | D D C2 |]` },
  {
    label: '欢乐颂',
    value: `X:1\nT:欢乐颂（片段）\nM:4/4\nL:1/4\nK:C\nE E F G | G F E D | C C D E | E D2 D |\nE E F G | G F E D | C C D E | D C2 C |]`
  },
  { label: 'C大调音阶', value: `X:1\nT:C大调音阶\nM:4/4\nL:1/8\nK:C\nC D E F | G A B c | c B A G | F E D C |]` }
]

// ========== 全局状态 ==========
/**
 * 当前渲染的乐谱对象，包含解析后的乐谱数据和元信息
 * @type {abcjs.TuneObject | null}
 */
const currentVisualObj = ref(null)
/**
 * 合成器控制器实例，提供播放、暂停、循环等音频控制功能
 * @type {abcjs.SynthObjectController | null}
 */
let currentSynthControl = null
/**
 * MIDI 音频缓冲区实例，用于管理和播放音频数据
 * @type {abcjs.MidiBuffer | null}
 */
let currentSynth = null
/**
 * Web Audio API 的音频上下文，管理所有音频节点
 * @type {AudioContext | null}
 */
let audioContext = null
/** 音频系统是否已就绪 */
let isAudioReady = false
/** 定时器 ID，用于更新剩余时长显示 */
let intervalId = null
/** 乐谱总时长（秒） */
let totalTime = 0
const totalTimeStr = ref('0:00')

// ABC谱文本
const abcText = ref(sampleScores[0].value)
// UI 状态
const isRendering = ref(false)
// 防抖定时器
let renderTimer = null

/**
 * 音色库 URL 配置
 * common: 本地音色库路径
 * backup: 备用在线音色库（当本地资源不可用时使用）
 */
const SOUNDFONT_URLS = {
  common: './',
  backup: 'https://cdn.rawgit.com/gleitz/midi-js-soundfonts/master/FluidR3_GM/'
}
/** 当前使用的音色库 URL，默认为本地路径 */
let currentSoundfontUrl = SOUNDFONT_URLS.common

// ========== 游标控制器类 ==========
/**
 * CursorControl 类实现 ABCJS.CursorControl 接口
 * 用于在播放时高亮显示当前音符，实现卡拉 OK 式跟随效果
 */
class CursorControl {
  constructor() {
    /** 节拍细分数量 */
    this.beatSubDivision = 2
    /** SVG 游标线元素 */
    this.cursor = null
    /** 乐谱的 SVG 容器元素 */
    this.svg = null
  }

  /** 音频引擎准备就绪时的回调 */
  onReady() {
    console.log('音频引擎已准备就绪')
  }

  /** 播放开始时的回调，创建或初始化 SVG 游标线元素 */
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

  /**
   * 每个音符事件触发时的回调
   * @param {abcjs.NoteTimingEvent} ev - 音符时序事件对象
   */
  onEvent(ev) {
    const svg = document.querySelector('#score-container svg')
    if (!svg) return

    // 清除之前所有音符的高亮样式
    svg.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'))

    // 为当前音符元素添加高亮样式
    if (ev.elements) {
      ev.elements.forEach(noteGroup => {
        if (noteGroup && noteGroup.length) {
          noteGroup.forEach(element => {
            if (element) element.classList.add('highlight')
          })
        }
      })
    }

    // 更新游标线的位置到当前音符处
    this.cursor = svg.querySelector('.abcjs-cursor')
    if (this.cursor) {
      this.cursor.setAttribute('x1', String(ev.left - 3))
      this.cursor.setAttribute('x2', String(ev.left - 3))
      this.cursor.setAttribute('y1', String(ev.top))
      this.cursor.setAttribute('y2', String(ev.top + ev.height))
    }
  }

  /** 播放结束时的回调，清除所有高亮并将游标重置到初始位置 */
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

  /** 每个节拍时调用 */
  onBeat(beatNumber, totalBeats, totalTime) {
  }
}

/** 游标控制器实例 */
const cursorControl = new CursorControl()

// ========== 工具方法 ==========
/**
 * 格式化时间为 MM:SS 格式
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时间字符串
 */
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * 将MM:SS格式的时间字符串转换为秒数
 * @param {string} timeString - 时间字符串
 * @returns {number} 转换后的秒数
 */
const parseTimeString = (timeString) => {
  const [mins, secs] = timeString.split(':').map(Number)
  return mins * 60 + secs
}

// ========== 音频控制功能 ==========
/**
 * 自动初始化音频播放系统
 * 在乐谱渲染成功后自动调用，无需用户手动启用
 * 如果 AudioContext 处于 suspended 状态则跳过，等待用户交互后恢复
 */
const autoInitAudio = async () => {
  if (!audioContext) return
  if (audioContext.state === 'suspended') return
  if (!currentVisualObj.value) return
  if (isAudioReady) return

  try {
    await initAudio()
    isAudioReady = true
  } catch (error) {
    console.error('音频自动初始化失败:', error)
  }
}

// ========== 乐谱渲染功能 ==========
/**
 * 渲染 ABC 乐谱为 SVG 五线谱
 * 调用 ABCJS.renderAbc() 将文本格式的 ABC 乐谱转换为可视化的 SVG 图形
 */
const renderScore = async () => {
  if (!abcText.value.trim()) {
    ElMessage.warning('请输入ABC乐谱')
    return
  }

  isRendering.value = true

  try {
    // 停止当前正在播放的音频
    stopPlayback()

    const visualObjs = abcjs.renderAbc('score-container', abcText.value, {
      responsive: 'resize',
      staffwidth: 600,
      add_classes: true
    })

    if (!visualObjs || visualObjs.length === 0) {
      ElMessage.error('无法解析乐谱，请检查ABC格式')
      isRendering.value = false
      return
    }

    // 保存第一个乐谱对象
    currentVisualObj.value = visualObjs[0]
    // 初始化乐谱的时序信息
    currentVisualObj.value.setTiming()
    totalTime = currentVisualObj.value.getTotalTime()

    // 渲染成功后自动初始化音频播放系统
    await autoInitAudio()

    isRendering.value = false
  } catch (error) {
    isRendering.value = false
    console.error('渲染错误:', error)
    ElMessage.error('渲染失败：' + error.message)
  }
}

// ========== 音频初始化功能 ==========
/**
 * 初始化音频播放系统
 * 创建音频合成器和控制器，加载音色库资源，设置播放控件
 * 支持自动切换到备用音色库
 */
const initAudio = async () => {
  if (!abcjs.synth.supportsAudio()) {
    ElMessage.error('您的浏览器不支持Web Audio API')
    return
  }

  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }

    if (audioContext.state === 'suspended') {
      return
    }

    // 创建音频合成器实例
    if (!currentSynth) {
      currentSynth = new abcjs.synth.CreateSynth()
    }

    // 创建合成器控制器实例
    if (!currentSynthControl) {
      currentSynthControl = new abcjs.synth.SynthController()
    }

    // 加载音频控制 UI
    currentSynthControl.load('#audio-controls', cursorControl, {
      displayPlay: true,
      displayRestart: true,
      displayProgress: true,
      displayWarp: true,
      displayLoop: true
    })

    // 初始化音频合成器
    await currentSynth.init({
      visualObj: currentVisualObj.value,
      audioContext: audioContext,
      options: {
        soundFontUrl: currentSoundfontUrl
      }
    })

    // 设置要播放的乐谱并关联到控制器
    await currentSynthControl.setTune(currentVisualObj.value, false)

    // 设置剩余时长更新逻辑
    const playButton = document.querySelector('.abcjs-midi-start')
    const clock = document.querySelector('.abcjs-midi-clock')

    // 显示总时长
    totalTimeStr.value = formatTime(totalTime)

    if (playButton) {
      playButton.addEventListener('click', function () {
        clearInterval(intervalId)
        intervalId = setInterval(() => {
          const isPlaying = playButton.classList.contains('abcjs-pushed')
          if (isPlaying) {
            const remainingTime = totalTime - parseTimeString(clock.textContent)
            totalTimeStr.value = formatTime(remainingTime)
          } else {
            clearInterval(intervalId)
            if (parseTimeString(clock.textContent) === 0) {
              setTimeout(() => totalTimeStr.value = formatTime(totalTime), 500)
            }
          }
        }, 200)
      })
    }

  } catch (error) {
    console.error('音频初始化错误:', error)

    // 如果使用的是本地音色库失败，尝试切换到备用在线音色库
    if (currentSoundfontUrl === SOUNDFONT_URLS.common) {
      ElMessage.warning('本地音色库加载失败，正在尝试备用音色库...')
      currentSoundfontUrl = SOUNDFONT_URLS.backup
      await initAudio()
    } else {
      ElMessage.error('音频加载失败，但乐谱显示正常')
    }
  }
}

// ========== 播放控制 ==========
/**
 * 停止播放并清理音频资源
 * 关闭当前的合成器控制器和合成器实例，清空控制面板
 */
const stopPlayback = () => {
  if (currentSynthControl) {
    currentSynthControl.pause()
    currentSynthControl = null
  }
  currentSynth = null
  isAudioReady = false

  const audioControlsDiv = document.getElementById('audio-controls')
  if (audioControlsDiv) audioControlsDiv.innerHTML = ''
}

// ========== 示例选择 ==========
/** 选择示例乐谱 */
const selectSample = (sample) => {
  abcText.value = sample.value
}

// ========== 清空编辑器 ==========
/** 清空编辑器和乐谱显示 */
const clearEditor = () => {
  stopPlayback()
  abcText.value = ''
  const container = document.getElementById('score-container')
  container.innerHTML = ''
  currentVisualObj.value = null
}

// ========== 导出功能 ==========
/** 导出为图片 */
const exportAsImage = async () => {
  if (!currentVisualObj.value) {
    ElMessage.warning('请先渲染五线谱')
    return
  }

  try {
    ElMessage.info('正在生成图片...')
    const element = document.getElementById('score-container')
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false
    })

    const link = document.createElement('a')
    link.download = `abc-music-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()

    ElMessage.success('图片导出成功')
  } catch (error) {
    console.error('导出图片失败:', error)
    ElMessage.error('导出图片失败')
  }
}

/**
 * 将当前渲染的ABC乐谱导出为MIDI文件
 * 使用 abcjs.synth.getMidiFile() API 生成标准MIDI文件并触发下载
 */
const exportAsMidi = () => {
  if (!currentVisualObj.value) {
    ElMessage.warning('请先渲染五线谱')
    return
  }

  try {
    const midiFile = abcjs.synth.getMidiFile(currentVisualObj.value, {
      midiOutputType: 'encoded'
    })

    if (!midiFile) {
      ElMessage.error('MIDI生成失败，请检查乐谱是否有效')
      return
    }

    // 将 base64 data URI 转换为 Blob 并触发下载
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
    a.download = 'music.mid'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // 若 downloadUrl 为 Object URL（非 data URI），需延迟释放以避免内存泄漏
    if (!downloadUrl.startsWith('data:')) {
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 100)
    }

    ElMessage.success('MIDI导出成功！')
  } catch (error) {
    console.error('导出MIDI失败:', error)
    ElMessage.error('MIDI导出失败：' + error.message)
  }
}

/** 导出为PDF */
const exportAsPdf = async () => {
  if (!currentVisualObj.value) {
    ElMessage.warning('请先渲染五线谱')
    return
  }

  try {
    const element = document.getElementById('score-container')
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    pdf.setFontSize(18)
    pdf.setTextColor(64, 158, 255)
    pdf.text('ABC Music Sheet', pageWidth / 2, 15, { align: 'center' })

    pdf.setFontSize(10)
    pdf.setTextColor(128, 128, 128)
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 22, { align: 'center' })

    const imgWidth = pageWidth - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 10, 30, imgWidth, Math.min(imgHeight, pageHeight - 45))

    pdf.save(`abc-music-${Date.now()}.pdf`)
    ElMessage.success('PDF导出成功')
  } catch (error) {
    console.error('导出PDF失败:', error)
    ElMessage.error('导出PDF失败')
  }
}

// ========== 监听与生命周期 ==========
// 监听ABC文本变化，防抖渲染
watch(abcText, (newVal) => {
  if (renderTimer) clearTimeout(renderTimer)
  if (newVal.trim()) {
    renderTimer = setTimeout(() => {
      renderScore()
    }, 500)
  }
})

onMounted(async () => {
  // 页面加载时自动创建 AudioContext
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  } catch (e) {
    console.error('无法创建 AudioContext:', e)
  }

  // 用户首次点击页面时恢复 AudioContext（浏览器自动播放策略兜底）
  const resumeAudio = async () => {
    if (audioContext && audioContext.state === 'suspended') {
      await audioContext.resume()
      // 恢复后如果已有乐谱，自动初始化音频
      if (currentVisualObj.value && !isAudioReady) {
        await autoInitAudio()
      }
    }
    document.removeEventListener('click', resumeAudio)
  }
  document.addEventListener('click', resumeAudio, { once: true })

  await renderScore()
})

onUnmounted(() => {
  stopPlayback()
  clearInterval(intervalId)
  if (renderTimer) clearTimeout(renderTimer)
  if (audioContext) {
    audioContext.close()
  }
})
</script>

<template>
  <div class="container">
    <!-- 头部 -->
    <header class="header">
      <div class="header-left">
        <el-icon class="header-icon">
          <Document/>
        </el-icon>
        <h1 class="header-title">ABC音乐播放器</h1>
      </div>
      <div class="header-right">
        <el-tag type="success" size="small">abcjs 6.x</el-tag>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 左侧：ABC谱编辑 -->
      <div class="panel left-panel">
        <div class="panel-header">
          <span class="panel-title">ABC谱编辑器</span>
          <div class="editor-actions">
            <el-dropdown @command="selectSample" trigger="click">
              <el-button size="small" type="primary" plain>
                示例乐谱
                <el-icon class="el-icon--right">
                  <ArrowDown/>
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                      v-for="sample in sampleScores"
                      :key="sample.label"
                      :command="sample"
                  >
                    {{ sample.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button size="small" type="danger" plain @click="clearEditor">
              清空
            </el-button>
          </div>
        </div>

        <div class="panel-body">
          <el-input
              v-model="abcText"
              style="width: 100%"
              :rows="25"
              type="textarea"
              placeholder="在这里输入ABC格式的乐谱..."
              resize="none"
          />
        </div>

        <!-- 音频控制面板 -->
        <div class="audio-section">
          <div id="audio-controls"></div>
        </div>
      </div>

      <!-- 右侧：五线谱展示 -->
      <div class="panel right-panel">
        <div class="panel-header">
          <span class="panel-title">五线谱展示</span>
          <div class="export-buttons">
            <div id="total-duration" class="duration-badge">
              <span class="duration-icon">⏱️</span>
              <span class="duration-text">{{ totalTimeStr }}</span>
            </div>
            <el-button size="small" @click="exportAsImage" :disabled="!currentVisualObj">
              <el-icon>
                <Download/>
              </el-icon>
              图片
            </el-button>
            <el-button size="small" type="primary" @click="exportAsMidi" :disabled="!currentVisualObj">
              <el-icon>
                <DocIcon/>
              </el-icon>
              MIDI
            </el-button>
            <el-button size="small" type="success" @click="exportAsPdf" :disabled="!currentVisualObj">
              <el-icon>
                <DocumentAdd/>
              </el-icon>
              PDF
            </el-button>
          </div>
        </div>

        <div class="panel-body sheet-container">
          <div v-if="isRendering" class="loading-overlay">
            <el-icon class="is-loading" :size="32">
              <Loading/>
            </el-icon>
            <span>渲染中...</span>
          </div>
          <div id="score-container"></div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;

    .header-icon {
      font-size: 28px;
      color: #409eff;
    }

    .header-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.main-content {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
}

.left-panel {
  width: 40%;
  min-width: 350px;
}

.right-panel {
  flex: 1;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;

  .panel-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.panel-body {
  flex: 1;
  padding: 12px;
  overflow: auto;
  position: relative;

  :deep(.el-textarea__inner) {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    resize: none;
    border: none;
    background: #f9fafb;

    &:focus {
      background: #ffffff;
      box-shadow: inset 0 0 0 1px #409eff;
    }
  }
}

.audio-section {
  border-top: 1px solid #ebeef5;
  padding: 8px 12px;
  background: #fafafa;
  flex-shrink: 0;

  #audio-controls {
    min-height: 20px;
  }
}

.sheet-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 14px;
  background: #ffffff;
  min-height: 0;

  #score-container {
    width: 100%;
    display: flex;
    justify-content: center;

    :deep(svg) {
      max-width: 100%;
      height: auto;
    }

    // 音符高亮样式
    :deep(.highlight) {
      fill: #e74c3c;
      stroke: #e74c3c;
    }

    // 游标线样式
    :deep(.abcjs-cursor) {
      stroke: #e74c3c;
      stroke-width: 2;
      opacity: 0.7;
    }
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
  color: #409eff;
  font-size: 14px;
}

.export-buttons {
  display: flex;
  gap: 8px;

  .el-button {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

/* ========== 总时长徽章样式 ========== */
.duration-badge {
  display: flex;
  align-items: center;
  margin-right: 10px;
  gap: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    border-color: rgba(255, 255, 255, 0.4);
  }
  .duration-icon {
    font-size: 16px;
    line-height: 1;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }
  .duration-text {
    font-family: 'Courier New', monospace;
    font-size: 15px;
    font-weight: bold;
    color: white;
    letter-spacing: 1px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    min-width: 40px;
    text-align: center;
  }
}

// 响应式布局
@media (max-width: 900px) {
  .main-content {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    min-width: auto;
    max-height: 45vh;
  }

  .right-panel {
    flex: 1;
    min-height: 0;
  }
}
</style>
