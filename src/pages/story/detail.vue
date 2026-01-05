<template>
  <view class="detail-container">
    <!-- 横屏布局 -->
    <view class="detail-layout">
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
            <text class="menu-icon-sidebar">👁️</text>
            <text class="menu-text-sidebar">作品详情</text>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="sidebar-footer">
          <view class="action-button" @click="goToEdit">
            <text class="action-icon">✏️</text>
            <text class="action-text">编辑</text>
          </view>
          <view class="action-button delete" @click="confirmDelete">
            <text class="action-icon">🗑️</text>
            <text class="action-text">删除</text>
          </view>
        </view>
      </view>
      
      <!-- 右侧主内容区域 -->
      <scroll-view class="main-content" scroll-y :show-scrollbar="false">
        <view class="content-wrapper" v-if="!isLoading && storyDetail">
          <!-- 作品头部 -->
          <view class="story-header">
            <text class="story-title">{{ storyDetail.name }}</text>
            <view class="story-meta">
              <text class="meta-item">👤 {{ storyDetail.memberName || '未知用户' }}</text>
              <text class="meta-item">📅 {{ formatDateTime(storyDetail.toldTimeStr) }}</text>
              <text :class="['status-badge', getStatusClass(storyDetail.approvedStatus)]">
                {{ getStatusText(storyDetail.approvedStatus) }}
              </text>
            </view>
          </view>
          
          <!-- 媒体内容区域 -->
          <view class="media-section" v-if="storyDetail.listImage || storyDetail.videoURL">
            <!-- 图片 -->
            <view class="image-wrapper" v-if="storyDetail.listImage && !storyDetail.videoURL">
              <image 
                :src="storyDetail.listImage" 
                class="story-image"
                mode="aspectFit"
              />
            </view>
            
            <!-- 视频 -->
            <view class="video-wrapper" v-if="storyDetail.videoURL">
              <video 
                :src="storyDetail.videoURL"
                class="story-video"
                controls
                :show-center-play-btn="true"
                :enable-play-gesture="true"
                :enable-progress-gesture="false"
                object-fit="contain"
                :page-gesture="false"
                :vslide-gesture="false"
              />
            </view>
          </view>
          
          <!-- 音频播放器 -->
          <view class="audio-section" v-if="storyDetail.soundURL">
            <view class="audio-player">
              <text class="audio-icon">🎵</text>
              <text class="audio-label">音频内容</text>
              <view class="audio-controls">
                <text class="play-btn" @click="toggleAudio">{{ isPlaying ? '⏸' : '▶️' }}</text>
              </view>
            </view>
          </view>
          
          <!-- 作品内容 -->
          <view class="content-section">
            <view class="section-title">
              <text class="title-icon">📄</text>
              <text class="title-text">作品内容</text>
            </view>
            <view class="content-body">
              <text class="content-text">{{ storyDetail.content || '暂无内容' }}</text>
            </view>
          </view>
          
          <!-- 统计信息 -->
          <view class="stats-section">
            <view class="stat-item">
              <text class="stat-value">{{ storyDetail.browseTimes || 0 }}</text>
              <text class="stat-label">浏览</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ storyDetail.praiseTotal || 0 }}</text>
              <text class="stat-label">点赞</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ storyDetail.collectTotal || 0 }}</text>
              <text class="stat-label">收藏</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ storyDetail.discussTotal || 0 }}</text>
              <text class="stat-label">评论</text>
            </view>
          </view>
          
          <!-- 附件列表 -->
          <view class="attachment-section" v-if="storyDetail.attachmentList && storyDetail.attachmentList.length > 0">
            <view class="section-title">
              <text class="title-icon">📎</text>
              <text class="title-text">附件</text>
            </view>
            <view class="attachment-list">
              <view 
                class="attachment-item" 
                v-for="(attachment, index) in storyDetail.attachmentList" 
                :key="index"
              >
                <text class="attachment-name">{{ attachment.name || '附件' + (index + 1) }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 加载状态 -->
        <view class="loading-state" v-if="isLoading">
          <text class="loading-icon">⏳</text>
          <text class="loading-text">加载中...</text>
        </view>
        
        <!-- 错误状态 -->
        <view class="error-state" v-if="!isLoading && !storyDetail">
          <text class="error-icon">❌</text>
          <text class="error-text">加载失败</text>
          <view class="retry-btn" @click="fetchDetail">
            <text class="retry-text">重新加载</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 删除确认弹窗 -->
    <view class="modal-overlay" v-if="showDeleteModal" @click="showDeleteModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">确认删除</text>
        <text class="modal-message">确定要删除作品「{{ storyDetail?.name }}」吗？</text>
        <view class="modal-actions">
          <view class="modal-btn cancel-btn" @click="showDeleteModal = false">
            <text class="modal-btn-text">取消</text>
          </view>
          <view class="modal-btn confirm-btn" @click="handleDelete">
            <text class="modal-btn-text">确定删除</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { request } from '@/utils/request'
import { STORAGE_KEYS } from '@/config'

// 作品详情数据类型
interface StoryDetail {
  storyID: string
  name: string
  content: string
  listImage: string
  videoURL: string
  soundURL: string
  memberName: string
  memberID: string
  toldTimeStr: string
  modifiedTimeStr: string
  approvedStatus: number
  browseTimes: number
  praiseTotal: number
  collectTotal: number
  discussTotal: number
  attachmentList: Array<{ name: string; url: string }>
}

// 数据状态
const storyID = ref('')
const storyDetail = ref<StoryDetail | null>(null)
const isLoading = ref(false)
const showDeleteModal = ref(false)

// 音频播放状态
const isPlaying = ref(false)
let audioContext: any = null

// 获取作品详情
const fetchDetail = async () => {
  if (!storyID.value) {
    uni.showToast({ title: '作品ID不存在', icon: 'none' })
    return
  }
  
  const sessionID = uni.getStorageSync(STORAGE_KEYS.SESSION_ID)
  if (!sessionID) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    uni.redirectTo({ url: '/pages/login/index' })
    return
  }
  
  isLoading.value = true
  
  try {
    const result = await request<{ data: StoryDetail }>('/getStoryDetail', 'GET', {
      sessionID,
      storyID: storyID.value
    })
    
    storyDetail.value = result.data
  } catch (error) {
    console.error('获取作品详情失败:', error)
    storyDetail.value = null
  } finally {
    isLoading.value = false
  }
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr
}

