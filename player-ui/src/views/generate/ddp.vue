<script setup>
import { reactive, ref } from 'vue'
import { Download, Loading } from '@element-plus/icons-vue'
import html2canvas from 'html2canvas'
import { ElMessage } from 'element-plus'

// 输入文本
const inputText = ref('2 3 _2 _6 2 - | 0 2 3 2 3 5 3 | 2 3 _2 _6 1 - | 0 ^1 7 5 3 |\n2 3 _2 _6 2 - | 0 2 3 2 3 5 3 | 2 3 2 1 _6 - | _6 - 0 0 |')
// UI 状态
const isRendering = ref(false)
// 笛子模式，筒音5或1
const mode = ref('5')
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

// 获取指法
function getFingering(note, octave, mode) {
  if (mode === '5') {
    // 指法映射 - 筒音5
    if (octave === -1) {
      const map = { 5: 0, 6: 1, 7: 2, 1: 3, 2: 4, 3: 5, 4: 6 }
      if (map[note] !== undefined) return POSITIONS[map[note]]
      return null
    }
    const map = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 7, 6: 1, 7: 2 }
    if (map[note] !== undefined) return POSITIONS[map[note]]
    return null
  } else if (mode === '1') {
    // 指法映射 - 筒音1
    if (octave === -1) return null
    const map = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6 }
    if (map[note] !== undefined) return POSITIONS[map[note]]
    return null
  }
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

// 渲染数据
const scoreData = []

// 转换
async function convert() {
  const content = inputText.value.trim()
  if (!content) return
  isRendering.value = true

  const tokens = parseInput(inputText.value)
  for (const token of tokens) {
    if (token.type === 'barline') {
      scoreData.push({ type: 'barline' })
      continue
    }
    if (token.type === 'rest' || token.type === 'sustain') {
      scoreData.push({
        type: 'rest-or-sustain',
        label: { dotAbove: false, noteNum: token.type === 'rest' ? '0' : '—', dotBelow: false },
        opacity: '0'
      })
    } else if (token.type === 'note') {
      const fingering = getFingering(token.note, token.octave, mode.value)
      scoreData.push({
        type: 'note',
        label: { dotAbove: token.octave === 1, noteNum: token.note, dotBelow: token.octave === -1 },
        fingering: fingering,
        opacity: fingering ? '1' : '0.25'
      })
    }
  }

  isRendering.value = false
}

/**
 * Web Audio API 的音频上下文，管理所有音频节点
 * @type {AudioContext | null}
 */
let ctx = null
// 每分钟节拍数，默认为90
const bpm = ref(90)
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

