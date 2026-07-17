<script setup>
import { ref, onMounted } from 'vue'
import { DocumentAdd, DocumentCopy, Download, Loading } from '@element-plus/icons-vue'
import html2canvas from 'html2canvas'
import { ElMessage } from 'element-plus'
import jsPDF from 'jspdf'

// 输入文本
const inputText = ref('2 3 _2 _6 2 - | 0 2 3 2 3 5 3 | 2 3 _2 _6 1 - | 0 ^1 7 5 3 |\n2 3 _2 _6 2 - | 0 2 3 2 3 5 3 | 2 3 2 1 _6 - | _6 - 0 0 |')
// UI 状态
const isRendering = ref(false)

// 笛子6个孔的位置数据
const POSITIONS = [
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 0, 0],
  [1, 1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0]
]

// 指法映射 - 筒音5
function getFingeringTong5(note, octave) {
  if (octave === -1) {
    const map = { 5: 0, 6: 1, 7: 2, 1: 3, 2: 4, 3: 5, 4: 6 }
    if (map[note] !== undefined) return POSITIONS[map[note]]
    return null
  }
  const map = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 7, 6: 1, 7: 2 }
  if (map[note] !== undefined) return POSITIONS[map[note]]
  return null
}

// 指法映射 - 筒音1
function getFingeringTong1(note, octave) {
  if (octave === -1) return null
  const map = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6 }
  if (map[note] !== undefined) return POSITIONS[map[note]]
  return null
}

// 获取指法
function getFingering(note, octave, mode) {
  return mode === '5' ? getFingeringTong5(note, octave) : getFingeringTong1(note, octave)
}

// 解析输入
function parseInput(text) {
  const tokens = []
  const parts = text.trim().split(/\s+/)
  for (const part of parts) {
    if (!part) continue
    if (part === '|') {
      tokens.push({ type: 'barline' })
      continue
    }
    if (part === '-') {
      tokens.push({ type: 'sustain' })
      continue
    }
    if (part === '0') {
      tokens.push({ type: 'rest' })
      continue
    }
    let octave = 0, i = 0
    while (i < part.length) {
      if (part[i] === '_') {
        octave = -1
        i++
      } else if (part[i] === '^') {
        octave = 1
        i++
      } else if (part[i] >= '1' && part[i] <= '7') {
        tokens.push({ type: 'note', note: parseInt(part[i]), octave })
        octave = 0
        i++
      } else if (part[i] === '0') {
        tokens.push({ type: 'rest' })
        i++
      } else if (part[i] === '-') {
        tokens.push({ type: 'sustain' })
        i++
      } else if (part[i] === '|') {
        tokens.push({ type: 'barline' })
        i++
      } else {
        i++
      }
    }
  }
  return tokens
}

// 渲染音符标签
function makeLabel(text, octave) {
  return {
    dotAbove: octave === 1,
    noteNum: text,
    dotBelow: octave === -1
  }
}

// D调哨笛频率映射
const NOTE_FREQ_D = {
  '5': {
    '-1_5': 293.66, '-1_6': 329.63, '-1_7': 369.99,
    '-1_1': 392.00, '-1_2': 440.00, '-1_3': 493.88, '-1_4': 523.25,
    '0_1': 392.00, '0_2': 440.00, '0_3': 493.88, '0_4': 523.25, '0_5': 587.33,
    '0_6': 659.26, '0_7': 739.99,
    '1_1': 783.99, '1_2': 880.00, '1_3': 987.77, '1_4': 1046.50, '1_5': 1174.66,
    '1_6': 1318.51, '1_7': 1479.98
  },
  '1': {
    '0_1': 293.66, '0_2': 329.63, '0_3': 369.99, '0_4': 392.00,
    '0_5': 440.00, '0_6': 493.88, '0_7': 554.37,
    '1_1': 587.33, '1_2': 659.26, '1_3': 739.99, '1_4': 783.99,
    '1_5': 880.00, '1_6': 987.77, '1_7': 1108.73
  }
}

function getFreq(note, octave, mode) {
  const key = octave + '_' + note
  const table = NOTE_FREQ_D[mode]
  return table ? (table[key] || null) : null
}

