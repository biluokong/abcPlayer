<script setup>
import { computed, reactive, ref } from 'vue'
import { Download, Loading } from '@element-plus/icons-vue'
import html2canvas from 'html2canvas'
import { ElMessage } from 'element-plus'
import { convertDdpApi } from '@/api/convert.js'

// 输入文本
// const inputText = ref('2 3 _2 _6 2 - | 0 2 3 2 3 5 3 | 2 3 _2 _6 1 - | 0 ^1 7 5 3 |\n2 3 _2 _6 2 - | 0 2 3 2 3 5 3 | 2 3 2 1 _6 - | _6 - 0 0 |')
const inputText = ref(`0 0 0 6/ 7/ | 1'. 7/ 1' 3' | 7 - - 3 |
6. 5/ 6 1' | 5 - - 3 | 4. 3/ 4/ 1'. |
3 - - 1' | 7. 4^/ 4^ 7 | 7 - - 6/ 7/ |
1'. 7/ 1' 3' | 7 - - 3 | 6. 5/ 6 1' |
5 - - 3 | 4 1'/ 7. 1' | 2' 3'/ 1'/ - - |
1'/ 7/ 6 7 5^ | 6 - - 0 |`)
// UI 状态
const isRendering = ref(false)
// 笛子模式，筒音5或1
const mode = ref('5')
// 笛子调性
const tune = ref('D')
// 是否隐藏笛子部分
const hideWhistle = ref(false)
const whistleDisplay = computed(() => {
  return hideWhistle.value ? 'none' : 'flex'
})

// 转换结果
const result = reactive({
  renderStr: '',
  events: []
})

// 转换
async function convert() {
  const content = inputText.value
  if (!content) return

  stopPlay()
  isRendering.value = true

  const { data } = await convertDdpApi(inputText.value, mode.value, tune.value)
  result.renderStr = data.renderStr
  result.events = data.events

  // 绑定点击事件，实现点击音符高亮和跳转播放功能
  playState.renderBox = document.getElementById('render-container')
  playState.renderBox.addEventListener('click', async event => {
    // 找到最近的带 note-idx- 类的祖先元素
    const target = event.target.closest('[class*="note-idx-"]')
    if (!target) return
    const hasValid = [...target.classList].some(cls => /^note-idx-[1-9]\d*$/.test(cls))
    if (hasValid) {
      const pre = playState.renderBox.querySelector('.highlight')
      if (pre) pre.classList.remove('highlight')
      // 点击后就高亮
      target.classList.add('highlight')
      // 如果当前非停止播放状态，则跳到点击的位置继续播放
      if (playState.status !== PLAY_STATE.STOPPED) {
        if (playState.stop) playState.stop()
        playState.index = Number(target.classList[1].split('-')[2]) - 1
      }
    }
  })

  isRendering.value = false
}

/**
 * Web Audio API 的音频上下文，管理所有音频节点
 * @type {AudioContext | null}
 */