/*const SYNTH_CONFIG = {
  // 主音（锯齿波）包络： [起始, 攻击峰值, 衰减, 持续, 释放]
  envelope1: { peak: 0.95, attack: 0.04, decayStart: 0.3, sustain: 0.85, release: 0.85, end: 0.02 },
  // 二次谐波（正弦）包络
  envelope2: { peak: 0.35, attack: 0.06, decayStart: 0.1, sustain: 0.3, release: 0.5, end: 0.02 },
  // 三次谐波（正弦）包络
  envelope3: { peak: 0.12, attack: 0.08, decayStart: 0.2, sustain: 0.08, release: 0.4, end: 0.02 },
  // 噪声包络
  noiseEnv: { peak: 0.15, attack: 0.05, decayStart: 0.1, sustain: 0.03, release: 0.3, end: 0.0 },
  // 滤波器：低通 Q值
  filterQ: 0.8,
  filterFreqMultiplier: 6,
  // 主音量上限（防止爆音）
  masterVolume: 0.8
}

// ======================== 噪声缓存 ========================
let cachedNoiseBuffer = null

function getNoiseBuffer(ctx) {
  if (!cachedNoiseBuffer) {
    const sampleRate = ctx.sampleRate
    const size = Math.floor(sampleRate * 0.1) // 缓存100ms足矣
    cachedNoiseBuffer = ctx.createBuffer(1, size, sampleRate)
    const data = cachedNoiseBuffer.getChannelData(0)
    for (let i = 0; i < size; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3
    }
  }
  return cachedNoiseBuffer
}

function playTone(freq, duration, startTime, volume = 0.6) {
  //if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  const vol = Math.min(volume, 1) * SYNTH_CONFIG.masterVolume
  // const { sampleRate } = ctx

  // --- 1. 创建振荡器 ---
  const osc1 = ctx.createOscillator()
  osc1.type = 'sawtooth'
  osc1.frequency.value = freq

  const osc2 = ctx.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.value = freq * 2

  const osc3 = ctx.createOscillator()
  osc3.type = 'sine'
  osc3.frequency.value = freq * 3

  // --- 2. 噪声（使用缓存） ---
  const noise = ctx.createBufferSource()
  noise.buffer = getNoiseBuffer(ctx)
  noise.loop = true

  // --- 3. 增益节点 ---
  const gain1 = ctx.createGain()
  const gain2 = ctx.createGain()
  const gain3 = ctx.createGain()
  const gainNoise = ctx.createGain()
  const mixGain = ctx.createGain()
  mixGain.gain.value = 1

  // --- 4. 包络辅助函数（复用逻辑） ---
  function applyEnvelope(gainNode, config, volScale) {
    const base = vol * volScale
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(base * config.peak, startTime + config.attack)
    gainNode.gain.linearRampToValueAtTime(base * config.sustain, startTime + config.decayStart)
    gainNode.gain.setValueAtTime(base * config.sustain, startTime + duration * 0.4) // 保持
    gainNode.gain.linearRampToValueAtTime(base * 0.3, startTime + duration * config.release)
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration + config.end)
  }

  applyEnvelope(gain1, SYNTH_CONFIG.envelope1, 1.0)
  applyEnvelope(gain2, SYNTH_CONFIG.envelope2, 1.0)
  applyEnvelope(gain3, SYNTH_CONFIG.envelope3, 1.0)
  applyEnvelope(gainNoise, SYNTH_CONFIG.noiseEnv, 1.0)

  // --- 5. 滤波器 ---
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = freq * SYNTH_CONFIG.filterFreqMultiplier
  filter.Q.value = SYNTH_CONFIG.filterQ

  // --- 6. 连线 ---
  osc1.connect(gain1)
  osc2.connect(gain2)
  osc3.connect(gain3)
  noise.connect(gainNoise)

  gain1.connect(mixGain)
  gain2.connect(mixGain)
  gain3.connect(mixGain)
  gainNoise.connect(mixGain)

  mixGain.connect(filter)
  filter.connect(ctx.destination)

  // --- 7. 按绝对时间启动/停止 ---
  osc1.start(startTime)
  osc1.stop(startTime + duration + 0.05)
  osc2.start(startTime)
  osc2.stop(startTime + duration + 0.05)
  osc3.start(startTime)
  osc3.stop(startTime + duration + 0.05)
  noise.start(startTime)
  noise.stop(startTime + duration + 0.05)

  // --- 8. 内存泄漏防护：记录活跃声音，并自动清理 ---
  const voice = { gainNode: mixGain, nodes: [osc1, osc2, osc3, noise, gain1, gain2, gain3, gainNoise, mixGain, filter] }

  // 播放结束后（稍晚一点）从活跃列表移除并断开连接
  const cleanupTime = (startTime + duration + 0.1) - ctx.currentTime
  setTimeout(() => {
    voice.nodes.forEach(n => n.disconnect())
  }, Math.max(0, cleanupTime * 1000))
}*/

/**
 * 音色合成引擎
 * @param freq 基频频率（单位：Hz），例如中央C为 261.63
 * @param duration 音符持续时长（单位：秒）
 * @param startTime
 * @param volume 总音量系数（范围 0.0 ~ 1.0），用于统一控制响度
 */
