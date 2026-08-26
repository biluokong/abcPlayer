<script setup>
import { DocumentCopy, Loading } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { fqToAbcConvert } from '@/utils/converter/fqToAbc.js'
import { ElMessage } from 'element-plus'

// 番茄简谱文本
const fqText = ref('')
// ABC文本
const abcText = ref('')
// UI 状态
const isRendering = ref(false)

// 转换
async function convert() {
  const content = fqText.value.trim()
  if (!content) return
  isRendering.value = true
  abcText.value = fqToAbcConvert(content)
  console.log(abcText.value)
  isRendering.value = false
}

// 复制
function handleCopy() {
  navigator.clipboard.writeText(abcText.value)
  ElMessage.success('复制成功')
}


</script>

<template>
  <div class="container">
    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 左侧：番茄简谱编辑 -->
      <div class="panel left-panel">
        <div class="panel-header">
          <span class="panel-title">番茄简谱编辑器</span>
          <div class="buttons">
            <el-button size="small" type="success" @click="convert">
              转换
            </el-button>
          </div>
        </div>

        <div class="panel-body">
          <el-input
              v-model="fqText"
              style="width: 100%"
              :rows="25"
              type="textarea"
              placeholder="在这里输入ABC格式的乐谱..."
              resize="none"
          />
        </div>
      </div>

      <!-- 右侧：ABC谱 -->
      <div class="panel right-panel">
        <div class="panel-header">
          <span class="panel-title">ABC谱</span>
          <div class="buttons">
            <el-button size="small" type="success" @click="handleCopy">
              <el-icon>
                <DocumentCopy/>
              </el-icon>
              &nbsp;复制
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
          <div class="abc-box">{{ abcText }}</div>
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

.abc-box {
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.8;
  color: #303133;
  text-align: left;
}
</style>