let ctx = null
// 每分钟节拍数，默认为90
const bpm = ref(90)
// 播放时是否需要自动滚动
const autoScroll = ref(false)
// 哨笛频率映射
/*const NOTE_FREQ = {
  A: {
    1: {  // 筒音作 1（A 大调）
      // 第一个八度
      '1_0': 440.00,
      '#1_0,b2_0': 466.16,
      '2_0': 493.88,
      '#2_0,b3_0': 523.25,
      '3_0,b4_0': 554.37,
      '4_0,#3_0': 587.33,
      '#4_0,b5_0': 622.25,
      '5_0': 659.25,
      '#5_0,b6_0': 698.46,
      '6_0': 739.99,
      '#6_0,b7_0': 783.99,
      '7_0,b1_1': 830.61,

      // 第二个八度
      '1_1,#7_0': 880.00,
      '#1_1,b2_1': 932.33,
      '2_1': 987.77,
      '#2_1,b3_1': 1046.50,
      '3_1,b4_1': 1108.73,
      '4_1,#3_1': 1174.66,
      '#4_1,b5_1': 1244.51,
      '5_1': 1318.51,
      '#5_1,b6_1': 1396.91,
      '6_1': 1479.98,
      '#6_1,b7_1': 1567.98,
      '7_1,b1_2': 1661.22,

      // 第三个八度
      '1_2,#7_1': 1760.00,
      '#1_2,b2_2': null,
      '2_2': 1975.53,
      '#2_2,b3_2': null,
      '3_2,b4_2': 2217.46,
      '4_2,#3_2': 2349.32
    },
    2: {  // 筒音作 2（1 = G，即 G 大调）
      // 第一个八度
      '2_0': 440.00,
      '#2_0,b3_0': 466.16,
      '3_0,b4_0': 493.88,
      '4_0,#3_0': 523.25,
      '#4_0,b5_0': 554.37,
      '5_0': 587.33,
      '#5_0,b6_0': 622.25,
      '6_0': 659.25,
      '#6_0,b7_0': 698.46,
      '7_0,b1_1': 739.99,

      // 第二个八度
      '1_1,#7_0': 783.99,
      '#1_1,b2_1': 830.61,
      '2_1': 880.00,
      '#2_1,b3_1': 932.33,
      '3_1,b4_1': 987.77,
      '4_1,#3_1': 1046.50,
      '#4_1,b5_1': 1108.73,
      '5_1': 1174.66,
      '#5_1,b6_1': 1244.51,
      '6_1': 1318.51,
      '#6_1,b7_1': 1396.91,
      '7_1,b1_2': 1479.98,

      // 第三个八度
      '1_2,#7_1': 1567.98,
      '#1_2,b2_2': 1661.22,
      '2_2': 1760.00,
      '#2_2,b3_2': null,
      '3_2,b4_2': 1975.53,
      '4_2,#3_2': null,
      '#4_2,b5_2': 2093.00,
      '5_2': 2349.32
    },
    5: {  // 筒音作 5（1 = D，即 D 大调）
      // 第一个八度（低于主音 1 的音区）
      '5_-1': 440.00,
      '#5_-1,b6_-1': 466.16,
      '6_-1': 493.88,
      '#6_-1,b7_-1': 523.25,
      '7_-1,b1_0': 554.37,

      // 第二个八度（从这里开始是 1 = D）
      '1_0,#7_-1': 587.33,
      '#1_0,b2_0': 622.25,
      '2_0': 659.25,
      '#2_0,b3_0': 698.46,
      '3_0,b4_0': 739.99,
      '4_0,#3_0': 783.99,
      '#4_0,b5_0': 830.61,
      '5_0': 880.00,
      '#5_0,b6_0': 932.33,
      '6_0': 987.77,
      '#6_0,b7_0': 1046.50,
      '7_0,b1_1': 1108.73,

      // 第三个八度
      '1_1,#7_0': 1174.66,
      '#1_1,b2_1': 1244.51,
      '2_1': 1318.51,
      '#2_1,b3_1': 1396.91,
      '3_1,b4_1': 1479.98,
      '4_1,#3_1': 1567.98,
      '#4_1,b5_1': 1661.22,
      '5_1': 1760.00,
      '#5_1,b6_1': null,
      '6_1': 1975.53,
      '#6_1,b7_1': null,
      '7_1,b1_2': 2217.46,

      // 第四个八度
      '1_2,#7_1': 2349.32
    }
  },
  Bb: {
    1: {  // 筒音作 1（Bb 大调）
      // 第一个八度
      '1_0': 466.16,
      '#1_0,b2_0': 493.88,
      '2_0': 523.25,
      '#2_0,b3_0': 554.37,
      '3_0,b4_0': 587.33,
      '4_0,#3_0': 622.25,
      '#4_0,b5_0': 659.25,
      '5_0': 698.46,
      '#5_0,b6_0': 739.99,
      '6_0': 783.99,
      '#6_0,b7_0': 830.61,
      '7_0,b1_1': 880.00,

      // 第二个八度
      '1_1,#7_0': 932.33,
      '#1_1,b2_1': 987.77,
      '2_1': 1046.50,
      '#2_1,b3_1': 1108.73,
      '3_1,b4_1': 1174.66,
      '4_1,#3_1': 1244.51,
      '#4_1,b5_1': 1318.51,
      '5_1': 1396.91,
      '#5_1,b6_1': 1479.98,
      '6_1': 1567.98,
      '#6_1,b7_1': 1661.22,
      '7_1,b1_2': 1760.00,

      // 第三个八度
      '1_2,#7_1': 1864.66,
      '#1_2,b2_2': null,
      '2_2': 2093.00,
      '#2_2,b3_2': null,
      '3_2,b4_2': 2349.32,
      '4_2,#3_2': 2489.02
    },
    2: {  // 筒音作 2（1 = Ab，即 Ab 大调）
      // 第一个八度
      '2_0': 466.16,
      '#2_0,b3_0': 493.88,
      '3_0,b4_0': 523.25,
      '4_0,#3_0': 554.37,
      '#4_0,b5_0': 587.33,
      '5_0': 622.25,
      '#5_0,b6_0': 659.25,
      '6_0': 698.46,
      '#6_0,b7_0': 739.99,
      '7_0,b1_1': 783.99,

      // 第二个八度
      '1_1,#7_0': 830.61,
      '#1_1,b2_1': 880.00,
      '2_1': 932.33,
      '#2_1,b3_1': 987.77,
      '3_1,b4_1': 1046.50,
      '4_1,#3_1': 1108.73,
      '#4_1,b5_1': 1174.66,
      '5_1': 1244.51,
      '#5_1,b6_1': 1318.51,
      '6_1': 1396.91,
      '#6_1,b7_1': 1479.98,
      '7_1,b1_2': 1567.98,

      // 第三个八度
      '1_2,#7_1': 1661.22,
      '#1_2,b2_2': 1760.00,
      '2_2': 1864.66,
      '#2_2,b3_2': null,
      '3_2,b4_2': 2093.00,
      '4_2,#3_2': null,
      '#4_2,b5_2': 2217.46,
      '5_2': 2349.32
    },
    5: {  // 筒音作 5（1 = Eb，即 Eb 大调）
      // 第一个八度（低于主音 1 的音区）
      '5_-1': 466.16,
      '#5_-1,b6_-1': 493.88,
      '6_-1': 523.25,
      '#6_-1,b7_-1': 554.37,
      '7_-1,b1_0': 587.33,

      // 第二个八度（从这里开始是 1 = Eb）
      '1_0,#7_-1': 622.25,
      '#1_0,b2_0': 659.25,
      '2_0': 698.46,
      '#2_0,b3_0': 739.99,
      '3_0,b4_0': 783.99,
      '4_0,#3_0': 830.61,
      '#4_0,b5_0': 880.00,
      '5_0': 932.33,
      '#5_0,b6_0': 987.77,
      '6_0': 1046.50,
      '#6_0,b7_0': 1108.73,
      '7_0,b1_1': 1174.66,

      // 第三个八度
      '1_1,#7_0': 1244.51,
      '#1_1,b2_1': 1318.51,
      '2_1': 1396.91,
      '#2_1,b3_1': 1479.98,
      '3_1,b4_1': 1567.98,
      '4_1,#3_1': 1661.22,
      '#4_1,b5_1': 1760.00,
      '5_1': 1864.66,
      '#5_1,b6_1': null,
      '6_1': 2093.00,
      '#6_1,b7_1': null,
      '7_1,b1_2': 2349.32,

      // 第四个八度
      '1_2,#7_1': 2489.02
    }
  },
  C: {
    1: {  // 筒音作 1（C 大调）
      // 第一个八度
      '1_0': 261.63,
      '#1_0,b2_0': 277.18,
      '2_0': 293.66,
      '#2_0,b3_0': 311.13,
      '3_0,b4_0': 329.63,
      '4_0,#3_0': 349.23,
      '#4_0,b5_0': 369.99,
      '5_0': 392.00,
      '#5_0,b6_0': 415.30,
      '6_0': 440.00,
      '#6_0,b7_0': 466.16,
      '7_0,b1_1': 493.88,

      // 第二个八度
      '1_1,#7_0': 523.25,
      '#1_1,b2_1': 554.37,
      '2_1': 587.33,
      '#2_1,b3_1': 622.25,
      '3_1,b4_1': 659.25,
      '4_1,#3_1': 698.46,
      '#4_1,b5_1': 739.99,
      '5_1': 783.99,
      '#5_1,b6_1': 830.61,
      '6_1': 880.00,
      '#6_1,b7_1': 932.33,
      '7_1,b1_2': 987.77,

      // 第三个八度
      '1_2,#7_1': 1046.50,
      '#1_2,b2_2': null,
      '2_2': 1174.66,
      '#2_2,b3_2': null,
      '3_2,b4_2': 1318.51,
      '4_2,#3_2': 1396.91
    },
    2: {  // 筒音作 2（1 = Bb，即 Bb 大调）
      // 第一个八度
      '2_0': 261.63,
      '#2_0,b3_0': 277.18,
      '3_0,b4_0': 293.66,
      '4_0,#3_0': 311.13,
      '#4_0,b5_0': 329.63,
      '5_0': 349.23,
      '#5_0,b6_0': 369.99,
      '6_0': 392.00,
      '#6_0,b7_0': 415.30,
      '7_0,b1_1': 440.00,

      // 第二个八度
      '1_1,#7_0': 466.16,
      '#1_1,b2_1': 493.88,
      '2_1': 523.25,
      '#2_1,b3_1': 554.37,
      '3_1,b4_1': 587.33,
      '4_1,#3_1': 622.25,
      '#4_1,b5_1': 659.25,
      '5_1': 698.46,
      '#5_1,b6_1': 739.99,
      '6_1': 783.99,
      '#6_1,b7_1': 830.61,
      '7_1,b1_2': 880.00,

      // 第三个八度
      '1_2,#7_1': 932.33,
      '#1_2,b2_2': 987.77,
      '2_2': 1046.50,
      '#2_2,b3_2': null,
      '3_2,b4_2': 1174.66,
      '4_2,#3_2': null,
      '#4_2,b5_2': 1244.51,
      '5_2': 1396.91
    },
    5: {  // 筒音作 5（1 = F，即 F 大调）
      // 第一个八度（低于主音 1 的音区）
      '5_-1': 261.63,
      '#5_-1,b6_-1': 277.18,
      '6_-1': 293.66,
      '#6_-1,b7_-1': 311.13,
      '7_-1,b1_0': 329.63,

      // 第二个八度（从这里开始是 1 = F）
      '1_0,#7_-1': 349.23,
      '#1_0,b2_0': 369.99,
      '2_0': 392.00,
      '#2_0,b3_0': 415.30,
      '3_0,b4_0': 440.00,
      '4_0,#3_0': 466.16,
      '#4_0,b5_0': 493.88,
      '5_0': 523.25,
      '#5_0,b6_0': 554.37,
      '6_0': 587.33,
      '#6_0,b7_0': 622.25,
      '7_0,b1_1': 659.25,

      // 第三个八度
      '1_1,#7_0': 698.46,
      '#1_1,b2_1': 739.99,
      '2_1': 783.99,
      '#2_1,b3_1': 830.61,
      '3_1,b4_1': 880.00,
      '4_1,#3_1': 932.33,
      '#4_1,b5_1': 987.77,
      '5_1': 1046.50,
      '#5_1,b6_1': null,
      '6_1': 1174.66,
      '#6_1,b7_1': null,
      '7_1,b1_2': 1318.51,

      // 第四个八度
      '1_2,#7_1': 1396.91
    }
  },
  D: {
    1: {  // 筒音作 1（D大调）
      // 第一个八度
      '1_0': 293.66,
      '#1_0,b2_0': 311.13,
      '2_0': 329.63,
      '#2_0,b3_0': 349.23,
      '3_0,b4_0': 369.99,
      '4_0,#3_0': 392.00,
      '#4_0,b5_0': 415.30,
      '5_0': 440.00,
      '#5_0,b6_0': 466.16,
      '6_0': 493.88,
      '#6_0,b7_0': 523.25,
      '7_0,b1_1': 554.37,

      // 第二个八度
      '1_1,#7_0': 587.33,
      '#1_1,b2_1': 622.25,
      '2_1': 659.25,
      '#2_1,b3_1': 698.46,
      '3_1,b4_1': 739.99,
      '4_1,#3_1': 783.99,
      '#4_1,b5_1': 830.61,
      '5_1': 880.00,
      '#5_1,b6_1': 932.33,
      '6_1': 987.77,
      '#6_1,b7_1': 1046.50,
      '7_1,b1_2': 1108.73,

      // 第三个八度
      '1_2,#7_1': 1174.66,
      '#1_2,b2_2': null,
      '2_2': 1318.51,
      '#2_2,b3_2': null,
      '3_2,b4_2': 1479.98,
      '4_2,#3_2': 1567.98
    },
    2: {  // 筒音作 2（C大调）
      // 第一个八度
      '2_0': 293.66,
      '#2_0,b3_0': 311.13,
      '3_0,b4_0': 329.63,
      '4_0,#3_0': 349.23,
      '#4_0,b5_0': 369.99,
      '5_0': 392.00,
      '#5_0,b6_0': 415.30,
      '6_0': 440.00,
      '#6_0,b7_0': 466.16,
      '7_0,b1_1': 493.88,

      // 第二个八度
      '1_1,#7_0': 523.25,
      '#1_1,b2_1': 554.37,
      '2_1': 587.33,
      '#2_1,b3_1': 622.25,
      '3_1,b4_1': 659.25,
      '4_1,#3_1': 698.46,
      '#4_1,b5_1': 739.99,
      '5_1': 783.99,
      '#5_1,b6_1': 830.61,
      '6_1': 880.00,
      '#6_1,b7_1': 932.33,
      '7_1,b1_2': 987.77,

      // 第三个八度
      '1_2,#7_1': 1046.50,
      '#1_2,b2_2': 1108.73,
      '2_2': 1174.66,
      '#2_2,b3_2': null,
      '3_2,b4_2': 1318.51,
      '4_2,#3_2': null,
      '#4_2,b5_2': 1396.91,
      '5_2': 1567.98
    },
    5: {  // 筒音作 5（G大调）
      // 第一个八度
      '5_-1': 293.66,
      '#5_-1,b6_-1': 311.13,
      '6_-1': 329.63,
      '#6_-1,b7_-1': 349.23,
      '7_-1,b1_0': 369.99,

      // 第二个八度
      '1_0,#7_-1': 392.00,
      '#1_0,b2_0': 415.30,
      '2_0': 440.00,
      '#2_0,b3_0': 466.16,
      '3_0,b4_0': 493.88,
      '4_0,#3_0': 523.25,
      '#4_0,b5_0': 554.37,
      '5_0': 587.33,
      '#5_0,b6_0': 622.25,
      '6_0': 659.25,
      '#6_0,b7_0': 698.46,
      '7_0,b1_1': 739.99,

      // 第三个八度
      '1_1,#7_0': 783.99,
      '#1_1,b2_1': 830.61,
      '2_1': 880.00,
      '#2_1,b3_1': 932.33,
      '3_1,b4_1': 987.77,
      '4_1,#3_1': 1046.50,
      '#4_1,b5_1': 1108.73,
      '5_1': 1174.66,
      '#5_1,b6_1': null,
      '6_1': 1318.51,
      '#6_1,b7_1': null,
      '7_1,b1_2': 1479.98,

      // 第四个八度
      '1_2,#7_1': 1567.98
    }
  },
  F: {
    1: {  // 筒音作 1（F 大调）
      // 第一个八度
      '1_0': 349.23,
      '#1_0,b2_0': 369.99,
      '2_0': 392.00,
      '#2_0,b3_0': 415.30,
      '3_0,b4_0': 440.00,
      '4_0,#3_0': 466.16,
      '#4_0,b5_0': 493.88,
      '5_0': 523.25,
      '#5_0,b6_0': 554.37,
      '6_0': 587.33,
      '#6_0,b7_0': 622.25,
      '7_0,b1_1': 659.25,

      // 第二个八度
      '1_1,#7_0': 698.46,
      '#1_1,b2_1': 739.99,
      '2_1': 783.99,
      '#2_1,b3_1': 830.61,
      '3_1,b4_1': 880.00,
      '4_1,#3_1': 932.33,
      '#4_1,b5_1': 987.77,
      '5_1': 1046.50,
      '#5_1,b6_1': 1108.73,
      '6_1': 1174.66,
      '#6_1,b7_1': 1244.51,
      '7_1,b1_2': 1318.51,

      // 第三个八度
      '1_2,#7_1': 1396.91,
      '#1_2,b2_2': null,
      '2_2': 1567.98,
      '#2_2,b3_2': null,
      '3_2,b4_2': 1760.00,
      '4_2,#3_2': 1864.66
    },
    2: {  // 筒音作 2（1 = Eb，即 Eb 大调）
      // 第一个八度
      '2_0': 349.23,
      '#2_0,b3_0': 369.99,
      '3_0,b4_0': 392.00,
      '4_0,#3_0': 415.30,
      '#4_0,b5_0': 440.00,
      '5_0': 466.16,
      '#5_0,b6_0': 493.88,
      '6_0': 523.25,
      '#6_0,b7_0': 554.37,
      '7_0,b1_1': 587.33,

      // 第二个八度
      '1_1,#7_0': 622.25,
      '#1_1,b2_1': 659.25,
      '2_1': 698.46,
      '#2_1,b3_1': 739.99,
      '3_1,b4_1': 783.99,
      '4_1,#3_1': 830.61,
      '#4_1,b5_1': 880.00,
      '5_1': 932.33,
      '#5_1,b6_1': 987.77,
      '6_1': 1046.50,
      '#6_1,b7_1': 1108.73,
      '7_1,b1_2': 1174.66,

      // 第三个八度
      '1_2,#7_1': 1244.51,
      '#1_2,b2_2': 1318.51,
      '2_2': 1396.91,
      '#2_2,b3_2': null,
      '3_2,b4_2': 1567.98,
      '4_2,#3_2': null,
      '#4_2,b5_2': 1661.22,
      '5_2': 1864.66
    },
    5: {  // 筒音作 5（1 = Bb，即 Bb 大调）
      // 第一个八度（低于主音 1 的音区）
      '5_-1': 349.23,
      '#5_-1,b6_-1': 369.99,
      '6_-1': 392.00,
      '#6_-1,b7_-1': 415.30,
      '7_-1,b1_0': 440.00,

      // 第二个八度（从这里开始是 1 = Bb）
      '1_0,#7_-1': 466.16,
      '#1_0,b2_0': 493.88,
      '2_0': 523.25,
      '#2_0,b3_0': 554.37,
      '3_0,b4_0': 587.33,
      '4_0,#3_0': 622.25,
      '#4_0,b5_0': 659.25,
      '5_0': 698.46,
      '#5_0,b6_0': 739.99,
      '6_0': 783.99,
      '#6_0,b7_0': 830.61,
      '7_0,b1_1': 880.00,

      // 第三个八度
      '1_1,#7_0': 932.33,
      '#1_1,b2_1': 987.77,
      '2_1': 1046.50,
      '#2_1,b3_1': 1108.73,
      '3_1,b4_1': 1174.66,
      '4_1,#3_1': 1244.51,
      '#4_1,b5_1': 1318.51,
      '5_1': 1396.91,
      '#5_1,b6_1': null,
      '6_1': 1567.98,
      '#6_1,b7_1': null,
      '7_1,b1_2': 1760.00,

      // 第四个八度
      '1_2,#7_1': 1864.66
    }
  },
  G: {
    1: {  // 筒音作 1（G 大调）
      // 第一个八度
      '1_0': 392.00,
      '#1_0,b2_0': 415.30,
      '2_0': 440.00,
      '#2_0,b3_0': 466.16,
      '3_0,b4_0': 493.88,
      '4_0,#3_0': 523.25,
      '#4_0,b5_0': 554.37,
      '5_0': 587.33,
      '#5_0,b6_0': 622.25,
      '6_0': 659.25,
      '#6_0,b7_0': 698.46,
      '7_0,b1_1': 739.99,

      // 第二个八度
      '1_1,#7_0': 783.99,
      '#1_1,b2_1': 830.61,
      '2_1': 880.00,
      '#2_1,b3_1': 932.33,
      '3_1,b4_1': 987.77,
      '4_1,#3_1': 1046.50,
      '#4_1,b5_1': 1108.73,
      '5_1': 1174.66,
      '#5_1,b6_1': 1244.51,
      '6_1': 1318.51,
      '#6_1,b7_1': 1396.91,
      '7_1,b1_2': 1479.98,

      // 第三个八度
      '1_2,#7_1': 1567.98,
      '#1_2,b2_2': null,
      '2_2': 1760.00,
      '#2_2,b3_2': null,
      '3_2,b4_2': 1975.53,
      '4_2,#3_2': 2093.00
    },
    2: {  // 筒音作 2（1 = F，即 F 大调）
      // 第一个八度（物理 F4 低于筒音，所以从 2 开始）
      '2_0': 392.00,
      '#2_0,b3_0': 415.30,
      '3_0,b4_0': 440.00,
      '4_0,#3_0': 466.16,
      '#4_0,b5_0': 493.88,
      '5_0': 523.25,
      '#5_0,b6_0': 554.37,
      '6_0': 587.33,
      '#6_0,b7_0': 622.25,
      '7_0,b1_1': 659.25,

      // 第二个八度
      '1_1,#7_0': 698.46,
      '#1_1,b2_1': 739.99,
      '2_1': 783.99,
      '#2_1,b3_1': 830.61,
      '3_1,b4_1': 880.00,
      '4_1,#3_1': 932.33,
      '#4_1,b5_1': 987.77,
      '5_1': 1046.50,
      '#5_1,b6_1': 1108.73,
      '6_1': 1174.66,
      '#6_1,b7_1': 1244.51,
      '7_1,b1_2': 1318.51,

      // 第三个八度
      '1_2,#7_1': 1396.91,
      '#1_2,b2_2': 1479.98,
      '2_2': 1567.98,
      '#2_2,b3_2': null,
      '3_2,b4_2': 1760.00,
      '4_2,#3_2': null,
      '#4_2,b5_2': 1864.66,
      '5_2': 2093.00
    },
    5: {  // 筒音作 5（1 = C，即 C 大调）
      // 第一个八度（低于主音 1 的音区）
      '5_-1': 392.00,
      '#5_-1,b6_-1': 415.30,
      '6_-1': 440.00,
      '#6_-1,b7_-1': 466.16,
      '7_-1,b1_0': 493.88,

      // 第二个八度（从这里开始是 1 = C）
      '1_0,#7_-1': 523.25,
      '#1_0,b2_0': 554.37,
      '2_0': 587.33,
      '#2_0,b3_0': 622.25,
      '3_0,b4_0': 659.25,
      '4_0,#3_0': 698.46,
      '#4_0,b5_0': 739.99,
      '5_0': 783.99,
      '#5_0,b6_0': 830.61,
      '6_0': 880.00,
      '#6_0,b7_0': 932.33,
      '7_0,b1_1': 987.77,

      // 第三个八度
      '1_1,#7_0': 1046.50,
      '#1_1,b2_1': 1108.73,
      '2_1': 1174.66,
      '#2_1,b3_1': 1244.51,
      '3_1,b4_1': 1318.51,
      '4_1,#3_1': 1396.91,
      '#4_1,b5_1': 1479.98,
      '5_1': 1567.98,
      '#5_1,b6_1': null,
      '6_1': 1760.00,
      '#6_1,b7_1': null,
      '7_1,b1_2': 1975.53,

      // 第四个八度
      '1_2,#7_1': 2093.00
    }
  }
}
const noteFreqMap = computed(() =>
    Object.entries(NOTE_FREQ[tune.value]).reduce((res, [mode, freqMap]) => {
      res[mode] = Object.entries(freqMap).reduce((acc, [key, value]) => {
        key.split(',').forEach(k => acc[k] = value)
        return acc
      }, {})
      return res
    }, {})
)*/

