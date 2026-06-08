import { defineStore } from 'pinia'
import { ref } from 'vue'

// 默认乐谱
const DEFAULT_ABC = `X:1
T:小星星
M:4/4
L:1/4
K:C
C C G G | A A G2 | F F E E | D D C2 |]`

// 示例乐谱库
const EXAMPLES = {
  twinkle: `X:1\nT:小星星\nM:4/4\nL:1/4\nK:C\nC C G G | A A G2 | F F E E | D D C2 |]`,
  ode: `X:1\nT:欢乐颂（片段）\nM:4/4\nL:1/4\nK:C\nE E F G | G F E D | C C D E | E D2 D |\nE E F G | G F E D | C C D E | D C2 C |]`,
  scale: `X:1\nT:C大调音阶\nM:4/4\nL:1/8\nK:C\nC D E F | G A B c | c B A G | F E D C |]`,
}

export const useScoreStore = defineStore('score', () => {
  const abcText = ref(DEFAULT_ABC)
  const currentVisualObj = ref(null)
  const currentSynthControl = ref(null)
  const currentSynth = ref(null)
  const audioContext = ref(null)
  const isAudioEnabled = ref(false)
  const totalTime = ref(0)
  const statusMessage = ref('')
  const statusType = ref('success')

  // 显示状态提示
  const showStatus = (message, type = 'info') => {
    statusMessage.value = message
    statusType.value = type
  }

  // 加载示例乐谱
  const loadExample = (name) => {
    if (EXAMPLES[name]) {
      abcText.value = EXAMPLES[name]
    }
  }

  // 清空编辑器
  const clearEditor = () => {
    stopPlayback()
    abcText.value = ''
    currentVisualObj.value = null
    showStatus('已清空', 'success')
  }

  // 停止播放
  const stopPlayback = () => {
    if (currentSynthControl.value) {
      currentSynthControl.value.pause()
      currentSynthControl.value = null
    }
    currentSynth.value = null
  }

  // 格式化时间为 MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return {
    abcText,
    currentVisualObj,
    currentSynthControl,
    currentSynth,
    audioContext,
    isAudioEnabled,
    totalTime,
    statusMessage,
    statusType,
    showStatus,
    loadExample,
    clearEditor,
    stopPlayback,
    formatTime,
  }
})
