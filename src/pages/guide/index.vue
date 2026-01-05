<template>
  <view class="guide-container">
    <swiper 
      class="guide-swiper" 
      :current="currentIndex"
      @change="onSwiperChange"
      :indicator-dots="false"
      :autoplay="false"
      :circular="false"
    >
      <!-- 引导页1 -->
      <swiper-item>
        <view class="guide-page" style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);">
          <view class="guide-content">
            <view class="guide-icon">📚</view>
            <view class="guide-text-section">
              <text class="guide-title">海量课程</text>
              <text class="guide-desc">精选优质课程，满足你的学习需求</text>
            </view>
          </view>
        </view>
      </swiper-item>
      
      <!-- 引导页2 -->
      <swiper-item>
        <view class="guide-page" style="background: linear-gradient(135deg, #4ECDC4 0%, #7BDDD5 100%);">
          <view class="guide-content">
            <view class="guide-icon">👨‍🏫</view>
            <view class="guide-text-section">
              <text class="guide-title">名师指导</text>
              <text class="guide-desc">行业专家亲自授课，让学习更高效</text>
            </view>
          </view>
        </view>
      </swiper-item>
      
      <!-- 引导页3 -->
      <swiper-item>
        <view class="guide-page" style="background: linear-gradient(135deg, #A8E6CF 0%, #DCEDC1 100%);">
          <view class="guide-content">
            <view class="guide-icon">🎯</view>
            <view class="guide-text-section">
              <text class="guide-title">个性化学习</text>
              <text class="guide-desc">智能推荐，定制专属学习计划</text>
            </view>
          </view>
        </view>
      </swiper-item>
      
      <!-- 引导页4 -->
      <swiper-item>
        <view class="guide-page" style="background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);">
          <view class="guide-content">
            <view class="guide-icon">🚀</view>
            <view class="guide-text-section">
              <text class="guide-title">开启学习之旅</text>
              <text class="guide-desc">立即加入，开启你的进阶之路</text>
              <view class="start-button" @click="goToLogin">
                <text class="start-button-text">立即体验</text>
              </view>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>
    
    <!-- 指示器 -->
    <view class="indicator-container">
      <view 
        v-for="(item, index) in 4" 
        :key="index"
        :class="['indicator-dot', { 'indicator-active': currentIndex === index }]"
      ></view>
    </view>
    
    <!-- 跳过按钮 -->
    <view v-if="currentIndex < 3" class="skip-button" @click="goToLogin">
      <text class="skip-text">跳过</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentIndex = ref(0)

// 滑动切换
const onSwiperChange = (e: any) => {
  currentIndex.value = e.detail.current
}

// 进入登录页
const goToLogin = () => {
  uni.redirectTo({
    url: '/pages/login/index'
  })
}
</script>

<style scoped>
.guide-container {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.guide-swiper {
  width: 100%;
  height: 100%;
}

.guide-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.guide-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  text-align: left;
  gap: 60rpx;
}

.guide-icon {
  font-size: 100rpx;
  flex-shrink: 0;
}

.guide-text-section {
  display: flex;
  flex-direction: column;
}

.guide-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12rpx;
}

.guide-desc {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
  max-width: 500rpx;
  line-height: 1.5;
}

.start-button {
  margin-top: 24rpx;
  margin-left: 0;
  background-color: #ffffff;
  border-radius: 40rpx;
  padding: 16rpx 60rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.start-button-text {
  font-size: 24rpx;
  font-weight: bold;
  color: #007AFF;
}

.indicator-container {
  position: absolute;
  bottom: 32rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16rpx;
}

.indicator-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 6rpx;
  background-color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.indicator-active {
  width: 32rpx;
  background-color: #ffffff;
}

.skip-button {
  position: absolute;
  top: 24rpx;
  right: 32rpx;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 24rpx;
  padding: 8rpx 20rpx;
}

.skip-text {
  font-size: 20rpx;
  color: #ffffff;
}
</style>
