<script setup>
import { ref } from 'vue'

const abcText = ref(`X:1
T:小星星
M:4/4
L:1/4
K:C
C C G G | A A G2 | F F E E | D D C2 |]
`)
</script>

<template>
  <div class="home-container">
    <el-input
        v-model="abcText"
        style="width: 45%"
        :rows="20"
        type="textarea"
        placeholder="在这里输入ABC格式的乐谱..."
    />
  </div>
</template>

<style lang="less" scoped>

</style>