/**
 * 音色合成引擎
 * @param freq 基频频率（单位：Hz），例如中央C为 261.63
 * @param duration 音符持续时长（单位：秒）
 * @param volume 总音量系数（范围 0.0 ~ 1.0），用于统一控制响度
 */
function playTone(freq, duration, volume = 0.2) {
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

  // 创建一个 Promise，专门等待音频线程播放结束
  let endResolve
  const endedPromise = new Promise((resolve) => {
    endResolve = resolve
  })

  // 播放结束后自动清理
  // 以 osc1 作为“监听哨兵”，当它停止时执行清理
  let cleanup = false
  let stopped = false
  osc1.onended = () => {
    cleanup = true
    osc1.disconnect()
    osc2.disconnect()
    osc3.disconnect()
    noise.disconnect()
    gain1.disconnect()
    gain2.disconnect()
    gain3.disconnect()
    gainNoise.disconnect()
    mixGain.disconnect()
    filter.disconnect()
    osc1.onended = null
    console.log(`音符[${playState.events[playState.index].note}]音频结束，是否被提前停止：${stopped}`)
    if (!stopped) playState.index++
    // 通知等待中的 Promise 继续执行
    endResolve()
  }

  return {
    stop() {
      if (cleanup || stopped) return
      stopped = true
      const now = ctx.currentTime
      // 先取消所有包络，再将音量瞬间归零
      mixGain.gain.cancelScheduledValues(now)
      mixGain.gain.setValueAtTime(0, now)

      // 振幅已为0，此时硬停不会产生爆音
      // 多给 0.005s 确保 setValueAtTime 已生效（音频线程有微小延迟）
      const stopTime = now + 0.005
      osc1.stop(stopTime)
      osc2.stop(stopTime)
      osc3.stop(stopTime)
      noise.stop(stopTime)
    },
    ended: endedPromise
  }
}

