<template>
  <view class="about-container">
    <!-- 横屏布局 -->
    <view class="about-layout">
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
            <text class="menu-icon-sidebar">ℹ️</text>
            <text class="menu-text-sidebar">关于我们</text>
          </view>
        </view>
      </view>
      
      <!-- 右侧主内容区域 -->
      <scroll-view class="main-content" scroll-y :show-scrollbar="false">
        <view class="content-wrapper">
          <!-- Logo区域 -->
          <view class="logo-section">
            <image class="app-logo" src="/static/logo.png" mode="aspectFit" />
            <text class="app-name">eBoom英语</text>
          </view>
          
          <!-- 关于内容 -->
          <view class="about-content" v-if="!isLoading">
            <rich-text :nodes="aboutContent" class="rich-text-content"></rich-text>
          </view>
          
          <view class="loading-state" v-else>
            <text class="loading-text">加载中...</text>
          </view>
          
          <!-- 版本信息 -->
          <view class="version-section">
            <text class="version-text">版本号：{{ APP_VERSION }}</text>
            <text class="version-date">发布日期：{{ APP_RELEASE_DATE }}</text>
            
            <view class="update-btn" @click="checkVersion">
              <text class="update-btn-text">{{ isChecking ? '检查中...' : '检查新版本' }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 更新提示弹窗 -->
    <view class="modal-overlay" v-if="showUpdateModal">
      <view class="modal-backdrop" @click="showUpdateModal = false"></view>
      <view class="modal-content">
        <text class="modal-title">发现新版本</text>
        <text class="modal-version">版本 {{ newVersion.code }}</text>
        <view class="modal-desc">
          <text class="desc-text">{{ newVersion.description || newVersion.tipsUpgrade || '有新版本可用，建议更新' }}</text>
        </view>
        <view class="modal-actions">
          <view class="modal-btn cancel-btn" @click="showUpdateModal = false">
            <text class="modal-btn-text">稍后再说</text>
          </view>
          <view class="modal-btn confirm-btn" @click="downloadUpdate">
            <text class="modal-btn-text">立即更新</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/utils/request'
import { API_CONFIG } from '@/config'

// 当前App版本（写死在代码里）
const APP_VERSION = '0.1'
const APP_RELEASE_DATE = '2026-01-05'

// 关于我们文章ID
const ABOUT_ARTICLE_ID = 'ff8080819b54efc0019b5e545cb901e1'

// 状态
const isLoading = ref(true)
const isChecking = ref(false)
const aboutContent = ref('')
const showUpdateModal = ref(false)

const newVersion = ref({
  code: '',
  description: '',
  tipsUpgrade: '',
  fileURL: ''
})

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/settings/index' })
    }
  })
}

// 获取关于我们内容
const fetchAboutContent = async () => {
  isLoading.value = true
  try {
    const result = await api.getArticleSimpleDetail(ABOUT_ARTICLE_ID)
    if (result.apiArticleDto) {
      aboutContent.value = result.apiArticleDto.contentText || ''
    }
  } catch (error) {
    console.error('获取关于我们内容失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 检查版本
const checkVersion = async () => {
  if (isChecking.value) return
  
  isChecking.value = true
  
  try {
    const result = await api.getVersionDetail({
      siteID: API_CONFIG.SITE_ID
    })
    
    if (result.data) {
      const serverVersion = result.data.code
      
      // 比较版本号
      if (compareVersion(serverVersion, APP_VERSION) > 0) {
        // 服务器版本更新
        newVersion.value = {
          code: result.data.code,
          description: result.data.description || '',
          tipsUpgrade: result.data.tipsUpgrade || '',
          fileURL: result.data.fileURL || ''
        }
        showUpdateModal.value = true
      } else {
        uni.showToast({
          title: '已是最新版本',
          icon: 'success'
        })
      }
    }
  } catch (error) {
    console.error('检查版本失败:', error)
  } finally {
    isChecking.value = false
  }
}

// 比较版本号（返回 1: a>b, 0: a=b, -1: a<b）
const compareVersion = (a: string, b: string): number => {
  const partsA = a.split('.').map(Number)
  const partsB = b.split('.').map(Number)
  
  const len = Math.max(partsA.length, partsB.length)
  
  for (let i = 0; i < len; i++) {
    const numA = partsA[i] || 0
    const numB = partsB[i] || 0
    
    if (numA > numB) return 1
    if (numA < numB) return -1
  }
  
  return 0
}

// 下载更新
const downloadUpdate = () => {
  if (!newVersion.value.fileURL) {
    uni.showToast({
      title: '暂无下载链接',
      icon: 'none'
    })
    return
  }
  
  // #ifdef APP-PLUS
  uni.showLoading({ title: '下载中...' })
  
  plus.runtime.openURL(newVersion.value.fileURL, (err) => {
    uni.hideLoading()
    if (err) {
      uni.showToast({
        title: '打开下载链接失败',
        icon: 'none'
      })
    }
  })
  // #endif
  
  // #ifndef APP-PLUS
  uni.showToast({
    title: '请在App中更新',
    icon: 'none'
  })
  // #endif
  
  showUpdateModal.value = false
}

onMounted(() => {
  fetchAboutContent()
})
</script>

<style scoped>
.about-container {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
}

.about-layout {
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
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* Logo区域 */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
}

.app-logo {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
}

.app-name {
  font-size: 24rpx;
  font-weight: bold;
  color: #333333;
  margin-top: 12rpx;
}

/* 关于内容 */
.about-content {
  flex: 1;
  padding: 16rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  margin: 16rpx 0;
}

.rich-text-content {
  font-size: 16rpx;
  line-height: 1.6;
  color: #666666;
}

.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  font-size: 16rpx;
  color: #999999;
}

/* 版本信息 */
.version-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  border-top: 1rpx solid #f0f0f0;
}

.version-text {
  font-size: 14rpx;
  color: #999999;
}

.version-date {
  font-size: 12rpx;
  color: #cccccc;
  margin-top: 4rpx;
}

.update-btn {
  margin-top: 16rpx;
  padding: 10rpx 32rpx;
  background-color: #007AFF;
  border-radius: 20rpx;
}

.update-btn-text {
  font-size: 14rpx;
  color: #ffffff;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.modal-content {
  position: relative;
  width: 70%;
  max-width: 400rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  z-index: 2;
}

.modal-title {
  display: block;
  font-size: 22rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
}

.modal-version {
  display: block;
  font-size: 16rpx;
  color: #007AFF;
  text-align: center;
  margin-top: 8rpx;
}

.modal-desc {
  margin: 16rpx 0;
  padding: 12rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
  max-height: 120rpx;
  overflow-y: auto;
}

.desc-text {
  font-size: 14rpx;
  color: #666666;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.modal-btn {
  flex: 1;
  height: 44rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  background-color: #f5f5f5;
}

.confirm-btn {
  background-color: #007AFF;
}

.modal-btn-text {
  font-size: 16rpx;
  font-weight: bold;
}

.cancel-btn .modal-btn-text {
  color: #666666;
}

.confirm-btn .modal-btn-text {
  color: #ffffff;
}
</style>