// 播放音频
let ctx = null

function playTone(freq, duration, volume = 0.6) {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  const t = ctx.currentTime

  const osc1 = ctx.createOscillator()
  osc1.type = 'sawtooth'
  osc1.frequency.value = freq

  const osc2 = ctx.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.value = freq * 2

  const osc3 = ctx.createOscillator()
  osc3.type = 'sine'
  osc3.frequency.value = freq * 3

  const bufferSize = ctx.sampleRate * 0.02
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true

  const gain1 = ctx.createGain()
  const gain2 = ctx.createGain()
  const gain3 = ctx.createGain()
  const gainNoise = ctx.createGain()

  gain1.gain.setValueAtTime(0, t)
  gain1.gain.linearRampToValueAtTime(volume * 0.15, t + 0.01)
  gain1.gain.linearRampToValueAtTime(volume * 0.9, t + 0.04)
  gain1.gain.setValueAtTime(volume * 0.95, t + 0.06)
  gain1.gain.linearRampToValueAtTime(volume * 0.7, t + duration * 0.3)
  gain1.gain.linearRampToValueAtTime(volume * 0.85, t + duration * 0.6)
  gain1.gain.linearRampToValueAtTime(volume * 0.5, t + duration * 0.85)
  gain1.gain.linearRampToValueAtTime(0, t + duration + 0.02)

  gain2.gain.setValueAtTime(0, t)
  gain2.gain.linearRampToValueAtTime(volume * 0.05, t + 0.02)
  gain2.gain.linearRampToValueAtTime(volume * 0.3, t + 0.06)
  gain2.gain.linearRampToValueAtTime(volume * 0.35, t + 0.1)
  gain2.gain.linearRampToValueAtTime(volume * 0.2, t + duration * 0.5)
  gain2.gain.linearRampToValueAtTime(0, t + duration + 0.02)

  gain3.gain.setValueAtTime(0, t)
  gain3.gain.linearRampToValueAtTime(volume * 0.02, t + 0.03)
  gain3.gain.linearRampToValueAtTime(volume * 0.12, t + 0.08)
  gain3.gain.linearRampToValueAtTime(volume * 0.08, t + duration * 0.4)
  gain3.gain.linearRampToValueAtTime(0, t + duration + 0.02)

  gainNoise.gain.setValueAtTime(0, t)
  gainNoise.gain.linearRampToValueAtTime(volume * 0.08, t + 0.02)
  gainNoise.gain.linearRampToValueAtTime(volume * 0.15, t + 0.05)
  gainNoise.gain.linearRampToValueAtTime(volume * 0.03, t + duration * 0.3)
  gainNoise.gain.linearRampToValueAtTime(0, t + duration * 0.5)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = freq * 6
  filter.Q.value = 0.8

  osc1.connect(gain1)
  osc2.connect(gain2)
  osc3.connect(gain3)
  noise.connect(gainNoise)

  const mixGain = ctx.createGain()
  mixGain.gain.value = 1

  gain1.connect(mixGain)
  gain2.connect(mixGain)
  gain3.connect(mixGain)
  gainNoise.connect(mixGain)

  mixGain.connect(filter)
  filter.connect(ctx.destination)

  osc1.start(t)
  osc1.stop(t + duration + 0.05)
  osc2.start(t)
  osc2.stop(t + duration + 0.05)
  osc3.start(t)
  osc3.stop(t + duration + 0.05)
  noise.start(t)
  noise.stop(t + duration + 0.05)
}

// 响应式数据
const mode = ref('5')
const bpm = ref(90)

// 播放状态
const playState = ref({ playing: false, timer: null, index: 0 })

// 计算渲染数据
const scoreData = []

function render() {
  const tokens = parseInput(inputText.value)

  for (const token of tokens) {
    if (token.type === 'barline') {
      scoreData.push({ type: 'barline' })
      continue
    }
    if (token.type === 'rest' || token.type === 'sustain') {
      scoreData.push({
        type: 'rest-or-sustain',
        label: makeLabel(token.type === 'rest' ? '0' : '—', 0),
        opacity: '0'
      })
    } else if (token.type === 'note') {
      const fingering = getFingering(token.note, token.octave, mode.value)
      scoreData.push({
        type: 'note',
        label: makeLabel(token.note, token.octave),
        fingering: fingering,
        opacity: fingering ? '1' : '0.25'
      })
    }
  }
}

