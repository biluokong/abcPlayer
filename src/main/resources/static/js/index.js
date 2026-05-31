// ========== 全局变量声明 ==========
/**
 * 当前渲染的乐谱对象，包含解析后的乐谱数据和元信息
 * @type {ABCJS.TuneObject | null}
 */
let currentVisualObj = null
/**
 * 合成器控制器实例，提供播放、暂停、循环等音频控制功能
 * @type {ABCJS.SynthObjectController | null}
 */
let currentSynthControl = null
/**
 * MIDI 音频缓冲区实例，用于管理和播放音频数据
 * @type {ABCJS.MidiBuffer | null}
 */
let currentSynth = null
/**
 * Web Audio API 的音频上下文，管理所有音频节点
 * @type {AudioContext | null}
 */
let audioContext = null
/**
 * 标记音频是否已启用（需要用户交互后才能激活）
 * @type {boolean}
 */
let isAudioEnabled = false

/**
 * 音色库 URL 配置
 * common: 本地音色库路径（/sound/ 目录下的 MP3 文件）
 * backup: 备用在线音色库（当本地资源不可用时使用）
 */
const SOUNDFONT_URLS = {
  common: './sound/',
  backup: 'https://cdn.rawgit.com/gleitz/midi-js-soundfonts/master/FluidR3_GM/'
}
/**
 * 当前使用的音色库 URL，默认为本地路径
 * @type {string}
 */
let currentSoundfontUrl = SOUNDFONT_URLS.common

// ========== 游标控制器类 ==========
/**
 * CursorControl 类实现 ABCJS.CursorControl 接口
 * 用于在播放时高亮显示当前音符，实现卡拉 OK 式跟随效果
 * 通过 onEvent 回调接收音符事件并更新 SVG 游标位置
 * @implements {ABCJS.CursorControl}
 */
class CursorControl {
  /** 节拍细分数量（默认为 2） */
  beatSubDivision = 2

  constructor() {
    /**
     * 节拍细分数量，默认为 2（每拍分为两个子节拍）
     * @type {number}
     */
    this.beatSubDivision = 2
    /**
     * SVG 游标线元素，显示当前播放位置
     * @type {SVGLineElement | null}
     */
    this.cursor = null
    /**
     * 乐谱的 SVG 容器元素
     * @type {SVGSVGElement | null}
     */
    this.svg = null
  }

  /**
   * 音频引擎准备就绪时的回调
   */
  onReady() {
    console.log('✅ 音频引擎已准备就绪')
  }

  /**
   * 播放开始时的回调
   * 创建或初始化 SVG 游标线元素
   */
  onStart() {
    // 获取乐谱容器的 SVG 元素
    this.svg = document.querySelector('#score-container svg')
    if (!this.svg) return

    // 查找已存在的游标线，如果不存在则创建新的
    this.cursor = this.svg.querySelector('.abcjs-cursor')
    if (!this.cursor) {
      // 创建 SVG line 元素作为游标
      this.cursor = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      this.cursor.setAttribute('class', 'abcjs-cursor')
      this.cursor.setAttribute('x1', '0')
      this.cursor.setAttribute('y1', '0')
      this.cursor.setAttribute('x2', '0')
      this.cursor.setAttribute('y2', '0')
      this.svg.appendChild(this.cursor)
    }
    console.log('🎬 播放开始')
  }

  /**
   * 每个音符事件触发时的回调
   * @param {ABCJS.NoteTimingEvent} ev - 音符时序事件对象
   *   - elements: 当前音符的 DOM 元素数组
   *   - left: 音符左侧 X 坐标（像素）
   *   - top: 音符顶部 Y 坐标（像素）
   *   - height: 音符高度（像素）
   *   - measureStart: 是否为小节开始
   */
  onEvent(ev) {
    const svg = document.querySelector('#score-container svg')
    if (!svg) return

    // 清除之前所有音符的高亮样式（移除 .highlight 类）
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
      // 设置游标线的起点和终点坐标（在音符左侧 3px 处）
      this.cursor.setAttribute('x1', String(ev.left - 3))
      this.cursor.setAttribute('x2', String(ev.left - 3))
      this.cursor.setAttribute('y1', String(ev.top))
      this.cursor.setAttribute('y2', String(ev.top + ev.height))
    }
  }

  /**
   * 播放结束时的回调
   * 清除所有高亮并将游标重置到初始位置
   */
  onFinished() {
    const svg = document.querySelector('#score-container svg')
    if (!svg) return

    // 移除所有音符的高亮样式
    svg.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'))

    // 将游标线重置到 (0,0) 位置（隐藏状态）
    this.cursor = svg.querySelector('.abcjs-cursor')
    if (this.cursor) {
      this.cursor.setAttribute('x1', '0')
      this.cursor.setAttribute('x2', '0')
      this.cursor.setAttribute('y1', '0')
      this.cursor.setAttribute('y2', '0')
    }
    console.log('🏁 播放结束')
  }

  /** 每个节拍时调用 */
  onBeat(beatNumber, totalBeats, totalTime) {
  }
}

