<script setup>
import router from '@/router/index.js'
import { ArrowDown } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 用户信息
const username = '碧落'

function handleSelect(key, keyPath) {
  router.push({ name: key })
}
</script>

<template>
  <div class="container">
    <el-header>
      <el-menu
          :default-active="route.name"
          class="el-menu-demo"
          mode="horizontal"
          :ellipsis="false"
          @select="handleSelect"
      >
        <el-menu-item index="home">🎵 ABC谱播放器</el-menu-item>
        <el-sub-menu index="convertAbc">
          <template #title>简谱转ABC</template>
          <el-menu-item index="fqConvertAbc">🍅番茄简谱</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="generate">
          <template #title>生成其它谱</template>
          <el-menu-item index="generateDdp">🕳️洞洞谱</el-menu-item>
        </el-sub-menu>

        <!-- 右侧用户信息 -->
        <div class="user-area">
          <el-dropdown trigger="click">
            <div class="user-info-trigger">
              <el-avatar :size="32" class="user-avatar">
                {{ username.charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="username-text">{{ username }}</span>
              <el-icon class="el-icon--right">
                <arrow-down/>
              </el-icon>
            </div>
          </el-dropdown>
        </div>
      </el-menu>
    </el-header>
    <el-main>
      <router-view/>
    </el-main>
    <el-footer>
      <div class="footer-content">
        <span>项目地址：<a href="https://github.com/your-repo/abc-player"
                          target="_blank">github.com/your-repo/abc-player</a></span>
        <el-divider direction="vertical"/>
        <span>交流群：ABC音乐播放器交流群 123456789</span>
      </div>
    </el-footer>
  </div>
</template>

<style lang="less" scoped>
.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.el-header {
  padding: 0;
  height: auto;
}

.el-main {
  padding: 0;
  overflow: hidden;
  height: auto;
}

.el-footer {
  padding: 0;
  height: 50px;

  .footer-content {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    font-size: 12px;
    color: #909399;
    background: rgba(255, 255, 255, 0.95);

    a {
      color: #409eff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.user-area {
  margin-left: auto;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.user-info-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  outline: none;

  .user-avatar {
    background: #409eff;
    color: #fff;
    font-size: 14px;
    font-weight: bold;
  }

  .username-text {
    margin-left: 8px;
    font-size: 14px;
    color: #303133;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
