<script setup>
import { ref, onMounted } from 'vue'

// 笛子6个孔的位置数据
const POSITIONS = [
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 0, 0],
  [1, 1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
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
    if (part === '|') { tokens.push({ type: 'barline' }); continue }
    if (part === '-') { tokens.push({ type: 'sustain' }); continue }
    if (part === '0') { tokens.push({ type: 'rest' }); continue }
    let octave = 0, i = 0
    while (i < part.length) {
      if (part[i] === '_') { octave = -1; i++ }
      else if (part[i] === '^') { octave = 1; i++ }
      else if (part[i] >= '1' && part[i] <= '7') {
        tokens.push({ type: 'note', note: parseInt(part[i]), octave })
        octave = 0; i++
      } else if (part[i] === '0') { tokens.push({ type: 'rest' }); i++ }
      else if (part[i] === '-') { tokens.push({ type: 'sustain' }); i++ }
      else if (part[i] === '|') { tokens.push({ type: 'barline' }); i++ }
      else { i++ }
    }
  }
  return tokens
}

// 渲染音符标签
function makeLabel(text, octave) {
  return {
    dotAbove: octave === 1 ? '•' : '',
    noteNum: text,
    dotBelow: octave === -1 ? '•' : ''
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
    '1_6': 1318.51, '1_7': 1479.98,
  },
  '1': {
    '0_1': 293.66, '0_2': 329.63, '0_3': 369.99, '0_4': 392.00,
    '0_5': 440.00, '0_6': 493.88, '0_7': 554.37,
    '1_1': 587.33, '1_2': 659.26, '1_3': 739.99, '1_4': 783.99,
    '1_5': 880.00, '1_6': 987.77, '1_7': 1108.73,
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
const inputText = ref('2 3 _2 _6 2 - | 0 2 3 2 3 5 3 | 2 3 _2 _6 1 - | 0 ^1 7 5 3 |\n2 3 _2 _6 2 - | 0 2 3 2 3 5 3 | 2 3 2 1 _6 - | _6 - 0 0 |')
const mode = ref('5')
const bpm = ref(90)
const outputRef = ref(null)
const containerWidth = ref(860)

// 播放状态
const playState = ref({ playing: false, timer: null, index: 0 })

// 计算渲染数据
const scoreRows = ref([])

function render() {
  const tokens = parseInput(inputText.value)

  if (!inputText.value.trim()) {
    scoreRows.value = []
    return
  }

  const measures = [[]]
  for (const token of tokens) {
    if (token.type === 'barline') {
      measures.push([])
    } else {
      measures[measures.length - 1].push(token)
    }
  }
  while (measures.length > 1 && measures[measures.length - 1].length === 0) measures.pop()

  const perNote = 30
  const barGap = 16

  function measureWidth(m) { return m.length * perNote + barGap }

  const rows = []
  let currentRow = []
  let usedW = 0

  for (let mi = 0; mi < measures.length; mi++) {
    const m = measures[mi]
    if (m.length === 0) continue
    const mW = measureWidth(m)

    if (usedW > 0 && usedW + mW > containerWidth.value) {
      rows.push(currentRow)
      currentRow = []
      usedW = 0
    }

    const rowItems = []
    for (const token of m) {
      if (token.type === 'rest' || token.type === 'sustain') {
        rowItems.push({
          type: 'rest-or-sustain',
          label: makeLabel(token.type === 'rest' ? '0' : '—', 0)
        })
      } else if (token.type === 'note') {
        const fingering = getFingering(token.note, token.octave, mode.value)
        rowItems.push({
          type: 'note',
          label: makeLabel(token.note, token.octave),
          fingering: fingering,
          opacity: fingering ? '1' : '0.25'
        })
      }
    }
    rowItems.push({ type: 'barline' })
    currentRow.push(...rowItems)
    usedW += mW
  }
  if (currentRow.length > 0) rows.push(currentRow)
  scoreRows.value = rows
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
    if (token.type === 'barline') { domIdx++; continue }
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

function updateContainerWidth() {
  if (outputRef.value) {
    containerWidth.value = outputRef.value.clientWidth || 860
    render()
  }
}

onMounted(() => {
  updateContainerWidth()
  window.addEventListener('resize', updateContainerWidth)
})

// 初始化
render()
</script>

<template>
  <div class="ddp-container">
    <h1>哨笛洞谱生成器</h1>

    <div class="controls">
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
      <div class="syntax-help">
        <code>1-7</code> 音符 &nbsp; <code>_</code> 低八度 &nbsp; <code>^</code> 高八度 &nbsp; <code>0</code> 休止 &nbsp; <code>-</code> 延长 &nbsp; <code>|</code> 小节线 &nbsp; 空格分隔
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
    </div>

    <div class="output" ref="outputRef">
      <template v-if="scoreRows.length === 0">
        <p class="placeholder">请在上方输入简谱</p>
      </template>
      <template v-else>
        <div v-for="(row, rowIndex) in scoreRows" :key="rowIndex" class="score-row">
          <template v-for="(item, itemIndex) in row" :key="itemIndex">
            <!-- 小节线 -->
            <div v-if="item.type === 'barline'" class="barline"></div>
            <!-- 音符 -->
            <div v-else class="note-group">
              <div class="note-label">
                <div class="dot-above">{{ item.label.dotAbove }}</div>
                <div class="note-num">{{ item.label.noteNum }}</div>
                <div class="dot-below">{{ item.label.dotBelow }}</div>
              </div>
              <div v-if="item.type === 'rest-or-sustain'" class="spacer-body"></div>
              <div
                v-else
                class="whistle-body"
                :style="{ opacity: item.opacity }"
              >
                <div
                  v-for="i in 6"
                  :key="i"
                  class="hole"
                  :class="{ closed: item.fingering && item.fingering[i - 1] }"
                ></div>
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="less">
.ddp-container {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px;
  box-sizing: border-box;
  overflow: auto;

  h1 {
    text-align: center;
    font-size: 24px;
    margin-bottom: 16px;
    color: #fff;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .subtitle {
    text-align: center;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    margin-top: -12px;
    margin-bottom: 16px;

    a {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .controls {
    max-width: 900px;
    margin: 0 auto 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.95);
    padding: 16px;
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
  }

  .control-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 10px;
    flex-wrap: wrap;

    > label {
      font-size: 14px;
      color: #555;
    }
  }

  .radio-group {
    display: flex;
    gap: 10px;

    label {
      cursor: pointer;
      padding: 4px 14px;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      font-size: 14px;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      color: #606266;
      background: #fff;

      &.active {
        border-color: #409eff;
        background: #409eff;
        color: #fff;
      }

      &:hover:not(.active) {
        border-color: #409eff;
        color: #409eff;
      }
    }

    input[type="radio"] {
      display: none;
    }
  }

  textarea {
    width: 100%;
    height: 80px;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    font-size: 16px;
    font-family: "Consolas", "Courier New", monospace;
    padding: 10px;
    resize: vertical;
    background: #f9fafb;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #409eff;
      background: #fff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
    }
  }

  .syntax-help {
    font-size: 12px;
    color: #909399;
    margin-top: 6px;

    code {
      background: #f0f0f0;
      padding: 1px 4px;
      border-radius: 2px;
      color: #333;
    }
  }

  .play-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .play-btn {
    padding: 5px 18px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background: #fff;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s;
    color: #606266;

    &:hover {
      color: #409eff;
      border-color: #409eff;
    }

    &.active {
      background: #409eff;
      border-color: #409eff;
      color: #fff;
    }
  }

  .bpm-input {
    width: 60px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 4px 6px;
    font-size: 14px;
    text-align: center;
    background: #fff;

    &:focus {
      outline: none;
      border-color: #409eff;
    }
  }

  .output {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px 10px;
    background: rgba(255, 255, 255, 0.95);
  }

  .placeholder {
    color: #909399;
    text-align: center;
    padding: 40px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .score-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    border-radius: 12px;
    padding: 16px;
  }

  .note-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 2px 12px;
  }

  .note-label {
    margin-bottom: 3px;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 30px;
    justify-content: center;

    .dot-above,
    .dot-below {
      font-size: 8px;
      line-height: 1;
      height: 8px;
      color: #303133;
    }

    .note-num {
      font-size: 16px;
      font-weight: bold;
      line-height: 1.1;
      color: #303133;
    }
  }

  .whistle-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 5px 4px;
    border: 1.5px solid #303133;
    border-radius: 10px;
    width: 22px;
    background: #fff;
  }

  .hole {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1.5px solid #303133;

    &.closed {
      background: #303133;
    }
  }

  .barline {
    width: 1.5px;
    background: #303133;
    margin: 0 6px;
    align-self: stretch;
  }

  .spacer-body {
    width: 22px;
    height: 99px;
  }

  @media (max-width: 500px) {
    .whistle-body {
      width: 18px;
    }

    .hole {
      width: 10px;
      height: 10px;
    }

    .note-label .note-num {
      font-size: 14px;
    }
  }
}
</style>
