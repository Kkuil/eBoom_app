<template>
  <view class="article-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <text class="nav-back-icon">←</text>
      </view>
      <text class="nav-title">{{ article.title || '文章详情' }}</text>
      <view class="nav-placeholder"></view>
    </view>
    
    <!-- 加载中 -->
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 文章内容 -->
    <scroll-view v-else class="article-scroll" scroll-y>
      <view class="article-content">
        <!-- 文章标题 -->
        <view class="article-header">
          <text class="article-title">{{ article.title }}</text>
          <text class="article-date">{{ article.createdDateStr }}</text>
        </view>
        
        <!-- 富文本内容 -->
        <view class="article-body">
          <rich-text :nodes="article.contentText" class="rich-text-content"></rich-text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const API_BASE_URL = 'https://api.eboom.com.cn/interface-server/api'

// 文章数据
const article = ref({
  title: '',
  contentText: '',
  createdDateStr: ''
})

const isLoading = ref(true)
const articleID = ref('')

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/home/index' })
    }
  })
}

// 获取文章详情
const getArticleDetail = async () => {
  console.log('Getting article, ID:', articleID.value)
  
  if (!articleID.value) {
    uni.showToast({ title: '文章ID不存在', icon: 'none' })
    isLoading.value = false
    return
  }
  
  isLoading.value = true
  
  try {
    const url = `${API_BASE_URL}/getArticleSimpleDetail?articleID=${encodeURIComponent(articleID.value)}`
    console.log('Request URL:', url)
    
    const res: any = await new Promise((resolve, reject) => {
      uni.request({
        url,
        method: 'GET',
        timeout: 15000,
        success: resolve,
        fail: reject
      })
    })
    
    console.log('Response:', res)
    
    if (res.data && res.data.header && res.data.header.code === 0) {
      const result = res.data.body
      if (result.apiArticleDto) {
        article.value = {
          title: result.apiArticleDto.title || '',
          contentText: result.apiArticleDto.contentText || '',
          createdDateStr: result.apiArticleDto.createdDateStr || ''
        }
      }
    } else {
      uni.showToast({ title: '获取文章失败', icon: 'none' })
    }
  } catch (error) {
    console.error('Get article error:', error)
    uni.showToast({ title: '获取文章失败', icon: 'none' })
  } finally {
    isLoading.value = false
  }
}

// 使用 onLoad 获取页面参数 - 这是 UniApp 正确的方式，在 App 端能正常工作
onLoad((options) => {
  console.log('Article page onLoad, options:', options)
  if (options && options.articleID) {
    articleID.value = options.articleID as string
    console.log('Got articleID:', articleID.value)
  }
  getArticleDetail()
})
</script>

<style scoped>
.article-container {
  width: 100vw;
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64rpx;
  padding: 0 24rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.nav-back {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back-icon {
  font-size: 28rpx;
  color: #333333;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  font-weight: bold;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 16rpx;
}

.nav-placeholder {
  width: 48rpx;
}

.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid #e0e0e0;
  border-top-color: #007AFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 20rpx;
  color: #999999;
  margin-top: 16rpx;
}

/* 横屏滚动区域 */
.article-scroll {
  flex: 1;
  width: 100%;
}

.article-content {
  padding: 20rpx 60rpx;
  max-width: 1400rpx;
  margin: 0 auto;
}

.article-header {
  margin-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  padding-bottom: 16rpx;
}

.article-title {
  display: block;
  font-size: 26rpx;
  font-weight: bold;
  color: #333333;
  line-height: 1.4;
}

.article-date {
  display: block;
  font-size: 18rpx;
  color: #999999;
  margin-top: 8rpx;
}

.article-body {
  font-size: 20rpx;
  color: #333333;
  line-height: 1.8;
  height: 200rpx;
  overflow-y: auto;
}

.rich-text-content {
  width: 100%;
}
</style>
