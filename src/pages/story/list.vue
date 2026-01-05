<template>
  <view class="story-container">
    <!-- 横屏布局 -->
    <view class="story-layout">
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
            <text class="menu-icon-sidebar">📝</text>
            <text class="menu-text-sidebar">我的作品</text>
          </view>
        </view>
        
        <!-- 新增按钮 -->
        <view class="sidebar-footer">
          <view class="add-button" @click="goToCreate">
            <text class="add-icon">+</text>
            <text class="add-text">新增作品</text>
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
        <!-- 标题区域 -->
        <view class="page-header">
          <text class="page-title">我的作品</text>
          <text class="page-subtitle">共 {{ total }} 个作品</text>
        </view>
        
        <!-- 作品列表 -->
        <view class="story-list" v-if="storyList.length > 0">
          <view class="story-card" v-for="item in storyList" :key="item.storyID">
            <!-- 作品主体 - 点击查看详情 -->
            <view class="story-main" @click="goToDetail(item)">
              <!-- 作品封面 -->
              <view class="story-cover">
                <image 
                  v-if="item.listImage" 
                  :src="item.listImage" 
                  class="cover-image"
                  mode="aspectFill"
                />
                <view v-else class="cover-placeholder">
                  <text class="cover-icon">📄</text>
                </view>
              </view>
              
              <!-- 作品信息 -->
              <view class="story-info">
                <text class="story-title">{{ item.name }}</text>
                <text class="story-date">{{ formatDate(item.toldTimeStr) }}</text>
                <view class="story-status">
                  <text :class="['status-tag', getStatusClass(item.approvedStatus)]">
                    {{ getStatusText(item.approvedStatus) }}
                  </text>
                </view>
              </view>
            </view>
            
            <!-- 操作按钮 -->
            <view class="story-actions">
              <view class="action-btn edit-btn" @click.stop="goToEdit(item)">
                <text class="action-icon">✏️</text>
                <text class="action-text">编辑</text>
              </view>
              <view class="action-btn delete-btn" @click.stop="confirmDelete(item)">
                <text class="action-icon">🗑️</text>
                <text class="action-text">删除</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view class="empty-state" v-else-if="!isLoading">
          <text class="empty-icon">📭</text>
          <text class="empty-text">暂无作品</text>
          <view class="empty-action" @click="goToCreate">
            <text class="empty-action-text">创建第一个作品</text>
          </view>
        </view>
        
        <!-- 加载状态 -->
        <view class="loading-more" v-if="isLoading">
          <text class="loading-text">加载中...</text>
        </view>
        
        <!-- 没有更多 -->
        <view class="no-more" v-if="!hasNextPage && storyList.length > 0">
          <text class="no-more-text">— 没有更多了 —</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 删除确认弹窗 -->
    <view class="modal-overlay" v-if="showDeleteModal" @click="showDeleteModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">确认删除</text>
        <text class="modal-message">确定要删除作品「{{ deleteTarget?.name }}」吗？</text>
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
import { STORAGE_KEYS, STORY_CONFIG } from '@/config'

// 作品数据类型
interface StoryItem {
  storyID: string
  name: string
  listImage: string
  videoURL: string
  soundURL: string
  content: string
  toldTimeStr: string
  approvedStatus: number
}

// 列表数据
const storyList = ref<StoryItem[]>([])
const currentPage = ref(1)
const pageNumber = ref(STORY_CONFIG.DEFAULT_PAGE_SIZE)
const total = ref(0)
const hasNextPage = ref(false)
const isLoading = ref(false)

// 删除相关
const showDeleteModal = ref(false)
const deleteTarget = ref<StoryItem | null>(null)

// 获取作品列表
const fetchStoryList = async (isRefresh = false) => {
  if (isLoading.value) return
  
  const sessionID = uni.getStorageSync(STORAGE_KEYS.SESSION_ID)
  if (!sessionID) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    uni.redirectTo({ url: '/pages/login/index' })
    return
  }
  
  if (isRefresh) {
    currentPage.value = 1
    storyList.value = []
  }
  
  isLoading.value = true
  
  try {
    const result = await request<{
      data: {
        rows: StoryItem[]
        total: number
        hasNextPage: boolean
        currentPage: number
      }
    }>('/getStoryList', 'GET', {
      sessionID,
      pageNumber: pageNumber.value,
      currentPage: currentPage.value
    }, false)
    
    if (isRefresh) {
      storyList.value = result.data.rows || []
    } else {
      storyList.value = [...storyList.value, ...(result.data.rows || [])]
    }
    
    total.value = result.data.total || 0
    hasNextPage.value = result.data.hasNextPage || false
  } catch (error) {
    console.error('获取作品列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (hasNextPage.value && !isLoading.value) {
    currentPage.value++
    fetchStoryList()
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.split(' ')[0]
}

// 获取状态样式
const getStatusClass = (status: number) => {
  switch (status) {
    case 0: return 'status-pending'
    case 1: return 'status-approved'
    case 2: return 'status-rejected'
    default: return 'status-pending'
  }
}

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '待审核'
    case 1: return '已通过'
    case 2: return '已拒绝'
    default: return '待审核'
  }
}

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/home/index' })
    }
  })
}

