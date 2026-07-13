<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import router from '@/router/index.js'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { ArrowDown, Lock, SwitchButton } from '@element-plus/icons-vue'
import { updateUserInfoApi } from '@/api/user.js'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const route = useRoute()

// 用户信息
const username = computed(() => userStore.userInfo?.nickname || userStore.userInfo?.username || '')

const canAccess = (menuName) => userStore.menuPermissions.includes(menuName)

function handleSelect(key, keyPath) {
  router.push({ name: key })
}

// 下拉菜单命令
const handleCommand = (command) => {
  if (command === 'changePassword') {
    passwordDialogVisible.value = true
  } else if (command === 'logout') {
    userStore.logout()
    router.push({ name: 'login' })
    ElMessage.success('已退出登录')
  }
}

// 修改密码弹窗
const passwordDialogVisible = ref(false)
const passwordFormRef = ref(null)
const passwordLoading = ref(false)

const passwordForm = reactive({
  oldPassword: null,
  newPassword: null,
  confirmPassword: null,
})

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

const handleChangePassword = async () => {
  const valid = await passwordFormRef.value.validate().catch(() => false)
  console.log(valid)
  if (!valid) return

  passwordLoading.value = true
  await updateUserInfoApi(passwordForm)
  ElMessage.success('密码修改成功，请重新登录')
  passwordDialogVisible.value = false
  userStore.logout()
  await router.push({ name: 'login' })
}

const closePasswordDialog = () => {
  passwordForm.oldPassword = null
  passwordForm.newPassword = null
  passwordForm.confirmPassword = null
  passwordFormRef.value?.resetFields()
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
          <el-menu-item v-if="canAccess('fqConvertAbc')" index="fqConvertAbc">🍅番茄简谱</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>其他</template>
          <el-menu-item index="2-1">🕳️洞洞谱</el-menu-item>
        </el-sub-menu>

        <!-- 右侧用户信息 -->
        <div class="user-area">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info-trigger">
              <el-avatar :size="32" class="user-avatar">
                {{ username.charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="username-text">{{ username }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="changePassword">
                  <el-icon><Lock /></el-icon>修改密码
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-menu>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
    <el-footer>
      <div class="footer-content">
        <span>项目地址：<a href="https://github.com/your-repo/abc-player" target="_blank">github.com/your-repo/abc-player</a></span>
        <el-divider direction="vertical" />
        <span>交流群：ABC音乐播放器交流群 123456789</span>
      </div>
    </el-footer>

    <!-- 修改密码弹窗 -->
    <el-dialog
        v-model="passwordDialogVisible"
        title="修改密码"
        width="420px"
        @closed="closePasswordDialog"
    >
      <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="80px"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="请输入旧密码"
              show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码（至少6位）"
              show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="passwordLoading" @click="handleChangePassword">
          确认修改
        </el-button>
      </template>
    </el-dialog>
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
