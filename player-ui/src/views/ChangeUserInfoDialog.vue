<script setup>
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const userStore = useUserStore()

const formRef = ref(null)
const formData = ref({
  nickname: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const rules = {
  newPassword: [
    {
      validator: (rule, value, callback) => {
        if (value && value.length < 6) {
          callback(new Error('新密码长度不能少于6位'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    {
      validator: (rule, value, callback) => {
        if (value && value !== formData.value.newPassword) {
          callback(new Error('两次输入的新密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

const submitting = ref(false)
const messageText = ref('')
const messageType = ref('')

// 监听弹窗打开，回填昵称
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      const info = userStore.userInfo
      formData.value.nickname = info?.nickname || ''
      formData.value.oldPassword = ''
      formData.value.newPassword = ''
      formData.value.confirmPassword = ''
      messageText.value = ''
      messageType.value = ''
    }
  },
)

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  messageText.value = ''

  try {
    const result = await userStore.updateUserInfo({
      nickname: formData.value.nickname,
      oldPassword: formData.value.oldPassword,
      newPassword: formData.value.newPassword,
    })

    messageText.value = result.message || '修改成功'
    messageType.value = 'success'

    setTimeout(() => {
      handleClose()
      ElMessageBox.alert('修改成功，请重新登录', '提示', {
        confirmButtonText: '确定',
        callback: () => {
          window.location.href = '/login.html'
        },
      })
    }, 1500)
  } catch (error) {
    messageText.value = error.message || '修改失败'
    messageType.value = 'error'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="🔐 修改用户信息"
    width="480px"
    :close-on-click-modal="false"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="昵称">
        <el-input v-model="formData.nickname" placeholder="请输入昵称" />
      </el-form-item>

      <el-form-item label="旧密码">
        <el-input
          v-model="formData.oldPassword"
          type="password"
          placeholder="请输入旧密码"
          show-password
        />
      </el-form-item>

      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="formData.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
      </el-form-item>

      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </el-form-item>

      <el-alert
        v-if="messageText"
        :title="messageText"
        :type="messageType"
        :closable="false"
        style="margin-bottom: 16px"
      />

      <el-form-item>
        <div style="display: flex; gap: 10px; justify-content: flex-end; width: 100%">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            确认修改
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
