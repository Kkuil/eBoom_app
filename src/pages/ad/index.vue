<template>
  <view class="ad-container">
    <view class="ad-content">
      <view class="ad-layout">
        <!-- 左侧品牌区 -->
        <view class="ad-brand">
          <view class="ad-logo-icon">📚</view>
          <text class="ad-logo">eBoom</text>
        </view>
        <!-- 右侧广告区 -->
        <view class="ad-info">
          <text class="ad-slogan">专业的在线教育培训平台</text>
          <text class="ad-desc">海量优质课程 · 名师在线授课</text>
        </view>
      </view>
    </view>
    <view class="countdown-container" @click="skipAd">
      <text class="countdown-text">{{ countdown }}s 跳过</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 获取页面参数
const isFirst = ref('0')

// 倒计时
const countdown = ref(5)
let timer: number | null = null

// 跳过广告
const skipAd = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  navigateNext()
}

// 导航到下一页
const navigateNext = () => {
  if (isFirst.value === '1') {
    // 首次启动，跳转到引导页
    uni.redirectTo({
      url: '/pages/guide/index'
    })
  } else {
    // 非首次启动，检查登录状态
    const sessionID = uni.getStorageSync('sessionID')
    if (sessionID) {
      // 已登录，跳转首页
      uni.redirectTo({
        url: '/pages/home/index'
      })
    } else {
      // 未登录，跳转登录页
      uni.redirectTo({
        url: '/pages/login/index'
      })
    }
  }
}

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  if (currentPage && currentPage.options) {
    isFirst.value = currentPage.options.isFirst || '0'
  }
  
  // 开始倒计时
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
      navigateNext()
    }
  }, 1000) as unknown as number
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
.ad-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  position: relative;
  overflow: hidden;
}

.ad-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ad-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60rpx;
}

.ad-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ad-logo-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.ad-logo {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
}

.ad-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.ad-slogan {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
}

.ad-desc {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 16rpx;
}

.countdown-container {
  position: absolute;
  top: 24rpx;
  right: 32rpx;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 24rpx;
  padding: 8rpx 20rpx;
}

.countdown-text {
  font-size: 20rpx;
  color: #ffffff;
}
</style>