// 转换
async function convert() {
  const content = inputText.value.trim()
  if (!content) return
  isRendering.value = true
  render()
  isRendering.value = false
}

// 播放控制
function stopPlay() {
  playState.value.playing = false
  if (playState.value.timer) {
    clearTimeout(playState.value.timer)
    playState.value.timer = null
  }
}

function togglePlay() {
  if (playState.value.playing) {
    stopPlay()
    return
  }

  const tokens = parseInput(inputText.value)
  const playable = []
  let domIdx = 0
  for (const token of tokens) {
    if (token.type === 'barline') {
      domIdx++
      continue
    }
    playable.push({ token, domIdx })
    domIdx++
  }

  if (playable.length === 0) return

  const events = []
  for (let i = 0; i < playable.length; i++) {
    const { token, domIdx } = playable[i]
    if (token.type === 'sustain' && events.length > 0) {
      events[events.length - 1].beats++
      events[events.length - 1].domIndices.push(domIdx)
    } else {
      events.push({ token, beats: 1, domIndices: [domIdx] })
    }
  }

  playState.value.playing = true
  playState.value.index = 0

  function step() {
    if (!playState.value.playing || playState.value.index >= events.length) {
      stopPlay()
      return
    }
    const ev = events[playState.value.index]
    const dur = ev.beats * (60000 / bpm.value) / 1000

    if (ev.token.type === 'note') {
      const freq = getFreq(ev.token.note, ev.token.octave, mode.value)
      if (freq) playTone(freq, dur * 0.9)
    }

    playState.value.index++
    playState.value.timer = setTimeout(step, ev.beats * (60000 / bpm.value))
  }

  step()
}

// 监听变化
function handleInputChange() {
  render()
}

function handleModeChange() {
  render()
}

