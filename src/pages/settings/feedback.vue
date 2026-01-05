<template>
  <view class="feedback-container">
    <!-- 横屏布局 -->
    <view class="feedback-layout">
      <!-- 左侧导航栏 -->
      <view class="sidebar">
        <!-- 返回按钮 -->
        <view class="back-section" @click="goBack">
          <text class="back-icon">←</text>
          <text class="back-text">返回</text>
        </view>
        
        <!-- 菜单 -->
        <view class="sidebar-menu">
          <view 
            :class="['menu-item-sidebar', { active: currentTab === 'submit' }]"
            @click="currentTab = 'submit'"
          >
            <text class="menu-icon-sidebar">📝</text>
            <text class="menu-text-sidebar">提交反馈</text>
          </view>
          <view 
            :class="['menu-item-sidebar', { active: currentTab === 'list' }]"
            @click="switchToList"
          >
            <text class="menu-icon-sidebar">📋</text>
            <text class="menu-text-sidebar">我的反馈</text>
          </view>
        </view>
      </view>
      
      <!-- 右侧主内容区域 -->
      <scroll-view 
        class="main-content" 
        scroll-y 
        :show-scrollbar="false"
        @scrolltolower="loadMore"
      >
        <!-- 提交反馈 -->
        <view class="content-wrapper" v-if="currentTab === 'submit'">
          <view class="page-header">
            <text class="page-title">提交反馈</text>
            <text class="page-subtitle">您的意见对我们很重要</text>
          </view>
          
          <!-- 反馈表单 -->
          <view class="form-section">
            <view class="form-item">
              <view class="form-label">
                <text class="label-text">标题</text>
                <text class="label-required">*</text>
              </view>
              <view class="input-wrapper">
                <input 
                  class="form-input"
                  type="text"
                  v-model="formData.title"
                  placeholder="请输入反馈标题"
                  maxlength="50"
                />
              </view>
            </view>
            
            <view class="form-item">
              <view class="form-label">
                <text class="label-text">图片（可选）</text>
                <text class="label-hint">最多3张</text>
              </view>
              <view class="image-upload-wrapper">
                <view class="image-list">
                  <view 
                    class="image-item" 
                    v-for="(img, index) in formData.images" 
                    :key="index"
                  >
                    <image :src="img" class="preview-image" mode="aspectFill" />
                    <view class="remove-btn" @click="removeImage(index)">
                      <text class="remove-icon">×</text>
                    </view>
                  </view>
                  <view 
                    class="add-image-btn" 
                    v-if="formData.images.length < 3"
                    @click="chooseImage"
                  >
                    <text class="add-icon">+</text>
                    <text class="add-text">添加图片</text>
                  </view>
                </view>
              </view>
            </view>
            
            <view class="submit-section">
              <view 
                class="submit-btn" 
                :class="{ disabled: isSubmitting }"
                @click="submitFeedback"
              >
                <text class="submit-text">{{ isSubmitting ? '提交中...' : '提交反馈' }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 我的反馈列表 -->
        <view class="content-wrapper" v-else>
          <view class="page-header">
            <text class="page-title">我的反馈</text>
            <text class="page-subtitle">共 {{ total }} 条反馈</text>
          </view>
          
          <!-- 反馈列表 -->
          <view class="feedback-list" v-if="feedbackList.length > 0">
            <view 
              class="feedback-item" 
              v-for="item in feedbackList" 
              :key="item.feedID"
            >
              <view class="feedback-header">
                <text class="feedback-title">{{ item.title || item.name }}</text>
                <text class="feedback-time">{{ item.submitTimeStr }}</text>
              </view>
              
              <!-- 附件图片 -->
              <view class="feedback-images" v-if="item.attachmentList && item.attachmentList.length > 0">
                <image 
                  v-for="(img, idx) in item.attachmentList" 
                  :key="idx"
                  :src="img"
                  class="feedback-image"
                  mode="aspectFill"
                  @click="previewImage(item.attachmentList, idx)"
                />
              </view>
              
              <!-- 回复信息 -->
              <view class="feedback-reply" v-if="item.lastFeedBack">
                <view class="reply-header">
                  <text class="reply-label">官方回复</text>
                  <text class="reply-time">{{ item.lastFeedBackTimeStr }}</text>
                </view>
                <text class="reply-content">{{ item.lastFeedBack }}</text>
              </view>
              <view class="no-reply" v-else>
                <text class="no-reply-text">暂无回复</text>
              </view>
            </view>
          </view>
          
          <!-- 空状态 -->
          <view class="empty-state" v-else-if="!isLoading">
            <text class="empty-icon">📭</text>
            <text class="empty-text">暂无反馈记录</text>
          </view>
          
          <!-- 加载状态 -->
          <view class="loading-more" v-if="isLoading">
            <text class="loading-text">加载中...</text>
          </view>
          
          <!-- 没有更多 -->
          <view class="no-more" v-if="!hasNextPage && feedbackList.length > 0 && !isLoading">
            <text class="no-more-text">— 没有更多了 —</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { api } from '@/utils/request'
import { storage } from '@/utils/storage'
import { chooseAndUploadImage } from '@/utils/upload'

// 当前Tab
const currentTab = ref<'submit' | 'list'>('submit')

// 表单数据
const formData = reactive({
  title: '',
  images: [] as string[]
})

// 列表数据
interface FeedbackItem {
  feedID: string
  title: string
  name: string
  content: string
  submitTimeStr: string
  attachmentList: string[]
  lastFeedBack: string | null
  lastFeedBackTimeStr: string | null
}

const feedbackList = ref<FeedbackItem[]>([])
const currentPage = ref(1)
const pageNumber = ref(10)
const total = ref(0)
const hasNextPage = ref(false)
const isLoading = ref(false)
const isSubmitting = ref(false)

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/settings/index' })
    }
  })
}

