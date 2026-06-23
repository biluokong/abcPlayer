<script setup>
import { ref } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const activeIndex = ref('0')
function handleSelect(key, keyPath) {
  console.log(key, keyPath)
}
</script>
<template>
  <el-config-provider :locale="zhCn">
    <el-header>
      <el-menu
          :default-active="activeIndex"
          class="el-menu-demo"
          mode="horizontal"
          :ellipsis="false"
          @select="handleSelect"
          router
      >
        <el-menu-item index="0">🎵 ABC谱播放器</el-menu-item>
        <el-sub-menu index="1">
          <template #title>简谱转ABC</template>
          <el-menu-item index="1-1">🍅番茄简谱</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>其他</template>
          <el-menu-item index="2-1">🕳️洞洞谱</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
    <el-footer>foot</el-footer>
  </el-config-provider>
</template>

<style lang="less" scoped>
.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}

.el-header {
  padding: 0;
  height: auto;
}

.el-main {
  padding: 0;
  overflow: hidden;
}

.el-footer {
  padding: 0;
  height: auto;
}
</style>