// 播放状态
const PLAY_STATE = {
  PLAYING: 'playing',
  PAUSED: 'paused',
  STOPPED: 'stopped'
}
const playState = reactive({
  status: PLAY_STATE.STOPPED, // 播放状态
  events: [], // 待播放的事件队列
  index: 0,
  unitDur: 0,
  renderBox: null,
  stop: null  // 当前声音的停止函数
})

// 停止播放
function stopPlay() {
  if (playState.status === PLAY_STATE.STOPPED) return
  playState.status = PLAY_STATE.STOPPED
  playState.index = 0
  playState.events = []
  // 清除高亮
  const target = playState.renderBox.querySelector('.highlight')
  if (target) target.classList.remove('highlight')
  // 立刻停止播放
  if (playState.stop) {
    playState.stop()
    playState.stop = null
  }
}

/**
 * 切换播放状态（播放/暂停）
 * 解析输入文本，处理延音符号，并按BPM节奏播放音符
 */
async function togglePlay() {
  // 如果正在播放，则暂停播放
  if (playState.status === PLAY_STATE.PLAYING) {
    playState.status = PLAY_STATE.PAUSED
    if (playState.stop) {
      playState.stop()
      playState.stop = null
    }
    return
  }

  // 创建音频上下文（如果尚未创建）
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  // 确保音频上下文激活
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }

  // 如果之前是暂停状态，则继续播放
  if (playState.status === PLAY_STATE.PAUSED) {
    playState.status = PLAY_STATE.PLAYING
    await step()
    return
  }

  if (result.events.length === 0) {
    ElMessage.error('请先渲染生成洞洞谱')
    return
  }

  // 设置播放状态
  playState.status = PLAY_STATE.PLAYING
  playState.events = result.events
  playState.unitDur = 60 / bpm.value
  const pre = playState.renderBox.querySelector('.highlight')
  if (pre) pre.classList.remove('highlight')

  // 开始播放
  await step()
}