// 选择图片
const chooseImage = async () => {
  try {
    const urls = await chooseAndUploadImage(3 - formData.images.length)
    if (urls.length > 0) {
      formData.images.push(...urls)
    }
  } catch (error) {
    console.error('选择图片失败:', error)
  }
}

// 移除图片
const removeImage = (index: number) => {
  formData.images.splice(index, 1)
}

// 提交反馈
const submitFeedback = async () => {
  if (!formData.title.trim()) {
    uni.showToast({ title: '请输入反馈标题', icon: 'none' })
    return
  }
  
  const sessionID = storage.getSessionID()
  if (!sessionID) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  
  isSubmitting.value = true
  
  try {
    await api.submitFeed({
      sessionID,
      title: formData.title,
      attachmentList: formData.images.join(',')
    })
    
    uni.showToast({ title: '提交成功', icon: 'success' })
    
    // 重置表单
    formData.title = ''
    formData.images = []
    
    // 切换到列表并刷新
    currentTab.value = 'list'
    fetchFeedbackList(true)
  } catch (error) {
    console.error('提交反馈失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

// 切换到列表
const switchToList = () => {
  currentTab.value = 'list'
  if (feedbackList.value.length === 0) {
    fetchFeedbackList(true)
  }
}

// 获取反馈列表
const fetchFeedbackList = async (isRefresh = false) => {
  if (isLoading.value) return
  
  const sessionID = storage.getSessionID()
  if (!sessionID) return
  
  if (isRefresh) {
    currentPage.value = 1
    feedbackList.value = []
  }
  
  isLoading.value = true
  
  try {
    const result = await api.getMyFeedList({
      sessionID,
      currentPage: currentPage.value,
      pageNumber: pageNumber.value
    })
    
    if (result.data) {
      if (isRefresh) {
        feedbackList.value = result.data.rows || []
      } else {
        feedbackList.value = [...feedbackList.value, ...(result.data.rows || [])]
      }
      
      total.value = result.data.total || 0
      hasNextPage.value = result.data.hasNextPage || false
    }
  } catch (error) {
    console.error('获取反馈列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (currentTab.value !== 'list' || !hasNextPage.value || isLoading.value) return
  currentPage.value++
  fetchFeedbackList()
}

// 预览图片
const previewImage = (images: string[], index: number) => {
  uni.previewImage({
    urls: images,
    current: index
  })
}

onMounted(() => {
  // 默认显示提交页面
})
</script>

<style scoped>
.feedback-container {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
}

.feedback-layout {
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
  margin-bottom: 16rpx;
}

.page-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.page-subtitle {
  display: block;
  font-size: 14rpx;
  color: #999999;
  margin-top: 4rpx;
}

/* 表单样式 */
.form-section {
  background-color: #f9f9f9;
  border-radius: 12rpx;
  padding: 16rpx;
}

.form-item {
  margin-bottom: 16rpx;
}

.form-label {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.label-text {
  font-size: 16rpx;
  font-weight: bold;
  color: #333333;
}

.label-required {
  font-size: 16rpx;
  color: #FF3B30;
  margin-left: 4rpx;
}

.label-hint {
  font-size: 12rpx;
  color: #999999;
  margin-left: 8rpx;
}

.input-wrapper {
  background-color: #ffffff;
  border-radius: 8rpx;
  padding: 0 16rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
}

.form-input {
  flex: 1;
  font-size: 16rpx;
  color: #333333;
}

/* 图片上传 */
.image-upload-wrapper {
  margin-top: 8rpx;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.image-item {
  position: relative;
  width: 80rpx;
  height: 80rpx;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.remove-btn {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 24rpx;
  height: 24rpx;
  background-color: #FF3B30;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-icon {
  font-size: 16rpx;
  color: #ffffff;
}

.add-image-btn {
  width: 80rpx;
  height: 80rpx;
  background-color: #ffffff;
  border: 2rpx dashed #cccccc;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 24rpx;
  color: #999999;
}

.add-text {
  font-size: 10rpx;
  color: #999999;
  margin-top: 4rpx;
}

/* 提交按钮 */
.submit-section {
  margin-top: 24rpx;
}

.submit-btn {
  height: 48rpx;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn.disabled {
  opacity: 0.6;
}

.submit-text {
  font-size: 18rpx;
  font-weight: bold;
  color: #ffffff;
}

/* 反馈列表 */
.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.feedback-item {
  background-color: #f9f9f9;
  border-radius: 12rpx;
  padding: 16rpx;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.feedback-title {
  font-size: 18rpx;
  font-weight: bold;
  color: #333333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feedback-time {
  font-size: 12rpx;
  color: #999999;
  margin-left: 12rpx;
}

.feedback-images {
  display: flex;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.feedback-image {
  width: 60rpx;
  height: 60rpx;
  border-radius: 6rpx;
}

.feedback-reply {
  background-color: #E8F5E9;
  border-radius: 8rpx;
  padding: 12rpx;
  margin-top: 8rpx;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6rpx;
}

.reply-label {
  font-size: 12rpx;
  color: #4CAF50;
  font-weight: bold;
}

.reply-time {
  font-size: 10rpx;
  color: #999999;
}

.reply-content {
  font-size: 14rpx;
  color: #333333;
  line-height: 1.4;
}

.no-reply {
  margin-top: 8rpx;
  padding: 8rpx;
  background-color: #f0f0f0;
  border-radius: 6rpx;
}

.no-reply-text {
  font-size: 12rpx;
  color: #999999;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.empty-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.empty-text {
  font-size: 16rpx;
  color: #999999;
}

/* 加载状态 */
.loading-more {
  display: flex;
  justify-content: center;
  padding: 20rpx 0;
}

.loading-text {
  font-size: 14rpx;
  color: #999999;
}

/* 没有更多 */
.no-more {
  display: flex;
  justify-content: center;
  padding: 20rpx 0;
}

.no-more-text {
  font-size: 12rpx;
  color: #cccccc;
}
</style>
