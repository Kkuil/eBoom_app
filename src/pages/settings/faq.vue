<template>
  <view class="faq-container">
    <!-- 横屏布局 -->
    <view class="faq-layout">
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
            <text class="menu-icon-sidebar">❓</text>
            <text class="menu-text-sidebar">常见问题</text>
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
        <view class="content-wrapper">
          <!-- 页面标题 -->
          <view class="page-header">
            <text class="page-title">常见问题</text>
            <text class="page-subtitle">共 {{ total }} 个问题</text>
          </view>
          
          <!-- 问题列表 -->
          <view class="faq-list" v-if="faqList.length > 0">
            <view 
              class="faq-item" 
              v-for="item in faqList" 
              :key="item.articleID"
              @click="goToDetail(item.articleID)"
            >
              <view class="faq-header">
                <text class="faq-icon">❓</text>
                <text class="faq-title">{{ item.title }}</text>
              </view>
              <view class="faq-content">
                <text class="faq-desc">{{ item.description || '点击查看详情' }}</text>
              </view>
              <view class="faq-footer">
                <text class="faq-date">{{ item.createdDateStr }}</text>
                <text class="faq-arrow">></text>
              </view>
            </view>
          </view>
          
          <!-- 空状态 -->
          <view class="empty-state" v-else-if="!isLoading">
            <text class="empty-icon">📭</text>
            <text class="empty-text">暂无常见问题</text>
          </view>
          
          <!-- 加载状态 -->
          <view class="loading-more" v-if="isLoading">
            <text class="loading-text">加载中...</text>
          </view>
          
          <!-- 没有更多 -->
          <view class="no-more" v-if="!hasNextPage && faqList.length > 0 && !isLoading">
            <text class="no-more-text">— 没有更多了 —</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/utils/request'

// 常见问题导航ID
const NAVIGATOR_ID = 'dc9d1abf72794c60a6688f17bb2f91db'

// 问题数据类型
interface FAQItem {
  articleID: string
  title: string
  description: string
  createdDateStr: string
}

// 列表数据
const faqList = ref<FAQItem[]>([])
const currentPage = ref(1)
const pageNumber = ref(10)
const total = ref(0)
const hasNextPage = ref(false)
const isLoading = ref(false)

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/settings/index' })
    }
  })
}

// 获取问题列表
const fetchFAQList = async (isRefresh = false) => {
  if (isLoading.value) return
  
  if (isRefresh) {
    currentPage.value = 1
    faqList.value = []
  }
  
  isLoading.value = true
  
  try {
    const result = await api.getNavigatorArticleList({
      navigatorID: NAVIGATOR_ID,
      currentPage: currentPage.value,
      pageNumber: pageNumber.value
    })
    
    if (result.data) {
      if (isRefresh) {
        faqList.value = result.data.rows || []
      } else {
        faqList.value = [...faqList.value, ...(result.data.rows || [])]
      }
      
      total.value = result.data.total || 0
      hasNextPage.value = result.data.hasNextPage || false
    }
  } catch (error) {
    console.error('获取常见问题列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (!hasNextPage.value || isLoading.value) return
  currentPage.value++
  fetchFAQList()
}

// 跳转详情
const goToDetail = (articleID: string) => {
  uni.navigateTo({
    url: `/pages/article/index?articleID=${articleID}`
  })
}

onMounted(() => {
  fetchFAQList(true)
})
</script>

<style scoped>
.faq-container {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
}

.faq-layout {
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

/* 问题列表 */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.faq-item {
  background-color: #f9f9f9;
  border-radius: 12rpx;
  padding: 16rpx;
}

.faq-header {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.faq-icon {
  font-size: 20rpx;
  margin-right: 8rpx;
}

.faq-title {
  flex: 1;
  font-size: 18rpx;
  font-weight: bold;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.faq-content {
  margin-bottom: 8rpx;
}

.faq-desc {
  font-size: 14rpx;
  color: #666666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.faq-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.faq-date {
  font-size: 12rpx;
  color: #999999;
}

.faq-arrow {
  font-size: 16rpx;
  color: #cccccc;
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