// ========== 导出功能 ==========
/** 导出为图片 */
const exportAsImage = async () => {
  if (scoreData.length === 0) {
    ElMessage.warning('请先生成洞洞谱')
    return
  }

  try {
    ElMessage.info('正在生成图片...')
    const element = document.getElementById('render-container')
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false
    })

    const link = document.createElement('a')
    link.download = `dong-dong-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()

    ElMessage.success('图片导出成功')
  } catch (error) {
    console.error('导出图片失败:', error)
    ElMessage.error('导出图片失败')
  }
}
</script>

<template>
  <div class="container">
    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 左侧：简谱编辑 -->
      <div class="panel left-panel">
        <div class="panel-header">
          <span class="panel-title">简谱编辑器</span>
          <div class="buttons">
            <el-button size="small" type="success" @click="convert">
              生成
            </el-button>
          </div>
        </div>

        <div class="panel-body">
          <el-input
              v-model="inputText"
              style="width: 100%"
              :rows="25"
              type="textarea"
              placeholder="在这里输入简谱格式的乐谱..."
              resize="none"
          />
          <div class="syntax-help">
            <code>1-7</code> 音符 &nbsp; <code>_</code> 低八度 &nbsp; <code>^</code> 高八度 &nbsp; <code>0</code> 休止
            &nbsp; <code>-</code> 延长 &nbsp; <code>|</code> 小节线 &nbsp; <code> </code> 空格分隔
          </div>
        </div>
      </div>

      <!-- 右侧：洞洞谱 -->
      <div class="panel right-panel">
        <div class="panel-header">
          <span class="panel-title">洞洞谱</span>
          <div class="buttons">
            <el-button size="small" @click="exportAsImage" :disabled="scoreData.length === 0">
              <el-icon>
                <Download/>
              </el-icon>
              图片
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
          <div class="render-box" id="render-container">
            <div v-for="(item, index) in scoreData" :key="index" class="score-item">
              <!-- 小节线 -->
              <div v-if="item.type === 'barline'" class="barline"></div>
              <!-- 音符 -->
              <div v-else class="note-group">
                <div class="note-label">
                  <div class="dot-above" :style="{ opacity: item.label.dotAbove ? '1' : '0'}">•</div>
                  <div class="note-num">{{ item.label.noteNum }}</div>
                  <div class="dot-below" :style="{ opacity: item.label.dotBelow ? '1' : '0'}">•</div>
                </div>
                <div class="whistle-body" :style="{ opacity: item.opacity }">
                  <div
                      v-for="i in 6"
                      :key="i"
                      class="hole"
                      :class="{ closed: item.fingering && item.fingering[i - 1] }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <!--输入区域-->
<!--    <div class="controls">
      <div class="control-row">
        <label>指法：</label>
        <div class="radio-group">
          <label :class="{ active: mode === '5' }">
            <input type="radio" v-model="mode" value="5" @change="handleModeChange">
            <span>筒音5</span>
          </label>
          <label :class="{ active: mode === '1' }">
            <input type="radio" v-model="mode" value="1" @change="handleModeChange">
            <span>筒音1</span>
          </label>
        </div>
      </div>
      <div class="control-row">
        <textarea
            v-model="inputText"
            @input="handleInputChange"
            placeholder="输入简谱，例如：_5 _6 1 2 3 ^1 ^2 ..."
        ></textarea>
      </div>

      <div class="control-row play-row" style="margin-top:10px;margin-bottom:0">
        <button
            class="play-btn"
            :class="{ active: playState.playing }"
            @click="togglePlay"
        >
          {{ playState.playing ? '⏸ 暂停' : '▶ 播放' }}
        </button>
        <button class="play-btn" @click="stopPlay">⏹ 停止</button>
        <label style="font-size:14px;color:#555">BPM:</label>
        <input type="number" class="bpm-input" v-model="bpm" min="30" max="300">
      </div>
    </div>-->

<!--    <div class="output">
      <p v-if="scoreData.length === 0" class="placeholder">请在上方输入简谱</p>
      <div v-else v-for="(item, index) in scoreData" :key="index" class="score-row">
        &lt;!&ndash; 小节线 &ndash;&gt;
        <div v-if="item.type === 'barline'" class="barline"></div>
        &lt;!&ndash; 音符 &ndash;&gt;
        <div v-else class="note-group">
          <div class="note-label">
            <div class="dot-above">{{ item.label.dotAbove }}</div>
            <div class="note-num">{{ item.label.noteNum }}</div>
            <div class="dot-below">{{ item.label.dotBelow }}</div>
          </div>
          <div class="whistle-body" :style="{ opacity: item.opacity }">
            <div
                v-for="i in 6"
                :key="i"
                class="hole"
                :class="{ closed: item.fingering && item.fingering[i - 1] }"
            ></div>
          </div>
        </div>
      </div>
    </div>-->
  </div>
</template>

<style scoped lang="less">
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px;
  box-sizing: border-box;
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

  .syntax-help {
    padding-top: 20px;
    font-size: 14px;
    color: #6e6d6d;
    code {
      background: #f0f0f0;
      padding: 2px 4px;
      border-radius: 4px;
      font-size: 16px;
      color: #4c4b4b;
      margin: 0 4px;
    }
  }
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

.render-box {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #303133;
  display: flex;
  flex-wrap: wrap;

  .score-item {

    .barline {
      width: 1px;
      height: 150px;
      background: #222;
      margin: 0 6px;
      //align-self: stretch;
    }

    .note-group {
      width: 50px;
      height: 180px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .note-label {
        display: flex;
        flex-direction: column;
        //gap: 2px;
        margin-bottom: 4px;
      }

      .dot-above, .dot-below {
        font-size: 8px;
        height: 8px;
        color: #222;
      }

      .note-num {
        font-size: 16px;
        font-weight: bold;
        line-height: 1.1;
      }

      /* 笛身：单列6孔 */
      .whistle-body {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 6px 4px;
        border: 1px solid #222;
        border-radius: 10px;
        width: 12px;
      }
      .hole {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: 1px solid #222;
      }
      .hole.closed { background: #222; }
    }
  }
}
</style>
