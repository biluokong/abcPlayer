<script lang="js" setup>
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
  Loading,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue'

// 示例乐谱数据
const sampleScores = [
  { label: '小星星', value: `X:1\nT:小星星\nM:4/4\nL:1/4\nK:C\nC C G G | A A G2 | F F E E | D D C2 |]` },
  { label: '生日快乐', value: `X:1\nT:生日快乐\nM:3/4\nL:1/4\nK:G\nD2 D B | c2 B4 | A2 G4 | G4 |]` },
  { label: '欢乐颂', value: `X:1\nT:欢乐颂\nM:4/4\nL:1/4\nK:G\nG G A B | B A G2 | E E F G | G F E2 |]` }
]

// ABC谱文本
const abcText = ref(`X:1
T:小星星
M:4/4
L:1/4
K:C
C C G G | A A G2 | F F E E | D D C2 |]`)

// 状态管理
const isPlaying = ref(false)
const isPaused = ref(false)
const abcBoxRef = ref(null)
/**
 * 当前渲染的乐谱对象，包含解析后的乐谱数据和元信息
 * @type {ABCJS.TuneObject | null}
 */
const abcVisualObj = ref(null)
const abcSynthObj = ref(null)
const currentTime = ref(0)
const duration = ref(0)
const isRendering = ref(false)

// 防抖定时器
let renderTimer = null

// 示例选择
const selectSample = (sample) => {
  abcText.value = sample.value
  ElMessage.success(`已加载示例：${sample.label}`)
}

// 渲染五线谱
const renderScore = async () => {
  if (!abcText.value.trim()) {
    ElMessage.warning('请输入ABC谱内容')
    return
  }
  isRendering.value = true

  try {
    // 解析ABC谱
    const result = abcjs.renderAbc('abc-box', abcText.value, {
      responsive: 'resize',
      staffwidth: 700
    })
    // 检查渲染结果是否有效
    if (!result || result.length === 0) {
      ElMessage.error('无法解析乐谱，请检查ABC格式！')
      return
    }
    abcVisualObj.value = result[0]

    // 获取SVG元素并设置样式
    /*setTimeout(() => {
      const svg = document.querySelector('#abc-box svg')
      if (svg) {
        svg.setAttribute('id', 'abc-sheet-music')
        svg.style.maxWidth = '100%'
        svg.style.height = 'auto'
      }
    }, 100)*/

    // 生成音频数据（异步初始化）
    if (abcjs.synth && abcVisualObj.value) {
      try {
        const synth = new abcjs.synth.CreateSynth()
        await synth.init({
          visualObj: abcVisualObj.value
        })
        duration.value = synth.duration || 0
        abcSynthObj.value = synth
      } catch (e) {
        console.error('音频初始化失败:', e)
        duration.value = 0
      }
    }

    isRendering.value = false
  } catch (error) {
    isRendering.value = false
    ElMessage.error('ABC谱解析错误：' + error.message)
  }
}

// 播放
const playMusic = async () => {
  if (!abcVisualObj.value) {
    ElMessage.warning('请先渲染五线谱')
    return
  }

  try {
    // 如果已经有synth实例且不是暂停状态，重新创建
    if (!abcSynthObj.value || !isPaused.value) {
      stopMusic()

      // 创建合成器
      abcSynthObj.value = new abcjs.synth.CreateSynth()

      // 初始化
      await abcSynthObj.value.init({
        visualObj: abcVisualObj.value
      })

      // 获取音频时长
      duration.value = abcSynthObj.value.duration || 0
    }

    // 开始播放
    abcSynthObj.value.start()

    isPlaying.value = true
    isPaused.value = false

    // 设置结束检测
    if (duration.value > 0) {
      setTimeout(() => {
        if (isPlaying.value) {
          stopMusic()
        }
      }, duration.value * 1000 + 500)
    }

  } catch (error) {
    console.error('播放失败:', error)
    ElMessage.error('播放失败：' + error.message)
  }
}

// 暂停
const pauseMusic = () => {
  if (abcSynthObj.value && isPlaying.value) {
    try {
      abcSynthObj.value.stop()
    } catch (e) {
      // 忽略
    }
    isPlaying.value = false
    isPaused.value = true
  }
}

