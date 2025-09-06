<template>
  <div class="page-container gradient-bg">
    <h1 class="title-404">404</h1>
    <p class="text-white">页面不存在</p>
    <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
  </div>
</template>

<style scoped>
/* 404页面使用渐变背景，其他样式使用通用类 */

/* Element Plus 组件样式覆盖 */
:deep(.el-button) {
  font-family: 'CustomFont', sans-serif;
}
</style> 