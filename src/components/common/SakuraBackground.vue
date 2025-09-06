<template>
  <div v-if="shouldShowSakura" class="sakura-container">
    <span v-for="n in count"
          :key="n"
          :style="getSakuraStyle(n)"
          class="sakura">
    </span>
  </div>
</template>

<script setup>
import {computed} from 'vue'

const props = defineProps({
  count: {
    type: Number,
    default: 10
  },
  isDark: {
    type: Boolean,
    default: false
  },
  currentTheme: {
    type: String,
    default: 'default'
  }
})

// 只在默认主题和樱花主题显示樱花特效
const shouldShowSakura = computed(() => {
  return ['default', 'sakura'].includes(props.currentTheme)
})

// 优化性能：预计算樱花样式
const sakuraStyles = computed(() => {
  return Array(props.count).fill(null).map(() => ({
    '--delay': `${Math.random() * 5}s`,
    '--size': `${Math.random() * 20 + 10}px`,
    '--left': `${Math.random() * 100}%`,
    'opacity': props.isDark ? 0.3 : 0.7
  }))
})

const getSakuraStyle = (index) => sakuraStyles.value[index]
</script>

<style scoped>
/* 樱花背景样式已移至通用样式文件 */
</style>