function playTone(freq, duration, startTime, volume = 0.6) {
  // if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  // 1.获取当前音频上下文的精确播放时间轴（单位：秒） 所有调度都基于这个绝对时间，确保多音源在毫秒级同步
  const t = ctx.currentTime

  // ============== 2.创建音源（声带振动部分）==============

  // 主音振荡器：锯齿波（Sawtooth） 锯齿波包含丰富的奇次和偶次谐波，音色明亮带"刺"，作为铜管音色的筋骨
  const osc1 = ctx.createOscillator()
  osc1.type = 'sawtooth'
  osc1.frequency.value = freq
  // 第一泛音振荡器：纯正弦波（Sine） 频率为基频的 2 倍（高八度），提供纯净的厚度感
  const osc2 = ctx.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.value = freq * 2
  // 第二泛音振荡器：纯正弦波（Sine） 频率为基频的 3 倍（高十二度），增加音色的华丽感和金属光泽
  const osc3 = ctx.createOscillator()
  osc3.type = 'sine'
  osc3.frequency.value = freq * 3

  // ============== 3.生成噪音音源（模拟吹奏时的气流摩擦感）==============
  // 计算缓冲区大小：20毫秒的采样点数  例如 48000Hz 采样率下，bufferSize = 48000 * 0.02 = 960 个采样点
  // sampleRate 当前音频上下文的采样率，单位是 Hz（赫兹），值与硬件和浏览器实现有关
  const bufferSize = ctx.sampleRate * 0.02
  // 创建单声道音频数据容器（AudioBuffer） 参数：声道数(1) , 采样帧数 , 采样率(Hz)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  // 获取该缓冲区的可写数据数组（Float32Array）
  const data = buffer.getChannelData(0)
  // 循环写入白噪音数据（范围 -0.3 ~ 0.3）
  for (let i = 0; i < bufferSize; i++) {
    // 乘以 0.3 限制噪音振幅，防止它盖过主音（仅作为"音头沙沙声"存在）
    data[i] = (Math.random() * 2 - 1) * 0.3
  }
  // 创建缓冲源节点，用于播放这段白噪音
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  // 开启循环播放，因为噪音需要持续发声直到被 stop() 切断
  noise.loop = true

  // ============== 4.创建音量控制节点（增益节点 Gain） 每个音源配一个独立的 Gain，用来绘制各自的"音量包络曲线（Envelope）===========
  const gain1 = ctx.createGain()      // 控制主音（锯齿波）
  const gain2 = ctx.createGain()      // 控制第一泛
  const gain3 = ctx.createGain()      // 控制第二泛音
  const gainNoise = ctx.createGain()  // 控制噪音

  // ============= 5. 绘制音量包络曲线（核心音色设计） 注意：此处仅在"调度时间轴"，并未真正发出声音 =============
  // 主音（锯齿波）包络 设计思路：极短爆发（模拟吹响瞬间）-> 中途微微起伏 -> 尾音缓缓消失
  gain1.gain.setValueAtTime(0, t) // t时刻：音量置为0（静音起点）
  gain1.gain.linearRampToValueAtTime(volume * 0.15, t + 0.01) // 0~10ms：猛冲到 15%（极速起音，制造冲击感）
  gain1.gain.linearRampToValueAtTime(volume * 0.9, t + 0.04)  // 10~40ms：冲到 90%（主体音量爆发）
  gain1.gain.setValueAtTime(volume * 0.95, t + 0.06)          // 60ms处：瞬时跳变到95%（制造极短暂的音头峰值尖刺）
  gain1.gain.linearRampToValueAtTime(volume * 0.7, t + duration * 0.3)  // 60ms ~ 30%处：衰减到 70%（进入维持段）
  gain1.gain.linearRampToValueAtTime(volume * 0.85, t + duration * 0.6) // 30%~60%处：回升到 85%（制造音色的"荡漾感"）
  gain1.gain.linearRampToValueAtTime(volume * 0.5, t + duration * 0.85) // 60%~85%处：降到 50%（准备收尾）
  gain1.gain.linearRampToValueAtTime(0, t + duration + 0.02)    // 85%~结束+20ms：线性归零（平滑消失，防止咔哒爆音）
  // 第一泛音（2倍频）包络 设计思路：启动更慢，音量更小，仅在中高频段短暂点缀
  gain2.gain.setValueAtTime(0, t)
  gain2.gain.linearRampToValueAtTime(volume * 0.05, t + 0.02) // 0~20ms：缓慢起音到 5%
  gain2.gain.linearRampToValueAtTime(volume * 0.3, t + 0.06)  // 20~60ms：升至 30%（达到峰值）
  gain2.gain.linearRampToValueAtTime(volume * 0.35, t + 0.1)  // 60~100ms：微升至 35%（稍作保持）
  gain2.gain.linearRampToValueAtTime(volume * 0.2, t + duration * 0.5)  // 100ms ~ 50%处：降至 20%
  gain2.gain.linearRampToValueAtTime(0, t + duration + 0.02)   // 50%~结束+20ms：缓缓归零（提前淡出，比主音消失得早）
  // 二泛音（3倍频）包络 设计思路：启动更慢，音量更小，仅在中高频段短暂点缀
  gain3.gain.setValueAtTime(0, t)
  gain3.gain.linearRampToValueAtTime(volume * 0.02, t + 0.03) // 0~30ms：极弱起音
  gain3.gain.linearRampToValueAtTime(volume * 0.12, t + 0.08) // 30~80ms：达到 12% 峰值
  gain3.gain.linearRampToValueAtTime(volume * 0.08, t + duration * 0.4) // 80ms~40%处：衰减到 8%
  gain3.gain.linearRampToValueAtTime(0, t + duration + 0.02)  // 40%~结束+20ms：提前归零
  // 噪音（气流）包络 设计思路：只在"音头"极短时间内出现，模拟吹气声，随后迅速消失，不参与尾音
  gainNoise.gain.setValueAtTime(0, t)
  gainNoise.gain.linearRampToValueAtTime(volume * 0.08, t + 0.02) // 0~20ms：冲到 8%
  gainNoise.gain.linearRampToValueAtTime(volume * 0.15, t + 0.05) // 20~50ms：升至 15%（气流峰值）
  gainNoise.gain.linearRampToValueAtTime(volume * 0.03, t + duration * 0.3) // 50ms~ 0%处：急剧衰减到 3%
  gainNoise.gain.linearRampToValueAtTime(0, t + duration * 0.5) // 30%~50%处：彻底归零（之后完全静音）

  // =============== 6.创建效果器：低通滤波器（Lowpass Filter） 用来削除高频刺耳的毛刺，让声音变"暖" =================
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  // 截止频率设为基频的 6 倍（例如 440Hz 时，截止约 2640Hz） 允许前几个重要泛音通过，切掉更高频的电子杂音
  filter.frequency.value = freq * 6
  filter.Q.value = 0.8  // Q值（品质因数）设为0.8，产生较平滑的共振峰，使音色更圆润

  // =============== 7.音频信号路由（连线） 信号流向：音源 -> 各自增益 -> 混合总线 -> 滤波器 -> 音响 ==============
  // 将四个音源分别连接到各自的音量控制器（并联通道）
  osc1.connect(gain1)
  osc2.connect(gain2)
  osc3.connect(gain3)
  noise.connect(gainNoise)
  // 创建混合总线（Mix Bus），用来汇总四个通道的信号
  const mixGain = ctx.createGain()
  mixGain.gain.value = 1  // 混合总线不额外增减音量，保持 1:1 混合
  // 将四个增益输出全部接入混合总线（此时信号叠加）
  gain1.connect(mixGain)
  gain2.connect(mixGain)
  gain3.connect(mixGain)
  gainNoise.connect(mixGain)
  // 混合总线 -> 滤波器（统一润色） -> 扬声器输出
  mixGain.connect(filter)
  filter.connect(ctx.destination)

  // ================= 8.精准启动与停止（时间线执行） 之前所有的连线与包络调度都是"计划书"，此刻才开始真正执行 ============
  // 在同一个时刻 t 启动所有音源（高精度同步）
  osc1.start(t)
  osc2.start(t)
  osc3.start(t)
  noise.start(t)  // 因为设置了 loop=true，它会循环播放那段噪音缓冲区
  // 在 "t + duration + 0.05" 时刻统一停止
  // 多出的 0.05 秒是为了让上面的音量包络有足够时间线性滑落到0，避免波形在非零振幅时被强行截断，从而产生"咔哒"爆音
  osc1.stop(t + duration + 0.05)
  osc2.stop(t + duration + 0.05)
  osc3.stop(t + duration + 0.05)
  noise.stop(t + duration + 0.05)

  // 播放结束后自动清理
  // 以 osc1 作为“监听哨兵”，当它停止时执行清理
  osc1.onended = () => {
    gain1.disconnect()
    gain2.disconnect()
    gain3.disconnect()
    gainNoise.disconnect()
    mixGain.disconnect()
    filter.disconnect()
    osc1.onended = null
  }
}