const sleep = (time) => new Promise(resolve => setTimeout(() => {
      playState.index++
      resolve()
    }, time)
)

/**
 * 播放下一步
 * 递归调用，按BPM节奏逐个播放音符
 */
async function step() {
  // 播放结束
  if (playState.index >= playState.events.length) {
    stopPlay()
    return
  }
  // 点击了停止播放 或 暂停播放
  if (playState.status !== PLAY_STATE.PLAYING) return

  // 获取当前播放事件
  const ev = playState.events[playState.index]
  // 计算音符持续时间（秒）= 拍数 * (60 / BPM)
  const dur = ev.beats * playState.unitDur

  // 如果是音符类型，播放声音
  const pre = playState.renderBox.querySelector(`.highlight`)
  const curr = playState.renderBox.querySelector('.note-idx-' + ev.index)
  if (pre) pre.classList.remove('highlight')
  curr.classList.add('highlight')
  if (autoScroll.value) {
    curr.scrollIntoView({
      block: 'nearest',   // 表示仅在超出边界时才滚动（垂直）
      inline: 'nearest',  // 表示仅在超出边界时才滚动（水平）
      behavior: 'smooth'  // 可选：平滑滚动
    })
  }

  console.log('播放音符:', ev.note, '持续时间:', dur * 1000, 'ms')
  if (ev.type === 'note') {
    // console.log(noteKey, freq)
    // if (freq) playTone(freq, dur * 0.9)
    if (ev.freq) {
      const player = playTone(ev.freq, dur)
      playState.stop = player.stop
      await player.ended
    } else {
      console.warn(`未知音符: ${ev.note}`)
      await sleep(dur * 1000)
    }
  } else {
    await sleep(dur * 1000)
  }

  // 播放下一个事件
  await step()

  // 设置定时器，根据BPM计算延迟时间（该方案 setTimeout 误差可达 10-50ms，累积后节奏会明显偏移）
  //playState.timer = setTimeout(() => step(), dur * 1000)
}