// 停止
const stopMusic = () => {
  if (abcSynthObj.value) {
    try {
      abcSynthObj.value.stop()
    } catch (e) {
      // 忽略
    }
    abcSynthObj.value = null
  }
  isPlaying.value = false
  isPaused.value = false
  currentTime.value = 0
}

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 导出为图片
const exportAsImage = async () => {
  if (!abcVisualObj.value) {
    ElMessage.warning('请先渲染五线谱')
    return
  }

  try {
    ElMessage.info('正在生成图片...')
    const element = document.getElementById('abc-box')
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

// 导出为MIDI
const exportAsMidi = async () => {
  if (!abcVisualObj.value) {
    ElMessage.warning('请先渲染五线谱')
    return
  }

  try {
    ElMessage.info('正在生成MIDI...')

    // 创建合成器来生成MIDI
    const synth = new abcjs.synth.CreateSynth()
    await synth.init({
      visualObj: abcVisualObj.value
    })

    // 使用DownloadMIDI来获取MIDI数据
    const midiObject = abcjs.synth.DownloadMIDI
    if (midiObject) {
      midiObject(abcVisualObj.value)
    } else {
      ElMessage.error('MIDI导出功能不可用')
    }

  } catch (error) {
    console.error('导出MIDI失败:', error)
    ElMessage.error('导出MIDI失败')
  }
}

// 导出为PDF
const exportAsPdf = async () => {
  if (!abcVisualObj.value) {
    ElMessage.warning('请先渲染五线谱')
    return
  }

  try {
    ElMessage.info('正在生成PDF...')

    const element = document.getElementById('abc-box')
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

    // 添加标题
    pdf.setFontSize(18)
    pdf.setTextColor(64, 158, 255)
    pdf.text('ABC Music Sheet', pageWidth / 2, 15, { align: 'center' })

    // 添加日期
    pdf.setFontSize(10)
    pdf.setTextColor(128, 128, 128)
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 22, { align: 'center' })

    // 添加五线谱图片
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

// 监听ABC文本变化，防抖渲染
watch(abcText, (newVal) => {
  if (renderTimer) clearTimeout(renderTimer)
  if (newVal.trim()) {
    renderTimer = setTimeout(() => {
      renderScore()
    }, 500)
  }
})

onMounted(() => {
  renderScore()
})

onUnmounted(() => {
  stopMusic()
  if (renderTimer) clearTimeout(renderTimer)
})
</script>

<template>
  <div class="home-container">
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
        </div>

        <div class="panel-body">
          <el-input
              v-model="abcText"
              style="width: 100%"
              :rows="18"
              type="textarea"
              placeholder="在这里输入ABC格式的乐谱..."
              resize="none"
          />
        </div>

        <!-- 播放控制 -->
        <div class="playback-controls">
          <div class="control-buttons">
            <el-button
                type="primary"
                :icon="isPlaying ? VideoPause : VideoPlay"
                circle
                @click="isPlaying ? pauseMusic() : playMusic()"
                :disabled="!abcVisualObj"
            />
            <el-button
                type="danger"
                :icon="VideoPause"
                circle
                @click="stopMusic"
                :disabled="!abcVisualObj"
            />
          </div>

          <div class="progress-info">
            <span class="time">{{ formatTime(currentTime) }}</span>
            <el-slider
                v-model="currentTime"
                :max="duration || 100"
                :show-tooltip="false"
                :disabled="!abcVisualObj"
                style="flex: 1"
            />
            <span class="time">{{ formatTime(duration) }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧：五线谱展示 -->
      <div class="panel right-panel">
        <div class="panel-header">
          <span class="panel-title">五线谱展示</span>
          <div class="export-buttons">
            <el-button size="small" @click="exportAsImage" :disabled="!abcVisualObj">
              <el-icon>
                <Download/>
              </el-icon>
              图片
            </el-button>
            <el-button size="small" type="primary" @click="exportAsMidi" :disabled="!abcVisualObj">
              <el-icon>
                <DocIcon/>
              </el-icon>
              MIDI
            </el-button>
            <el-button size="small" type="success" @click="exportAsPdf" :disabled="!abcVisualObj">
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
          <div id="abc-box" ref="abcBoxRef"></div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="less" scoped>
.home-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;

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

.playback-controls {
  padding: 16px;
  border-top: 1px solid #ebeef5;
  background: #fafafa;

  .control-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 12px;
  }

  .progress-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 8px;

    .time {
      font-size: 12px;
      color: #909399;
      min-width: 40px;
      font-family: 'Consolas', monospace;
    }
  }
}

.sheet-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  background: #ffffff;
  min-height: 300px;

  #abc-box {
    width: 100%;
    display: flex;
    justify-content: center;

    :deep(svg) {
      max-width: 100%;
      height: auto;
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
