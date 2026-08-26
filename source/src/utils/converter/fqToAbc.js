import Fraction from 'fraction.js'

/**
 * 转换器上下文，保存状态信息
 */
class ConverterContext {
  constructor() {
    this.letterMap = new Map()
    this.mergeUnit = new Fraction(1, 4)
    this.unit = new Fraction(1, 4)      // 对应注释 "L"
    this.tempSection = ''
    this.sumTime = new Fraction(0)
  }
}

const LETTER_ARR_UP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const LETTER_AR_DOWN = ['C', 'D$', 'D', 'E$', 'E', 'F', 'G$', 'G', 'A$', 'A', 'B$', 'B']
const END_MARKER = ['0', '1', '2', '3', '4', '5', '6', '7', '|', ':']

/**
 * 将简谱字符串转换为ABC谱字符串
 *
 * @param {string} fqStr 简谱格式字符串
 * @returns {string} ABC谱格式字符串
 */
function convert(fqStr) {
  const context = new ConverterContext()
  const headList = [], bodyList = []

  fqStr.split('\n').forEach(line => {
    if (line.startsWith('Q:')) bodyList.push(line)
    else headList.push(line)
  })

  return convertHead(headList, context) + convertBody(bodyList, context)
}

/**
 * 转换头部信息
 */
function convertHead(headList, context) {
  let one = 'C', res = []

  // 处理头部信息
  for (const line of headList) {
    if (line.startsWith('B:')) {        // 标题
      res.push(`T: ${line.substring(2).trim()}\n`)
    } else if (line.startsWith('Z:')) { // 作者
      res.push(`C: ${line.substring(2).trim()}\n`)
    } else if (line.startsWith('D:')) { // 调式
      res.push('K: C\n')
      one = line.substring(2).trim()
    } else if (line.startsWith('P:')) { // 拍号
      const signature = line.substring(2).trim()
      const split = signature.split('/')
      if (split[1] === '8' && split[0] === '6') {
        context.mergeUnit = new Fraction(3, 8)
      } else if (split[1] === '8') {
        context.mergeUnit = new Fraction(1, 8)
      }
      res.push(`M: ${signature}\n`)
    }
  }

  // 添加默认的节拍和速度信息
  res.push('L: 1/4\n')
  res.push('Q: 1/4=90\n')

  // 构建音符映射
  context.letterMap = buildLetterMap(one)

  return res.join('')
}

/**
 * 构建音符映射表
 */
function buildLetterMap(one) {
  const letterMap = new Map()
  letterMap.set('0', 'z')

  // 根据调式选择音阶数组
  let letterArr = LETTER_ARR_UP
  if (one.endsWith('$')) letterArr = LETTER_AR_DOWN

  // 查找当前调式在音阶数组中的位置
  let idx = 0
  for (let i = 0; i < letterArr.length; i++) {
    if (one === letterArr[i]) {
      idx = i
      break
    }
  }

  // 构建音符映射（1-7 对应音阶中的音符）
  let suffix = ''
  for (let i = 1; i <= 7; i++) {
    // 如果超出音阶范围，添加高音标记并取模
    if (idx >= letterArr.length) {
      suffix += '\''
      idx = idx % letterArr.length
    }
    // 将数字 i 转为字符，并映射到对应的音符字母 + 后缀
    letterMap.set(String(i), letterArr[idx] + suffix)
    // 音阶跳跃规则：3 和 7 时跳 1 位，其他跳 2 位
    if (i === 3 || i === 7) {
      idx++
    } else {
      idx += 2
    }
  }

  return letterMap
}

/**
 * 转换主体内容
 */
function convertBody(bodyList, context) {
  const result = [];

  for (const line of bodyList) {
    // 去掉每行开头的 "Q:" 和一些无用字符
    const currLine = line.substring(2).replace(/[ \t^~]/g, "");
    // 转换当前行
    const convertedLine = convertLine(currLine, context);
    result.push("\n" + convertedLine);
  }

  if (result.length > 0) {
    let res = result.join('').substring(1);
    // 末尾的 "||" 要换成ABC谱的 "|]"
    if (res.endsWith("||")) {
      return res.substring(0, res.length - 1) + "]";
    }
    // 如果有跳房子，可能末尾会是 "||]" 需要移除多余的 "|"
    if (res.endsWith("||]")) {
      return res.substring(0, res.length - 2) + "]";
    }
    return res;
  }

  return "";
}

/**
 * 转换单行
 */