// ========== 导出功能 ==========
/** 导出为图片 */
const exportAsImage = async () => {
  if (scoreData.value.length === 0) {
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
            <el-select v-model="tune" size="small" style="width: 100px">
              <el-option label="A调" value="A"/>
              <el-option label="Bb调" value="Bb"/>
              <el-option label="C调" value="C"/>
              <el-option label="D调" value="D"/>
              <el-option label="F调" value="F"/>
              <el-option label="G调" value="G"/>
            </el-select>
            <el-select v-model="mode" size="small" style="width: 100px">
              <el-option label="筒音作1" value="1"/>
              <el-option label="筒音作2" value="2"/>
              <el-option label="筒音作5" value="5"/>
            </el-select>
            <el-button size="small" type="success" @click="convert">
              生成
            </el-button>
          </div>
        </div>

        <div class="panel-body">
          <el-input
              v-model.trim="inputText"
              style="width: 100%"
              :rows="25"
              type="textarea"
              placeholder="在这里输入简谱格式的乐谱..."
          />
          <div class="syntax-help">
            <span><code>1-7</code> 普通音符</span>
            <span><code>,</code> 低八度</span>
            <span><code>'</code> 高八度</span>
            <span><code>_</code> 降号</span>
            <span><code>^</code> 升号</span>
            <span><code>.</code> 附点音符</span>
            <span><code>/</code> 减时线</span>
            <span><code>-</code> 增时线</span>
            <span><code>0</code> 休止</span>
            <span><code>|</code> 小节线</span>
            <span><code>空格</code> 分隔</span>
          </div>
        </div>

        <!-- 音频播放区 -->
        <div class="control-row play-row">
          <button class="play-btn" @click="togglePlay">
            <template v-if="playState.status === PLAY_STATE.PLAYING"><span class="play-icon">⏸</span> 暂停</template>
            <template v-else><span class="play-icon">▶</span> 播放</template>
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
            <div class="input">自动滚动：
              <el-switch v-model="autoScroll"/>
            </div>
            <div class="input">隐藏笛身：
              <el-switch v-model="hideWhistle"/>
            </div>
            <el-button size="small" @click="exportAsImage" :disabled="result.renderStr !== ''">
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
          <div class="render-box" id="render-container" v-html="result.renderStr"/>
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
    margin-top: 15px;
    padding: 15px;
    text-align: left;
    font-size: 14px;
    line-height: 2;
    color: #6e6d6d;
    border-radius: 8px;
    border: 1px solid #c0c4cc;

    span {
      margin-right: 20px;
      font-size: 14px;
    }

    code {
      background: #fff;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 14px;
      color: #4c4b4b;
      border: 1px solid #dee2e6;
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

.buttons {
  display: flex;
  align-items: center;
  gap: 10px;

  .input {
    display: flex;
    align-items: center;
    color: #606266;
    font-size: 12px;
    margin-right: 10px;
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

.right-panel :deep(.render-box) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #303133;
  display: flex;
  flex-wrap: wrap;

  .score-item {
    display: flex;
  }

  .barline {
    width: 1px;
    //height: 90%;
    background: #222;
    margin: 0 6px 30px 6px;
    align-self: stretch;
  }

  .note-group {
    width: 50px;
    //height: 180px;
    padding-top: 5px;
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .note-label {
      display: flex;
      flex-direction: column;
      //gap: 2px;
      margin-bottom: 4px;

      // 八度点
      .octave-dot {
        font-size: 8px;
        height: 4px;
        line-height: 4px;
        color: #222;
      }

      // 减时线
      .halve-line {
        height: 0;
        margin: 0 -2px;
        border-bottom: solid 1px #000;
        margin-bottom: 2px;
      }

      .note-num {
        position: relative;
        font-size: 16px;
        font-weight: bold;
        line-height: 1;
        margin-top: 2px;
      }
    }

    // 笛子
    .whistle {
      display: v-bind(whistleDisplay);
      flex-direction: column;
      align-items: center;
      justify-content: center;

      // 笛身：单列6孔
      .whistle-body {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 6px 4px;
        border: 1px solid #222;
        border-radius: 10px;
        width: 12px;
        margin-bottom: 2px;
      }

      .hole {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: 1px solid #222;

        &.close {
          background: #222;
        }

        &.half-close {
          // 黑色得设置大一点，原因：光渗效应（Irradiation Illusion）- 相同面积的黑色和白色，白色看起来总是比黑色大
          background: linear-gradient(to left, #222 55%, #fff 50%);
          //background: conic-gradient(
          //    from 0deg at 50% 50%,
          //    #222 0deg 180deg,   // 右半圆黑色
          //    #fff 180deg 360deg  // 左半圆白色
          //);
        }
      }

      // 超吹标记
      .whistle-octave {
        font-size: 12px;
      }
    }
  }

  .highlight {
    background-color: #d0d8ee;
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
    border-top: 1px solid #c0c4cc;
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
