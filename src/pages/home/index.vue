<template>
  <view class="home-container">
    <!-- 横屏布局 -->
    <view class="home-layout">
      <!-- 左侧导航栏 -->
      <view class="sidebar">
        <!-- 用户头像区域 - 点击跳转个人中心 -->
        <view class="user-avatar-section" @click="goToProfile">
          <view class="avatar">
            <text class="avatar-text">{{ userInitial }}</text>
          </view>
          <text class="user-name-sidebar">{{ userName }}</text>
        </view>
        
        <!-- 菜单列表 -->
        <view class="sidebar-menu">
          <view class="menu-item-sidebar active">
            <text class="menu-icon-sidebar">🏠</text>
            <text class="menu-text-sidebar">首页</text>
          </view>
          <view class="menu-item-sidebar" @click="goToStoryList">
            <text class="menu-icon-sidebar">📝</text>
            <text class="menu-text-sidebar">我的作品</text>
          </view>
          <view class="menu-item-sidebar" @click="goToArticle('register')">
            <text class="menu-icon-sidebar">📋</text>
            <text class="menu-text-sidebar">注册协议</text>
          </view>
          <view class="menu-item-sidebar" @click="goToArticle('privacy')">
            <text class="menu-icon-sidebar">🔐</text>
            <text class="menu-text-sidebar">隐私协议</text>
          </view>
          <view class="menu-item-sidebar">
            <text class="menu-icon-sidebar">📚</text>
            <text class="menu-text-sidebar">我的课程</text>
          </view>
        </view>
        
        <!-- 底部设置 -->
        <view class="sidebar-footer">
          <view class="menu-item-sidebar" @click="goToProfile">
            <text class="menu-icon-sidebar">⚙️</text>
            <text class="menu-text-sidebar">个人中心</text>
          </view>
        </view>
      </view>
      
      <!-- 右侧主内容区域 -->
      <scroll-view class="main-content" scroll-y :show-scrollbar="false">
        <!-- 顶部欢迎区域 -->
        <view class="welcome-banner">
          <view class="welcome-info">
            <text class="welcome-title">欢迎使用 eBoom</text>
            <text class="welcome-subtitle">开启你的学习之旅</text>
          </view>
          <view class="welcome-decoration">📖</view>
        </view>
        
        <!-- 快捷功能 -->
        <view class="quick-actions">
          <view class="quick-action-item">
            <view class="quick-icon" style="background-color: #FF6B6B;">📊</view>
            <text class="quick-text">学习记录</text>
          </view>
          <view class="quick-action-item">
            <view class="quick-icon" style="background-color: #4ECDC4;">🎯</view>
            <text class="quick-text">学习目标</text>
          </view>
          <view class="quick-action-item">
            <view class="quick-icon" style="background-color: #FFE66D;">🏆</view>
            <text class="quick-text">我的成就</text>
          </view>
          <view class="quick-action-item">
            <view class="quick-icon" style="background-color: #A8E6CF;">💬</view>
            <text class="quick-text">学习社区</text>
          </view>
        </view>
        
        <!-- 推荐课程 -->
        <view class="course-section">
          <view class="section-header">
            <text class="section-title">推荐课程</text>
            <text class="section-more">查看更多 ></text>
          </view>
          <view class="course-grid">
            <view class="course-card" v-for="i in 4" :key="i">
              <view class="course-cover">
                <text class="course-cover-text">课程{{ i }}</text>
              </view>
              <view class="course-info">
                <text class="course-name">精品课程{{ i }}</text>
                <text class="course-desc">专业老师授课</text>
                <view class="course-meta">
                  <text class="course-price">¥99</text>
                  <text class="course-students">1234人</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { API_CONFIG, STORAGE_KEYS } from '@/config'

const userName = ref('用户')
const userRank = ref('')

// 用户首字母
const userInitial = computed(() => {
  return userName.value ? userName.value.substring(0, 1) : 'U'
})

// 跳转文章页面
const goToArticle = (type: 'register' | 'privacy') => {
  const articleID = type === 'register' 
    ? API_CONFIG.ARTICLE_IDS.REGISTER_ARTICLE 
    : API_CONFIG.ARTICLE_IDS.PRIVACY_ARTICLE
  
  uni.navigateTo({
    url: `/pages/article/index?articleID=${articleID}`
  })
}

// 跳转个人中心
const goToProfile = () => {
  uni.navigateTo({
    url: '/pages/profile/index'
  })
}

// 跳转我的作品列表
const goToStoryList = () => {
  uni.navigateTo({
    url: '/pages/story/list'
  })
}

onMounted(() => {
  // 可以从本地存储获取用户信息
  const memberID = uni.getStorageSync(STORAGE_KEYS.MEMBER_ID)
  if (memberID) {
    console.log('User logged in:', memberID)
  }
})
</script>

<style scoped>
.home-container {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
}

.home-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

/* 左侧导航栏 */
.sidebar {
  width: 100srpx;
  height: 100%;
  background: linear-gradient(180deg, #007AFF 0%, #5856D6 100%);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.user-avatar-section {
  padding: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.2);
}

.avatar {
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-text {
  font-size: 16rpx;
  font-weight: bold;
  color: #ffffff;
}

.user-name-sidebar {
  font-size: 18rpx;
  color: #ffffff;
  margin-top: 8rpx;
  text-align: center;
}

.sidebar-menu {
  flex: 1;
  padding: 12rpx 0;
  overflow-y: auto;
}

.menu-item-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx;
  margin: 4rpx 12rpx;
  border-radius: 8rpx;
  transition: background-color 0.3s;
}

.menu-item-sidebar.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.menu-icon-sidebar {
  font-size: 24rpx;
}

.menu-text-sidebar {
  font-size: 12rpx;
  color: #ffffff;
  margin-top: 4rpx;
  text-align: center;
}

.sidebar-footer {
  padding: 10rpx 0;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
}

/* 右侧主内容 */
.main-content {
  flex: 1;
  height: 100%;
  padding: 16rpx 24rpx;
  box-sizing: border-box;
}

.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12rpx;
  padding: 20rpx 28rpx;
  margin-bottom: 16rpx;
}

.welcome-info {
  display: flex;
  flex-direction: column;
}

.welcome-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #ffffff;
}

.welcome-subtitle {
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4rpx;
}

.welcome-decoration {
  font-size: 56rpx;
  opacity: 0.8;
}

/* 快捷功能 */
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  margin-bottom: 16rpx;
}

.quick-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 120rpx;
}

.quick-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28rpx;
}

.quick-text {
  font-size: 18rpx;
  color: #666666;
  margin-top: 8rpx;
}

/* 课程区域 */
.course-section {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.section-title {
  font-size: 22rpx;
  font-weight: bold;
  color: #333333;
}

.section-more {
  font-size: 18rpx;
  color: #007AFF;
}

.course-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.course-card {
  width: calc(25% - 9rpx);
  min-width: 180rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
  overflow: hidden;
}

.course-cover {
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.course-cover-text {
  font-size: 20rpx;
  color: #ffffff;
  font-weight: bold;
}

.course-info {
  padding: 10rpx;
}

.course-name {
  display: block;
  font-size: 20rpx;
  font-weight: bold;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-desc {
  display: block;
  font-size: 16rpx;
  color: #999999;
  margin-top: 4rpx;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6rpx;
}

.course-price {
  font-size: 20rpx;
  font-weight: bold;
  color: #FF3B30;
}

.course-students {
  font-size: 14rpx;
  color: #999999;
}
</style>