function convertLine(line, context) {
  const sb = []
  let i = 0
  const n = line.length

  while (i < n) {
    const c = line.charAt(i)
    // 处理数字 0-7
    if (c >= '0' && c <= '7') {
      // 收集数字后的连续修饰符
      let j = i + 1
      let modifierStr = ''
      while (j < n && !END_MARKER.includes(line.charAt(j))) {
        if (line.charAt(j) === '[') {    // 倚音
          let k = j + 1
          while (line.charAt(k) !== ']') k++
          j = k
        }
        j++
      }
      if (j > i + 1) {
        modifierStr = line.substring(i + 1, j)
      }
      handleModifier(context.letterMap.get(c), modifierStr, sb, context)
      i = j
    } else {
      i = handleSectionEnd(line, c, i, sb, context)
    }
  }

  return sb.join('')
}

/**
 * 处理小节线等段落结束标记
 */
function handleSectionEnd(line, c, i, sb, context) {
  // 小节线后的'"'不是注释。临时拍号: "p:x/x"
  if (c === '"' && line.charAt(i + 1) === 'p') {
    sb.push('\n')
    // 如果临时拍号前面没有内容，则删除多余的小节线和添加的换行符
    if (i === 1) sb.splice(sb.length - 2, 2)
    const temp = line.substring(i + 3)
    const end = temp.indexOf('"')
    sb.push('M:' + temp.substring(0, end) + '\n')
    return i + 3 + end + 1
  }

  if (c === '[') {  // 小节线后的'['是跳房子, 后面跟用引号包裹的标签名
    const endIdx = line.indexOf('"', i + 2)
    const tag = line.substring(i + 2, endIdx).replace(/\./g, '')   // ABC谱不支持.
    sb.push('[' + tag + ' ')
    return endIdx + 1
  }

  if (c === ':' || c === '|') {  // 小节线：":|" "|" "||" "|:" "||/"
    // 分节后重新计算时值
    sb.push(context.tempSection.trim())
    context.tempSection = ''
    context.sumTime = new Fraction(0)

    let j = i + 1
    while (j < line.length && !context.letterMap.has(line.charAt(j))) j++
    const mark = line.substring(i, j).toLowerCase()

    if (mark.startsWith('||') || mark.startsWith('|:') || mark.startsWith(':|')) {
      const sectionTag = mark.substring(0, 2)
      if (j === i + 2 || mark.charAt(2) !== '&') {
        sb.push(sectionTag)
        return i + 2
      }
      const offset = handleEndMarker(mark.substring(3), sb)
      sb.push(sectionTag)
      return i + 3 + offset
    }

    if (mark.startsWith('||/')) {
      if (j === i + 3 || mark.charAt(3) !== '&') {
        sb.push('||')
        return i + 3
      }
      const offset = handleEndMarker(mark.substring(4), sb)
      sb.push('||')
      return i + 4 + offset
    }

    // 到这说明小节线是"|"
    if (j === i + 1 || mark.charAt(1) !== '&') {
      sb.push('|')
      return i + 1
    }
    const offset = handleEndMarker(mark.substring(2), sb)
    sb.push('|')
    return i + 2 + offset
  }

  // 其它符号不作处理，直接追加
  sb.push(c)
  return ++i
}

/**
 * 处理结束标记（fine, dc, ds等）
 */
function handleEndMarker(str, sb) {
  let j = 0
  while (j < str.length) {
    const c = str.charAt(j)
    if (!(c !== '"' && c !== '[' && c !== ']')) break
    j++
  }

  const mark = str.substring(0, j)
  if (mark === 'fine') sb.push('!fine!')
  else if (mark === 'dc') sb.push('!D.C.!')
  else if (mark === 'ds') sb.push('!D.S.!')

  return j
}

/**
 * 处理音符修饰符
 * @param {string} target 音符字母
 * @param {string} modifierStr 修饰符字符串
 * @param {string[]} sb 目标字符串构建器
 * @param {ConverterContext} context 上下文对象
 */