// 播放状态
const playState = reactive({
  playing: false,
  timer: 0,   // 用于 setTimeout 句柄
  index: 0
  // nextTime: 0    // 记录下一次调度的绝对时间
})

// 播放控制
function stopPlay() {
  playState.playing = false
  if (playState.timer) {
    clearTimeout(playState.timer)
    playState.timer = null
  }
}

/**
 * 切换播放状态（播放/暂停）
 * 解析输入文本，处理延音符号，并按BPM节奏播放音符
 */
async function togglePlay() {
  // 创建音频上下文（如果尚未创建）
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()

  // 如果正在播放，则停止播放
  if (playState.playing) {
    stopPlay()
    return
  }
  // 确保音频上下文激活
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }

  // 解析输入文本为token列表
  const tokens = parseInput(inputText.value)
  // 筛选出可播放的音符，并记录对应的DOM索引
  const playable = []
  let domIdx = 0
  for (const token of tokens) {
    // 跳过小节线，但需要增加DOM索引
    if (token.type === 'barline') {
      domIdx++
      continue
    }
    playable.push({ token, domIdx })
    domIdx++
  }

  // 如果没有可播放的内容，直接返回
  if (playable.length === 0) return

  // 将可播放列表转换为播放事件，处理延音符号
  // 延音符号会延长前一个音符的时值
  const events = []
  for (let i = 0; i < playable.length; i++) {
    const { token, domIdx } = playable[i]
    // 如果是延音符号且有前一个事件，则延长前一个音符的拍数
    if (token.type === 'sustain' && events.length > 0) {
      events[events.length - 1].beats++
      events[events.length - 1].domIndices.push(domIdx)
    } else {
      // 创建新的播放事件
      events.push({ token, beats: 1, domIndices: [domIdx] })
    }
  }

  // 设置播放状态
  playState.playing = true
  playState.index = 0

  /**
   * 播放下一步
   * 递归调用，按BPM节奏逐个播放音符
   */
  function step() {
    // 检查是否停止播放或播放结束
    if (!playState.playing || playState.index >= events.length) {
      stopPlay()
      return
    }

    // 获取当前播放事件
    const ev = events[playState.index]
    // 计算音符持续时间（秒）= 拍数 * (60 / BPM)
    const dur = ev.beats * (60 / bpm.value)

    // 如果是音符类型，播放声音
    if (ev.token.type === 'note') {
      const freq = getFreq(ev.token.note, ev.token.octave, mode.value)
      if (freq) playTone(freq, dur * 0.9)
      else console.warn(`未知音符: ${ev.token.octave}_${ev.token.note}`)
    }

    // 移动到下一个事件
    playState.index++

    // 设置定时器，根据BPM计算延迟时间（该方案 setTimeout 误差可达 10-50ms，累积后节奏会明显偏移）
    playState.timer = setTimeout(step, ev.beats * (60000 / bpm.value))
    // 计算相对延迟，设置定时器触发下一次调度
    /*const now = ctx.currentTime
    const delayMs = Math.max(0, (playState.nextTime - now) * 1000)
    playState.timer = setTimeout(step, delayMs)*/
  }

  // 开始播放
  step()
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

        <!-- 音频播放区 -->
        <div class="control-row play-row">
          <button class="play-btn" @click="togglePlay">
            <span class="play-icon">▶</span> 播放
          </button>
          <button class="play-btn stop-btn" @click="stopPlay">
            <span class="stop-icon">■</span> 停止
          </button>
          <div class="bpm-wrapper">
            <label for="bpm">BPM:</label>
            <el-input v-model="bpm" type="number" min="30" max="300" :input-style="{ textAlign: 'center' }"
                      @input="(val) => bpm = val > 300 ? 300 : (val < 30 ? 30 : val)"/>
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

      .hole.closed {
        background: #222;
      }
    }
  }
}

/* 控制行样式 */
.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;

  &.play-row {
    margin-top: 12px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
  }

  button.play-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
      background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
    }

    &.stop-btn {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      box-shadow: 0 2px 4px rgba(245, 87, 108, 0.3);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(245, 87, 108, 0.4);
        background: linear-gradient(135deg, #e083eb 0%, #e9475c 100%);
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(245, 87, 108, 0.3);
      }
    }

    .play-icon, .stop-icon {
      font-size: 12px;
      font-weight: bold;
    }
  }

  .bpm-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;

    label {
      font-size: 14px;
      font-weight: 500;
      color: #606266;
      white-space: nowrap;
    }
  }
}
</style>