// 创建游标控制器实例
const cursorControl = new CursorControl()

// ========= 时钟相关 ==========
let totalTime = 0

// ========== 工具方法 ==========
/**
 * 格式化时间为 MM:SS 格式
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时间字符串
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * 将MM:SS格式的时间字符串转换为秒数
 * @param {string} timeString - 时间字符串，格式为 MM:SS
 * @returns {number} 转换后的秒数
 */
function parseTimeString(timeString) {
  const [mins, secs] = timeString.split(':').map(Number)
  return mins * 60 + secs
}

/**
 * 显示总时长徽章
 * @param {number} duration - 时长（秒）
 */
function showTotalDuration(duration) {
  const durationBadge = document.getElementById('total-duration')
  if (!durationBadge) return

  const formatted = formatTime(duration)

  const durationText = durationBadge.querySelector('.duration-text')
  if (durationText) {
    durationText.textContent = formatted
  }

  // 显示徽章（如果隐藏的话）
  durationBadge.style.display = 'inline-flex'

  console.log(`⏱️ 总时长: ${formatted} (${duration.toFixed(2)}秒)`)
}

// ========== 音频控制功能 ==========
/**
 * 启用音频播放功能
 * 由于浏览器安全策略，Web Audio API 需要用户交互（点击）才能激活
 * 此函数会恢复 AudioContext 并初始化音频合成器
 */
async function enableAudio() {
  // 如果音频已启用，仅显示提示
  if (isAudioEnabled) {
    showStatus('音频已启用', 'info')
    return
  }

  try {
    showStatus('正在启用音频...', 'info')

    // 创建 AudioContext 实例（兼容不同浏览器）
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }

    // 如果 AudioContext 处于暂停状态，恢复它
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    isAudioEnabled = true
    showStatus('✅ 音频已启用，现在可以播放了！', 'success')

    // 如果已有渲染的乐谱，立即初始化音频
    if (currentVisualObj) {
      await initAudio()
    }
  } catch (error) {
    console.error('启用音频失败:', error)
    showStatus('❌ 启用音频失败: ' + error.message, 'error')
  }
}

// ========== 乐谱渲染功能 ==========
/**
 * 渲染 ABC 乐谱为 SVG 五线谱
 * 调用 ABCJS.renderAbc() 将文本格式的 ABC 乐谱转换为可视化的 SVG 图形
 * 如果音频已启用，会自动初始化音频播放功能
 */
async function renderScore() {
  // 获取用户输入的 ABC 乐谱字符串
  const abcString = document.getElementById('abcInput').value.trim()

  if (!abcString) {
    showStatus('请输入ABC乐谱！', 'error')
    return
  }

  try {
    // 停止当前正在播放的音频（如果有）
    stopPlayback()

    /**
     * 调用 ABCJS.renderAbc() 渲染乐谱
     * @param {string} 'score-container' - 目标容器 ID
     * @param {string} abcString - ABC 格式乐谱
     * @param {ABCJS.AbcVisualParams} 渲染参数配置
     *   - responsive: 'resize' 表示响应式布局，随容器大小调整
     *   - staffwidth: 600 谱表宽度（像素）
     *   - add_classes: true 为乐谱元素添加 CSS 类名，便于自定义样式
     * @returns {ABCJS.TuneObject[]} 渲染后的乐谱对象数组
     */
    const visualObjs = ABCJS.renderAbc('score-container', abcString, {
      responsive: 'resize',
      staffwidth: 600,
      add_classes: true
    })

    // 检查渲染结果是否有效
    if (!visualObjs || visualObjs.length === 0) {
      showStatus('无法解析乐谱，请检查ABC格式！', 'error')
      return
    }

    // 保存第一个乐谱对象（单乐曲情况）
    currentVisualObj = visualObjs[0]
    // 初始化乐谱的时序信息，需要先调用此方法才能获取到totalTime和totalBeats
    currentVisualObj.setTiming()
    totalTime = currentVisualObj.getTotalTime()
    // console.log(currentVisualObj.getTotalTime())
    // console.log(currentVisualObj.getTotalBeats())
    // console.log(currentVisualObj.getBpm())
    // console.log(currentVisualObj.millisecondsPerMeasure())
    // console.log(currentVisualObj.setUpAudio().totalDuration)
    showStatus('✅ 乐谱渲染成功！点击"启用音频"按钮后即可播放', 'success')

    // 如果音频已启用且 AudioContext 正在运行，初始化音频播放
    if (isAudioEnabled && audioContext && audioContext.state === 'running') {
      await initAudio()
    } else {
      showStatus('💡 提示：点击"启用音频"按钮来激活播放功能', 'info')
    }
  } catch (error) {
    console.error('渲染错误:', error)
    showStatus('❌ 渲染失败：' + error.message, 'error')
  }
}

