<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { Back, HomeFilled, WarningFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user.js'

const router = useRouter()
const userStore = useUserStore()

const handleGoBack = () => {
  const referrer = document.referrer || ''
  if (referrer.includes('/login')) {
    router.replace('/')
    return
  }
  // 否则返回上一页
  window.history.back()
}

const handleGoHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="error-container">
    <div class="error-card">
      <!-- 装饰图标 -->
      <div class="error-icon-wrapper">
        <span class="error-icon">🚫</span>
        <div class="error-icon-ring"></div>
      </div>

      <h1 class="error-code">403</h1>
      <h2 class="error-title">无权限访问</h2>
      <p class="error-desc">
        抱歉，您没有访问此页面的权限<br />
        如需开通，请联系管理员申请相应权限
      </p>

      <div class="error-actions">
        <el-button
            type="primary"
            size="large"
            @click="handleGoBack"
            style="min-width: 160px"
        >
          <el-icon><Back /></el-icon>
          返回上一页
        </el-button>
        <el-button
            size="large"
            @click="handleGoHome"
            style="min-width: 160px"
        >
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
      </div>

      <!-- 权限提示 -->
<!--      <div class="error-permission-hint" v-if="missingPermission">
        <el-icon><WarningFilled /></el-icon>
        <span>缺少权限：{{ missingPermission }}</span>
      </div>-->

      <p class="error-footer">
        如有疑问，请联系系统管理员
      </p>
    </div>
  </div>
</template>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-card {
  width: 480px;
  padding: 50px 40px 36px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* 顶部装饰线 */
.error-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #f59e0b, #f97316);
}

.error-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.error-icon {
  font-size: 64px;
  display: block;
  position: relative;
  z-index: 2;
}

.error-icon-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.12);
  z-index: 1;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.7;
  }
}

.error-code {
  font-size: 72px;
  font-weight: 700;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 24px;
  color: #303133;
  margin: 12px 0 8px;
  font-weight: 600;
}

.error-desc {
  font-size: 14px;
  color: #909399;
  margin: 0 0 28px;
  line-height: 1.8;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.error-actions .el-button {
  min-width: 160px;
}

.error-permission-hint {
  margin-top: 20px;
  padding: 10px 16px;
  background: #fef3c7;
  border-radius: 8px;
  font-size: 13px;
  color: #92400e;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.error-permission-hint .el-icon {
  font-size: 18px;
}

.error-footer {
  margin-top: 24px;
  font-size: 12px;
  color: #c0c4cc;
  user-select: none;
}
</style>