<script setup>
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ElMessage } from 'element-plus'
import {
  ArrowDown,
  Document,
  DocumentAdd,
  Download,
  Loading,
  Microphone,
  RefreshRight,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue'
import './abcjs-audio.css'
import './audio.css'
import { onBeforeUnmount, onMounted, ref } from 'vue'

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
const abcText = ref(sampleScores[0].value)
const showJp = ref(false)
const isRendering = ref(false)

// ========== 示例选择 / 清空 ==========
const selectSample = (sample) => {
  abcText.value = sample.value
  document.getElementById('score-container').innerHTML = ''
}

const clearEditor = () => {
  abcText.value = ''
  document.getElementById('score-container').innerHTML = ''
}

// ========== 渲染和播放 ============
const renderScore = () => {
  let text = abcText.value.trim()
  if (!text) {
    ElMessage.error('abc谱内容不能为空')
    return
  }
  isRendering.value = true

  if (showJp.value) text = '%%jianpu 1\n' + text

  // 先置空
  const scoreContainer = document.getElementById('score-container')
  scoreContainer.innerHTML = ''

  const abc = new abc2svg.Abc({
    img_out: (svgString) => {
      // 必须使用拼接，改函数会调用多次，第一个 SVG 片段包含了字体定义（@font-face）和样式，后续片段只包含音符图形
      // 使用覆盖会导致字体样式丢失，渲染乱码
      scoreContainer.innerHTML += svgString;
    }
  })
  abc.tosvg("my-tune", text);
  isRendering.value = false
}

// ========== 导出 ==========
const exportAsImage = async () => {
  /*if (!abcInstance) {
    ElMessage.warning('请先渲染乐谱')
    return
  }*/
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

const exportAsPdf = async () => {
 /* if (!abcInstance) {
    ElMessage.warning('请先渲染乐谱')
    return
  }*/
  try {
    const element = document.getElementById('score-container')
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
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

// =========== 检查abc2svg是否成功加载 ========
let timer
const waitForAbc2svg = (timeout = 5000, interval = 100) => {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    timer = setInterval(() => {
      if (window.abc2svg) {
        clearInterval(timer)
        timer = null
        resolve()
      } else if (Date.now() - start > timeout) {
        clearInterval(timer)
        timer = null
        reject(new Error('timeout'))
      }
    }, interval)
  })
}

onMounted(async () => {
  try {
    await waitForAbc2svg()
    renderScore()
  } catch (e) {
    ElMessage.error('abc2svg未加载完成，请稍后再试')
  }
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="container">
    <scriptx src="/abc2svg/abc2svg-1.js"/>
    <scriptx src="/abc2svg/jianpu-1.js"/>
    <scriptx src="/abc2svg/snd-1.js"/>
    <!--<scriptx src="/abc2svg/abcweb-1.js"/>-->
    <header class="header">
      <div class="header-left">
        <el-icon class="header-icon">
          <Document/>
        </el-icon>
        <h1 class="header-title">ABC音乐播放器（开发中）</h1>
      </div>
      <div class="header-right">
        <el-tag type="success" size="small">abc2svg 1.23.6</el-tag>
      </div>
    </header>

    <main class="main-content">
      <!-- 左侧：编辑区 -->
      <div class="panel left-panel">
        <div class="panel-header">
          <span class="panel-title">ABC谱编辑器</span>
          <div class="editor-actions">
            <el-dropdown @command="selectSample" style="margin-right: 12px" trigger="click">
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
            <el-button size="small" type="primary" plain @click="renderScore">渲染</el-button>
            <el-button size="small" type="danger" plain @click="clearEditor">清空</el-button>
          </div>
        </div>

        <div class="panel-body">
          <el-input
              v-model="abcText"
              style="width: 100%"
              :rows="22"
              type="textarea"
              placeholder="在这里输入ABC格式的乐谱..."
              resize="none"
          />
        </div>

        <!-- 播放控制面板 -->
<!--        <div class="audio-section">
          <div class="play-controls">
            <el-button
                type="primary"
                size="small"
                @click="isPlaying ? pause() : play()"
                :disabled="!abc2svgReady"
            >
              <el-icon>
                <VideoPause v-if="isPlaying"/>
                <VideoPlay v-else/>
              </el-icon>
              {{ isPlaying ? '暂停' : '播放' }}
            </el-button>
            <el-button size="small" @click="restart" :disabled="!abc2svgReady">
              <el-icon>
                <RefreshRight/>
              </el-icon>
              重播
            </el-button>

            <div class="slider-group">
              <el-icon>
                <Microphone/>
              </el-icon>
              <el-slider
                  v-model="volume"
                  :min="0"
                  :max="1"
                  :step="0.05"
                  style="width: 100px"
                  @input="onVolumeChange"
              />
            </div>
            <div class="slider-group">
              <span class="slider-label">速度</span>
              <el-slider
                  v-model="speed"
                  :min="0.5"
                  :max="2"
                  :step="0.1"
                  style="width: 100px"
                  @input="onSpeedChange"
              />
            </div>
          </div>
        </div>-->
      </div>

      <!-- 右侧：乐谱展示区 -->
      <div class="panel right-panel">
        <div class="panel-header">
          <div class="header-left-inline">
            <span class="panel-title">乐谱展示</span>
            <el-switch
                v-model="showJp"
                @change="renderScore"
                active-text="简谱"
                inactive-text="五线谱"
                inline-prompt
                style="margin-left: 16px; --el-switch-on-color: #67c23a; --el-switch-off-color: #409eff;"
            />
          </div>
          <div class="export-buttons">
            <el-button size="small" @click="exportAsImage" :disabled="isRendering">
              <el-icon>
                <Download/>
              </el-icon>
              图片
            </el-button>
            <el-button size="small" type="success" @click="exportAsPdf" :disabled="isRendering">
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

.header-left-inline {
  display: flex;
  align-items: center;
}

.editor-actions {
  display: flex;
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
  padding: 10px 12px;
  background: #fafafa;
  flex-shrink: 0;

  .play-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    .slider-group {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #606266;

      .slider-label {
        font-size: 12px;
        white-space: nowrap;
      }
    }
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
    flex-direction: column;
    align-items: center;

    :deep(svg) {
      max-width: 100%;
      height: auto;
    }

    // 播放时音符高亮样式（follow-1.js 会添加此类名）
    :deep(.playing) {
      fill: #e74c3c !important;
      stroke: #e74c3c !important;
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