// 跳转到创建页面
const goToCreate = () => {
  uni.navigateTo({
    url: '/pages/story/edit'
  })
}

// 跳转到详情页面
const goToDetail = (item: StoryItem) => {
  uni.navigateTo({
    url: `/pages/story/detail?storyID=${item.storyID}`
  })
}

// 跳转到编辑页面
const goToEdit = (item: StoryItem) => {
  uni.navigateTo({
    url: `/pages/story/edit?storyID=${item.storyID}`
  })
}

// 确认删除
const confirmDelete = (item: StoryItem) => {
  deleteTarget.value = item
  showDeleteModal.value = true
}

// 执行删除
const handleDelete = async () => {
  if (!deleteTarget.value) return
  
  const sessionID = uni.getStorageSync(STORAGE_KEYS.SESSION_ID)
  if (!sessionID) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  
  try {
    await request('/deleteOneStory', 'GET', {
      sessionID,
      storyID: deleteTarget.value.storyID
    })
    
    uni.showToast({ title: '删除成功', icon: 'success' })
    showDeleteModal.value = false
    deleteTarget.value = null
    
    // 刷新列表
    fetchStoryList(true)
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 页面显示时刷新
onMounted(() => {
  fetchStoryList(true)
})

// 监听页面重新显示（从编辑页返回时刷新）
uni.$on('refreshStoryList', () => {
  fetchStoryList(true)
})
</script>

<style scoped>
.story-container {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
}

.story-layout {
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

.add-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8rpx;
}

.add-icon {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: bold;
}

.add-text {
  font-size: 10rpx;
  color: #ffffff;
  margin-top: 4rpx;
  text-align: center;
}

/* 右侧主内容 */
.main-content {
  flex: 1;
  height: 100%;
  padding: 16rpx 24rpx;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 16rpx;
}

.page-title {
  display: block;
  font-size: 24rpx;
  font-weight: bold;
  color: #333333;
}

.page-subtitle {
  display: block;
  font-size: 14rpx;
  color: #999999;
  margin-top: 4rpx;
}

/* 作品列表 */
.story-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.story-card {
  width: calc(50% - 6rpx);
  background-color: #ffffff;
  border-radius: 12rpx;
  overflow: hidden;
  display: flex;
  padding: 12rpx;
  box-sizing: border-box;
}

.story-main {
  flex: 1;
  display: flex;
  min-width: 0;
}

.story-cover {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  overflow: hidden;
  flex-shrink: 0;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.cover-icon {
  font-size: 32rpx;
}

.story-info {
  flex: 1;
  margin-left: 12rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.story-title {
  display: block;
  font-size: 16rpx;
  font-weight: bold;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.story-date {
  display: block;
  font-size: 12rpx;
  color: #999999;
  margin-top: 4rpx;
}

.story-status {
  margin-top: 4rpx;
}

.status-tag {
  display: inline-block;
  font-size: 10rpx;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
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

.story-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8rpx;
  margin-left: 12rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
}

.edit-btn {
  background-color: #E3F2FD;
}

.delete-btn {
  background-color: #FFEBEE;
}

.action-icon {
  font-size: 14rpx;
}

.action-text {
  font-size: 12rpx;
  margin-left: 4rpx;
  color: #333333;
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
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 18rpx;
  color: #999999;
  margin-bottom: 20rpx;
}

.empty-action {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
}

.empty-action-text {
  font-size: 16rpx;
  color: #ffffff;
}

/* 加载状态 */
.loading-more,
.no-more {
  display: flex;
  justify-content: center;
  padding: 16rpx 0;
}

.loading-text,
.no-more-text {
  font-size: 14rpx;
  color: #999999;
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