// 获取状态样式
const getStatusClass = (status: number | null | undefined) => {
  if (status === null || status === undefined) return 'status-draft'
  switch (status) {
    case 0: return 'status-pending'
    case 1: return 'status-approved'
    case 2: return 'status-rejected'
    default: return 'status-draft'
  }
}

// 获取状态文本
const getStatusText = (status: number | null | undefined) => {
  if (status === null || status === undefined) return '草稿'
  switch (status) {
    case 0: return '待审核'
    case 1: return '已通过'
    case 2: return '已拒绝'
    default: return '草稿'
  }
}

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/story/list' })
    }
  })
}

// 跳转到编辑页面
const goToEdit = () => {
  if (!storyID.value) return
  uni.navigateTo({
    url: `/pages/story/edit?storyID=${storyID.value}`
  })
}

// 确认删除
const confirmDelete = () => {
  showDeleteModal.value = true
}

// 执行删除
const handleDelete = async () => {
  if (!storyID.value) return
  
  const sessionID = uni.getStorageSync(STORAGE_KEYS.SESSION_ID)
  if (!sessionID) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  
  try {
    await request('/deleteOneStory', 'GET', {
      sessionID,
      storyID: storyID.value
    })
    
    uni.showToast({ title: '删除成功', icon: 'success' })
    showDeleteModal.value = false
    
    // 通知列表页刷新
    uni.$emit('refreshStoryList')
    
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/story/list' })
    }, 1500)
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 切换音频播放
const toggleAudio = () => {
  if (!storyDetail.value?.soundURL) return
  
  // 简单的播放状态切换（实际应用需要使用 uni.createInnerAudioContext）
  isPlaying.value = !isPlaying.value
  
  if (isPlaying.value) {
    // 创建音频上下文并播放
    audioContext = uni.createInnerAudioContext()
    audioContext.src = storyDetail.value.soundURL
    audioContext.play()
    audioContext.onEnded(() => {
      isPlaying.value = false
    })
  } else {
    // 暂停播放
    if (audioContext) {
      audioContext.pause()
    }
  }
}

// 页面加载
onMounted(() => {
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).$page?.options || (currentPage as any).options || {}
  
  if (options.storyID) {
    storyID.value = options.storyID
    fetchDetail()
  }
})
</script>

