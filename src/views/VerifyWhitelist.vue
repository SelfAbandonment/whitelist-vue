<template>
  <div class="page-container">
    <div class="card card-narrow">
      <div v-if="loading" class="state-container">
        <el-icon class="icon-large icon-primary loading-icon">
          <Loading/>
        </el-icon>
        <span>正在验证...</span>
      </div>

      <div v-else-if="error" class="state-container">
        <el-icon class="icon-large icon-error">
          <Warning/>
        </el-icon>
        <span>{{ error }}</span>
        <el-button type="primary" @click="retryVerify">重试</el-button>
      </div>

      <div v-else-if="redirectToQuiz" class="state-container">
        <el-icon class="icon-large icon-info">
          <InfoFilled/>
        </el-icon>
        <span>请先完成白名单验证题目</span>
        <el-button type="primary" @click="goToQuiz">前往答题</el-button>
      </div>

      <div v-else-if="success" class="state-container">
        <el-icon class="icon-large icon-success">
          <CircleCheck/>
        </el-icon>
        <span>验证成功!</span>
        <p class="success-message">{{ successMessage }}</p>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {CircleCheck, InfoFilled, Loading, Warning} from '@element-plus/icons-vue'
import axios from 'axios'
import {addIPToHeaders} from '../utils/ipUtils'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref(null)
const success = ref(false)
const successMessage = ref('')
const redirectToQuiz = ref(false)

const verifyCode = async () => {
  const code = route.query.code
  if (!code) {
    error.value = '验证码不能为空'
    loading.value = false
    return
  }

  try {
    // 使用封装的IP工具函数获取请求头
    const headers = await addIPToHeaders({
      'Content-Type': 'application/json'
    })

    // 确保API URL使用HTTPS
    const apiUrl = import.meta.env.VITE_API_URL || ''

    // 首先检查是否有问卷题目
    try {
      const questionsRes = await axios.get(`${apiUrl}/api/v1/getQuestions`, {
        params: {code: code.value},
        headers,
        withCredentials: true
      })

      // 如果有问卷题目且非空，检查是否已完成
      if (questionsRes.data.code === 200 &&
          questionsRes.data.data &&
          Array.isArray(questionsRes.data.data) &&
          questionsRes.data.data.length > 0) {

        console.log('检测到问卷题目，检查是否已完成问卷')

        // 检查问卷状态
        try {
          const quizStatusRes = await axios.get(`${apiUrl}/api/v1/checkQuizStatus`, {
            params: {code},
            headers,
            withCredentials: true
          })

          // 如果状态检查返回未完成问卷，重定向到问卷页面
          if (quizStatusRes.data.code === 200 && quizStatusRes.data.msg === "未完成问卷") {
            console.log('问卷未完成，重定向到问卷页面')
            redirectToQuiz.value = true
            loading.value = false
            return
          }
        } catch (statusErr) {
          console.warn('获取问卷状态失败，假设问卷未完成:', statusErr)
          redirectToQuiz.value = true
          loading.value = false
          return
        }
      } else {
        console.log('无问卷题目或题目为空，直接进行验证')
      }

      // 没有问卷或已完成问卷，继续验证
      const res = await axios.get(`${apiUrl}/mc/whitelist/verify`, {
        params: {code},
        headers,
        withCredentials: true
      })

      if (res.data.code === 200) {
        success.value = true
        successMessage.value = res.data.msg || '验证成功,请等待管理员审核!'
      } else {
        error.value = res.data.msg || '验证失败'
      }
    } catch (err) {
      console.warn('获取问卷题目失败，尝试直接验证:', err)

      // 获取问卷题目失败，继续验证流程
      try {
        const res = await axios.get(`${apiUrl}/mc/whitelist/verify`, {
          params: {code},
          headers,
          withCredentials: true
        })

        if (res.data.code === 200) {
          success.value = true
          successMessage.value = res.data.msg || '验证成功,请等待管理员审核!'
        } else {
          error.value = res.data.msg || '验证失败'
        }
      } catch (verifyErr) {
        console.error('验证请求失败:', verifyErr)
        if (verifyErr.message && verifyErr.message.includes('Network Error')) {
          error.value = '网络连接错误，请检查网络设置或联系管理员'
        } else if (verifyErr.message && verifyErr.message.includes('CORS')) {
          error.value = '跨域请求错误，请联系管理员配置服务器访问权限'
        } else {
          error.value = '验证过程中出现错误,请稍后重试'
        }
      }
    }
  } catch (err) {
    console.error('验证过程中出现错误:', err)
    if (err.message && err.message.includes('Network Error')) {
      error.value = '网络连接错误，请检查网络设置或联系管理员'
    } else if (err.message && err.message.includes('CORS')) {
      error.value = '跨域请求错误，请联系管理员配置服务器访问权限'
    } else {
      error.value = '验证过程中出现错误,请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

const goToQuiz = () => {
  router.push({
    path: '/quiz',
    query: {code: route.query.code}
  })
}

const retryVerify = () => {
  loading.value = true
  error.value = null
  success.value = false
  redirectToQuiz.value = false
  verifyCode()
}

onMounted(() => {
  verifyCode()
})
</script>

<style scoped>
.success-message {
  color: var(--theme-text);
  margin: 16px 0;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-button) {
  font-family: 'CustomFont', sans-serif;
}
</style> 