// ========== 音频初始化功能 ==========
/**
 * 初始化音频播放系统
 * 创建音频合成器和控制器，加载音色库资源，设置播放控件
 * 支持自动切换到备用音色库（当本地资源不可用时）
 */
async function initAudio() {
  // 检查浏览器是否支持 Web Audio API
  if (!ABCJS.synth.supportsAudio()) {
    showStatus('⚠️ 您的浏览器不支持Web Audio API', 'error')
    return
  }

  try {
    // 确保 AudioContext 存在
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }

    // 如果 AudioContext 被暂停，提示用户启用音频
    if (audioContext.state === 'suspended') {
      showStatus('⏸️ 音频已暂停，点击"启用音频"按钮', 'warning')
      return
    }

    // 创建音频合成器实例（MidiBuffer 接口）
    if (!currentSynth) {
      currentSynth = new ABCJS.synth.CreateSynth()
    }

    // 创建合成器控制器实例（提供播放控制 UI）
    if (!currentSynthControl) {
      currentSynthControl = new ABCJS.synth.SynthController()
    }

    /**
     * 加载音频控制 UI 到指定容器
     * @param {string} '#audio-controls' - 控制面板的容器 ID
     * @param {ABCJS.CursorControl} cursorControl - 游标控制器，用于音符高亮跟随
     * @param {ABCJS.SynthVisualOptions} 视觉显示选项
     *   - displayPlay: true 显示播放/暂停按钮
     *   - displayRestart: true 显示重新开始按钮
     *   - displayProgress: true 显示进度条
     *   - displayWarp: true 显示速度调节控件
     *   - displayLoop: true 显示循环播放按钮
     *   - soundfontUrl: 音色库 URL 地址
     */
    currentSynthControl.load('#audio-controls', cursorControl, {
      displayPlay: true,
      displayRestart: true,
      displayProgress: true,
      displayWarp: true,
      displayLoop: true
    })

    /**
     * 初始化音频合成器
     * @param {ABCJS.MidiBufferOptions} 初始化参数（平铺结构）
     *   - visualObj: 要播放的乐谱对象
     *   - audioContext: Web Audio 上下文
     *   - options: 音频配置选项（SynthOptions）
     *     - soundfontUrl: 音色库 URL
     * @returns {Promise<ABCJS.SynthInitResponse>} 初始化结果
     */
    await currentSynth.init({
      visualObj: currentVisualObj,
      audioContext: audioContext,
      options: {
        soundFontUrl: currentSoundfontUrl
      }
    })

    /**
     * 设置要播放的乐谱并关联到控制器
     * @param {ABCJS.TuneObject} currentVisualObj - 乐谱对象
     * @param {boolean} false - 是否为非用户操作触发
     * @returns {Promise<void>}
     */
    await currentSynthControl.setTune(currentVisualObj, false)

    const playButton = document.querySelector('.abcjs-midi-start')
    const durationText = document.querySelector('.duration-text')
    const clock = document.querySelector('.abcjs-midi-clock')
    showTotalDuration(totalTime)

    if (playButton && durationText) {
      // console.log('播放按钮和总时长元素已找到')
      // 监听播放按钮点击事件
      let intervalId;
      playButton.addEventListener('click', () => {
        intervalId = setInterval(() => {
          // 检查播放状态，播放时"播放按钮"会添加此类名
          const isPlaying = playButton.classList.contains('abcjs-pushed')
          if (isPlaying) {
            const remainingTime = totalTime - parseTimeString(clock.textContent)
            // console.log('剩余时间:', remainingTime)
            durationText.textContent = formatTime(remainingTime)
          } else {
            durationText.textContent = formatTime(0)
            setTimeout(() => durationText.textContent = formatTime(totalTime), 500)
            clearInterval(intervalId)
          }
        }, 200)
      })
    }

    showStatus('🎵 音频加载完成，点击播放按钮！', 'success')
  } catch (error) {
    console.error('音频初始化错误:', error)
    showStatus('⚠️ 音频加载失败，但乐谱显示正常。', 'error')

    // 如果使用的是本地音色库失败，尝试切换到备用在线音色库
    if (currentSoundfontUrl === SOUNDFONT_URLS.common) {
      showStatus('⚠️ 正在尝试使用备用音色库...', 'warning')
      currentSoundfontUrl = SOUNDFONT_URLS.backup
      await initAudio() // 递归调用重新初始化
    } else {
      showStatus('⚠️ 音频加载失败，但乐谱显示正常。', 'error')
    }
  }
}