function handleModifier(target, modifierStr, sb, context) {
  const split = target.split(/[A-Gz]/)
  if (split.length > 0) {
    target = target.substring(0, 1)
    modifierStr += split[1]
  }

  let prefix_1 = ''                               // 音符注释
  let prefix_2 = ''                               // 倚音
  let semitoneCnt = 0, restoreCnt = 0   // 升降半音修饰
  let octaveCnt = 0                             // 高低音修饰
  let numerator = 1, denominator = 1, doubling = 0   // 时值修饰
  let suffix_last = ''    // 延音/连音括号

  let idx = 0
  while (idx < modifierStr.length) {
    const modifier = modifierStr.charAt(idx)
    if (modifier === '#') {
      semitoneCnt++       // 升半音修饰
    } else if (modifier === '$') {
      semitoneCnt--       // 降半音修饰
    } else if (modifier === '=') {
      restoreCnt++        // 还原符
    } else if (modifier === '\'') {
      octaveCnt++         // 升八度修饰
    } else if (modifier === ',') {
      octaveCnt--         // 降八度修饰
    } else if (modifier === '.') {    // 附点音符
      numerator = numerator * 2 + 1   // 分子乘以2再加1
      denominator = denominator * 2   // 分母乘以2
    } else if (modifier === '/') {
      denominator *= 2    // 减时线 时值减半
    } else if (modifier === '-') {
      doubling++          // 增时线
    } else if (modifier === '(' || modifier === ')') {
      suffix_last += modifier       // 连音/延音
    } else if (modifier === '"') {  // 音符注释
      const endIdx = modifierStr.indexOf('"', idx + 1)
      prefix_1 = modifierStr.substring(idx, endIdx + 1)
      idx = endIdx
    } else if (modifier === '[') { // 倚音
      if (modifierStr.charAt(idx + 1) === 'h') {
        throw new Error('暂不支持后倚音转换')
      }
      const endIdx = modifierStr.indexOf(']', idx + 1)
      const appoggiatura = modifierStr.substring(idx + 1, endIdx)
      prefix_2 = '{' + handleAppoggiatura(appoggiatura, context.letterMap).replace(/ /g, '') + '}'
      idx = endIdx
    }
    idx++
  }

  // 处理升降半音修饰
  let prefix_3 = ''
  prefix_3 += '^'.repeat(Math.max(0, semitoneCnt))
  prefix_3 += '_'.repeat(Math.max(0, -semitoneCnt))
  if (restoreCnt > 0) prefix_3 = '='

  // 处理八度升降
  const suffix_1 = '\''.repeat(Math.max(0, octaveCnt)) + ','.repeat(Math.max(0, -octaveCnt))

  // 处理时值修饰
  numerator += denominator * doubling
  let suffix_2 = numerator + '/' + denominator
  if (numerator === 1 && denominator === 1) suffix_2 = ''
  else if (numerator === 1) suffix_2 = '/' + denominator
  else if (denominator === 1) suffix_2 = String(numerator)

  const res = prefix_1 + prefix_2 + prefix_3 + target + suffix_1 + suffix_2 + suffix_last + ' '
  context.tempSection += res

  context.sumTime = context.sumTime.add(new Fraction(numerator, denominator).mul(context.unit))

  if (context.sumTime.compare(context.mergeUnit) > 0) {
    sb.push(context.tempSection)
    context.sumTime = new Fraction(0)
    context.tempSection = ''
  } else if (context.sumTime.compare(context.mergeUnit) === 0) {
    sb.push(context.tempSection.replace(/ /g, '') + ' ')
    context.sumTime = new Fraction(0)
    context.tempSection = ''
  }
}

/**
 * 处理倚音
 */
function handleAppoggiatura(str, letterMap) {
  const sb = []
  let i = 0
  const n = str.length

  while (i < n) {
    const c = str.charAt(i)
    // 处理数字 0-7
    if (c >= '0' && c <= '7') {
      // 收集数字后的连续修饰符
      let j = i + 1
      let modifierStr = ''
      while (j < n && !END_MARKER.includes(str.charAt(j))) j++
      if (j > i + 1) modifierStr = str.substring(i + 1, j)

      // 转换数字和修饰符
      let target = letterMap.get(c)
      const split = target.split(/[A-Gz]/)
      if (split.length > 0) {
        target = target.substring(0, 1)
        modifierStr += split[1]
      }

      let semitoneCnt = 0, restoreCnt = 0   // 升降半音修饰
      let octaveCnt = 0                             // 高低音修饰
      let idx = 0

      while (idx < modifierStr.length) {
        const modifier = modifierStr.charAt(idx)
        if (modifier === '#') {
          semitoneCnt++         // 升半音修饰
        } else if (modifier === '$') {
          semitoneCnt--         // 降半音修饰
        } else if (modifier === '=') {
          restoreCnt++          // 还原符
        } else if (modifier === '\'') {
          octaveCnt++           // 升八度修饰
        } else if (modifier === ',') {
          octaveCnt--           // 降八度修饰
        }
        idx++
      }

      // 处理升降半音修饰
      let prefix = ''
      prefix += '^'.repeat(Math.max(0, semitoneCnt))
      prefix += '_'.repeat(Math.max(0, -semitoneCnt))
      if (restoreCnt > 0) prefix = '='

      // 处理八度升降
      const suffix = '\''.repeat(Math.max(0, octaveCnt)) + ','.repeat(Math.max(0, -octaveCnt))
      sb.push(prefix + target + suffix)

      i = j
    } else {
      sb.push(c)
      i++
    }
  }

  return sb.join('')
}

export {
  convert as fqToAbcConvert
}