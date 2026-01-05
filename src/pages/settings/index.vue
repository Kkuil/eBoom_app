<template>
  <view class="settings-container">
    <!-- 横屏布局 -->
    <view class="settings-layout">
      <!-- 左侧导航栏 -->
      <view class="sidebar">
        <!-- 返回按钮 -->
        <view class="back-section" @click="goBack">
          <text class="back-icon">←</text>
          <text class="back-text">返回</text>
        </view>
        
        <!-- 菜单 -->
        <view class="sidebar-menu">
          <view class="menu-item-sidebar active">
            <text class="menu-icon-sidebar">⚙️</text>
            <text class="menu-text-sidebar">设置</text>
          </view>
        </view>
      </view>
      
      <!-- 右侧主内容区域 -->
      <scroll-view class="main-content" scroll-y :show-scrollbar="false">
        <view class="content-wrapper">
          <!-- 页面标题 -->
          <view class="page-header">
            <text class="page-title">设置</text>
          </view>
          
          <!-- 功能菜单 -->
          <view class="menu-section">
            <view class="menu-list">
              <view class="menu-item" @click="goToAbout">
                <text class="menu-icon">ℹ️</text>
                <text class="menu-text">关于我们</text>
                <text class="menu-arrow">></text>
              </view>
              <view class="menu-item" @click="goToFAQ">
                <text class="menu-icon">❓</text>
                <text class="menu-text">常见问题</text>
                <text class="menu-arrow">></text>
              </view>
              <view class="menu-item" @click="goToFeedback">
                <text class="menu-icon">📝</text>
                <text class="menu-text">意见反馈</text>
                <text class="menu-arrow">></text>
              </view>
              <view class="menu-item" @click="goToArticle('register')">
                <text class="menu-icon">📋</text>
                <text class="menu-text">注册协议</text>
                <text class="menu-arrow">></text>
              </view>
              <view class="menu-item" @click="goToArticle('privacy')">
                <text class="menu-icon">🔐</text>
                <text class="menu-text">隐私协议</text>
                <text class="menu-arrow">></text>
              </view>
              <view class="menu-item" @click="contactService">
                <text class="menu-icon">📞</text>
                <text class="menu-text">联系客服</text>
                <text class="menu-arrow">></text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
const ARTICLE_IDS = {
  REGISTER_ARTICLE: 'ff8080819b54efc0019b5e5eb7f201e9',
  PRIVACY_ARTICLE: 'ff8080819b54efc0019b5e6080f701ea'
}

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/home/index' })
    }
  })
}

// 跳转关于我们
const goToAbout = () => {
  uni.navigateTo({ url: '/pages/settings/about' })
}

// 跳转常见问题
const goToFAQ = () => {
  uni.navigateTo({ url: '/pages/settings/faq' })
}

// 跳转意见反馈
const goToFeedback = () => {
  uni.navigateTo({ url: '/pages/settings/feedback' })
}

// 跳转文章页面
const goToArticle = (type: 'register' | 'privacy') => {
  const articleID = type === 'register' 
    ? ARTICLE_IDS.REGISTER_ARTICLE 
    : ARTICLE_IDS.PRIVACY_ARTICLE
  
  uni.navigateTo({
    url: `/pages/article/index?articleID=${articleID}`
  })
}

// 联系客服
const contactService = () => {
  uni.showModal({
    title: '联系客服',
    content: '客服电话：400-123-4567\n工作时间：周一至周五 9:00-18:00',
    showCancel: false
  })
}
</script>

<style scoped>
.settings-container {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
}

.settings-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

/* 左侧导航栏 */
.sidebar {
  width: 100rpx;
  height: 100%;
  background: linear-gradient(180deg, #007AFF 0%, #5856D6 100%);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.back-section {
  padding: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.2);
}

.back-icon {
  font-size: 24rpx;
  color: #ffffff;
}

.back-text {
  font-size: 12rpx;
  color: #ffffff;
  margin-top: 4rpx;
}

.sidebar-menu {
  flex: 1;
  padding: 12rpx 0;
}

.menu-item-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx;
  margin: 4rpx 8rpx;
  border-radius: 8rpx;
}

.menu-item-sidebar.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.menu-icon-sidebar {
  font-size: 24rpx;
}

.menu-text-sidebar {
  font-size: 10rpx;
  color: #ffffff;
  margin-top: 4rpx;
  text-align: center;
}

/* 右侧主内容 */
.main-content {
  flex: 1;
  height: 100%;
  background-color: #ffffff;
}

.content-wrapper {
  padding: 20rpx 32rpx;
}

.page-header {
  margin-bottom: 20rpx;
}

.page-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.menu-section {
  margin-top: 16rpx;
}

.menu-list {
  background-color: #f9f9f9;
  border-radius: 12rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 20rpx 16rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 24rpx;
  margin-right: 16rpx;
}

.menu-text {
  flex: 1;
  font-size: 18rpx;
  color: #333333;
}

.menu-arrow {
  font-size: 18rpx;
  color: #cccccc;
}
</style>