// ========== 辅助工具函数 ==========
/**
 * 停止播放并清理音频资源
 * 关闭当前的合成器控制器和合成器实例，清空控制面板
 */
function stopPlayback() {
  // 停止并关闭合成器控制器
  if (currentSynthControl) {
    currentSynthControl.pause()
    currentSynthControl = null
  }
  // 释放合成器实例
  currentSynth = null

  // 清空音频控制面板的 HTML 内容
  const audioControlsDiv = document.getElementById('audio-controls')
  if (audioControlsDiv) {
    audioControlsDiv.innerHTML = ''
  }
}

/**
 * 显示状态提示信息
 * @param {string} message - 要显示的提示消息
 * @param {'success'|'error'|'info'|'warning'} type - 消息类型（影响样式）
 */
function showStatus(message, type) {
  const statusDiv = document.getElementById('status')
  statusDiv.textContent = message
  statusDiv.className = type

  // 5 秒后自动清除消息
  setTimeout(() => {
    if (statusDiv.textContent === message) {
      statusDiv.textContent = ''
      statusDiv.className = 'status'
    }
  }, 5000)
}

/**
 * 清空编辑器和乐谱显示
 * 停止播放、清空输入框、清除渲染的乐谱和乐谱对象
 */
function clearEditor() {
  stopPlayback()
  document.getElementById('abcInput').value = ''
  document.getElementById('score-container').innerHTML = ''
  currentVisualObj = null
  showStatus('已清空', 'success')
}

/**
 * 加载示例乐谱
 * @param {'twinkle'|'ode'|'scale'} exampleName - 示例名称
 *   - twinkle: 小星星
 *   - ode: 欢乐颂（片段）
 *   - scale: C大调音阶
 */
function loadExample(exampleName) {
  // 定义示例乐谱库（ABC 格式字符串）
  const examples = {
    twinkle: `X:1\nT:小星星\nM:4/4\nL:1/4\nK:C\nC C G G | A A G2 | F F E E | D D C2 |]`,
    ode: `X:1\nT:欢乐颂（片段）\nM:4/4\nL:1/4\nK:C\nE E F G | G F E D | C C D E | E D2 D |\nE E F G | G F E D | C C D E | D C2 C |]`,
    scale: `X:1\nT:C大调音阶\nM:4/4\nL:1/8\nK:C\nC D E F | G A B c | c B A G | F E D C |]`
  }

  const abcText = examples[exampleName]
  if (abcText) {
    // 将示例乐谱填入输入框并自动渲染
    document.getElementById('abcInput').value = abcText
    renderScore()
  }
}

// ========== 事件监听器注册 ==========
/**
 * DOM 内容加载完成后执行
 * 自动渲染默认乐谱，并设置一次性点击监听以启用音频
 */
window.addEventListener('DOMContentLoaded', () => {
  // 页面加载时自动渲染默认的 ABC 乐谱
  renderScore()

  /**
   * 添加全局点击监听器（仅触发一次）
   * 用于在用户首次点击页面时自动启用音频（满足浏览器自动播放策略要求）
   * @listens click - 页面任意位置的点击事件
   */
  document.body.addEventListener('click', async () => {
    // 如果音频未启用且 AudioContext 处于暂停状态，自动启用
    if (!isAudioEnabled && audioContext && audioContext.state === 'suspended') {
      await enableAudio()
    }
  }, { once: true }) // once: true 表示此监听器只触发一次
})

/**
 * 页面卸载前清理资源
 * 停止播放并关闭 AudioContext，防止内存泄漏
 * @listens beforeunload - 页面即将卸载事件
 */
window.addEventListener('beforeunload', () => {
  stopPlayback()
  if (audioContext) {
    audioContext.close() // 关闭音频上下文，释放系统资源
  }
})