<style scoped>
.detail-container {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
}

.detail-layout {
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

.sidebar-footer {
  padding: 12rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx;
  margin-bottom: 8rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8rpx;
}

.action-button.delete {
  background-color: rgba(255, 59, 48, 0.2);
}

.action-icon {
  font-size: 20rpx;
  color: #ffffff;
}

.action-text {
  font-size: 10rpx;
  color: #ffffff;
  margin-top: 4rpx;
}

/* 右侧主内容 */
.main-content {
  flex: 1;
  height: 100%;
  background-color: #ffffff;
}

.content-wrapper {
  padding: 20rpx 24rpx;
}

/* 作品头部 */
.story-header {
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.story-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  line-height: 1.4;
  margin-bottom: 12rpx;
}

.story-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16rpx;
}

.meta-item {
  font-size: 14rpx;
  color: #999999;
}

.status-badge {
  display: inline-block;
  font-size: 12rpx;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.status-draft {
  background-color: #E0E0E0;
  color: #666666;
}

.status-pending {
  background-color: #FFF3CD;
  color: #856404;
}

.status-approved {
  background-color: #D4EDDA;
  color: #155724;
}

.status-rejected {
  background-color: #F8D7DA;
  color: #721C24;
}

/* 媒体内容 */
.media-section {
  margin-bottom: 20rpx;
}

.image-wrapper,
.video-wrapper {
  width: 100%;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #f5f5f5;
  position: relative;
}

.story-image {
  width: 100%;
  height: auto;
  max-height: 400rpx;
}

.story-video {
  width: 100%;
  height: 300rpx;
  position: relative !important;
  top: auto !important;
  left: auto !important;
  transform: none !important;
}

/* 音频播放器 */
.audio-section {
  margin-bottom: 20rpx;
}

.audio-player {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12rpx;
}

.audio-icon {
  font-size: 24rpx;
  margin-right: 12rpx;
}

.audio-label {
  flex: 1;
  font-size: 16rpx;
  color: #ffffff;
}

.audio-controls {
  display: flex;
  align-items: center;
}

.play-btn {
  font-size: 24rpx;
  padding: 8rpx;
}

/* 内容区域 */
.content-section {
  margin-bottom: 20rpx;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.title-icon {
  font-size: 18rpx;
  margin-right: 8rpx;
}

.title-text {
  font-size: 18rpx;
  font-weight: bold;
  color: #333333;
}

.content-body {
  background-color: #f9f9f9;
  border-radius: 8rpx;
  padding: 16rpx;
}

.content-text {
  font-size: 16rpx;
  color: #666666;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* 统计信息 */
.stats-section {
  display: flex;
  justify-content: space-around;
  padding: 16rpx 0;
  margin-bottom: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24rpx;
  font-weight: bold;
  color: #007AFF;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: 12rpx;
  color: #999999;
}

/* 附件列表 */
.attachment-section {
  margin-bottom: 20rpx;
}

.attachment-list {
  background-color: #f9f9f9;
  border-radius: 8rpx;
  padding: 12rpx;
}

.attachment-item {
  padding: 12rpx;
  margin-bottom: 8rpx;
  background-color: #ffffff;
  border-radius: 6rpx;
}

.attachment-name {
  font-size: 14rpx;
  color: #333333;
}

/* 加载状态 */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.loading-icon,
.error-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.loading-text,
.error-text {
  font-size: 16rpx;
  color: #999999;
}

.retry-btn {
  margin-top: 20rpx;
  padding: 12rpx 32rpx;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  border-radius: 8rpx;
}

.retry-text {
  font-size: 16rpx;
  color: #ffffff;
}

/* 删除弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 24rpx;
  width: 400rpx;
}

.modal-title {
  display: block;
  font-size: 20rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 16rpx;
}

.modal-message {
  display: block;
  font-size: 16rpx;
  color: #666666;
  text-align: center;
  margin-bottom: 24rpx;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
}

.modal-btn {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12rpx 0;
  border-radius: 8rpx;
}

.cancel-btn {
  background-color: #f5f5f5;
}

.confirm-btn {
  background-color: #FF3B30;
}

.modal-btn-text {
  font-size: 16rpx;
  color: #333333;
}

.confirm-btn .modal-btn-text {
  color: #ffffff;
}
</style>
