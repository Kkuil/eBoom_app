<template>
  <view class="edit-container">
    <!-- 横屏布局 -->
    <view class="edit-layout">
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
            <text class="menu-icon-sidebar">{{ isEdit ? '✏️' : '➕' }}</text>
            <text class="menu-text-sidebar">{{ isEdit ? '编辑作品' : '新增作品' }}</text>
          </view>
        </view>
        
        <!-- 提交按钮 -->
        <view class="sidebar-footer">
          <view class="submit-button" @click="handleSubmit" :class="{ disabled: isSubmitting }">
            <text class="submit-icon">✓</text>
            <text class="submit-text">{{ isSubmitting ? '提交中' : '提交' }}</text>
          </view>
        </view>
      </view>
      
      <!-- 右侧表单区域 -->
      <scroll-view class="main-content" scroll-y :show-scrollbar="false">
        <view class="form-wrapper">
          <!-- 标题区域 -->
          <view class="page-header">
            <text class="page-title">{{ isEdit ? '编辑作品' : '创建作品' }}</text>
            <text class="page-subtitle">请填写作品信息</text>
          </view>
          
          <!-- 表单内容 -->
          <view class="form-content">
            <!-- 标题输入 -->
            <view class="form-item">
              <view class="form-label">
                <text class="label-text">作品标题</text>
                <text class="label-required">*</text>
                <text class="label-count">{{ formData.name.length }}/{{ STORY_CONFIG.MAX_TITLE_LENGTH }}</text>
              </view>
              <view class="input-wrapper">
                <input 
                  class="form-input"
                  type="text"
                  v-model="formData.name"
                  placeholder="请输入作品标题"
                  :maxlength="STORY_CONFIG.MAX_TITLE_LENGTH"
                />
              </view>
              <text v-if="errors.name" class="error-text">{{ errors.name }}</text>
            </view>
            
            <!-- 内容输入 -->
            <view class="form-item">
              <view class="form-label">
                <text class="label-text">作品内容</text>
                <text class="label-required">*</text>
                <text class="label-count">{{ formData.description.length }}/{{ STORY_CONFIG.MAX_CONTENT_LENGTH }}</text>
              </view>
              <view class="textarea-wrapper">
                <textarea 
                  class="form-textarea"
                  v-model="formData.description"
                  placeholder="请输入作品内容"
                  :maxlength="STORY_CONFIG.MAX_CONTENT_LENGTH"
                />
              </view>
              <text v-if="errors.description" class="error-text">{{ errors.description }}</text>
            </view>
            
            <!-- 媒体类型选择 -->
            <view class="form-item">
              <view class="form-label">
                <text class="label-text">附件类型</text>
                <text class="label-hint">（图片和视频只能选一个）</text>
              </view>
              <view class="media-selector">
                <view 
                  :class="['media-option', { active: mediaType === 'image' }]"
                  @click="selectMediaType('image')"
                >
                  <text class="media-icon">🖼️</text>
                  <text class="media-text">图片</text>
                </view>
                <view 
                  :class="['media-option', { active: mediaType === 'video' }]"
                  @click="selectMediaType('video')"
                >
                  <text class="media-icon">🎬</text>
                  <text class="media-text">视频</text>
                </view>
                <view 
                  :class="['media-option', { active: hasAudio }]"
                  @click="toggleAudio"
                >
                  <text class="media-icon">🎵</text>
                  <text class="media-text">音频</text>
                </view>
              </view>
              <text class="media-notice">⚠️ 注意：图片和视频只能选择其中一个上传</text>
            </view>
            
            <!-- 图片上传 -->
            <view class="form-item" v-if="mediaType === 'image'">
              <view class="form-label">
                <text class="label-text">图片</text>
              </view>
              <view class="upload-wrapper">
                <view class="upload-preview" v-if="formData.listImage">
                  <image :src="formData.listImage" class="preview-image" mode="aspectFill" />
                  <view class="preview-remove" @click="removeImage">
                    <text class="remove-icon">×</text>
                  </view>
                </view>
                <view class="upload-btn" v-else @click="handleChooseImage">
                  <text class="upload-icon">📷</text>
                  <text class="upload-text">选择图片</text>
                </view>
              </view>
              <text class="input-hint">支持从相册选择或拍照</text>
            </view>
            
            <!-- 视频上传 -->
            <view class="form-item" v-if="mediaType === 'video'">
              <view class="form-label">
                <text class="label-text">视频</text>
              </view>
              <view class="upload-wrapper">
                <view class="upload-preview" v-if="formData.videoURL">
                  <video :src="formData.videoURL" class="preview-video" :controls="false" :autoplay="false" />
                  <view class="preview-remove" @click="removeVideo">
                    <text class="remove-icon">×</text>
                  </view>
                </view>
                <view class="upload-btn" v-else @click="handleChooseVideo">
                  <text class="upload-icon">🎬</text>
                  <text class="upload-text">选择视频</text>
                </view>
              </view>
              <text class="input-hint">支持从相册选择或录制，最长60秒</text>
            </view>
            
            <!-- 音频上传 -->
            <view class="form-item" v-if="hasAudio">
              <view class="form-label">
                <text class="label-text">音频</text>
              </view>
              <view class="upload-wrapper">
                <view class="upload-preview audio-preview" v-if="formData.soundURL">
                  <text class="audio-icon">🎵</text>
                  <text class="audio-name">已上传音频</text>
                  <view class="preview-remove" @click="removeAudio">
                    <text class="remove-icon">×</text>
                  </view>
                </view>
                <view class="upload-btn" v-else @click="handleChooseAudio">
                  <text class="upload-icon">🎵</text>
                  <text class="upload-text">选择音频</text>
                </view>
              </view>
              <text class="input-hint">支持mp3、wav、m4a等格式</text>
            </view>
          </view>
          
          <!-- 底部提交按钮（移动端备用） -->
          <view class="form-footer">
            <button 
              class="submit-btn" 
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              <text class="btn-text">{{ isSubmitting ? '提交中...' : (isEdit ? '保存修改' : '创建作品') }}</text>
            </button>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { request } from '@/utils/request'
import { STORAGE_KEYS, STORY_CONFIG } from '@/config'
import { chooseAndUploadImage, chooseAndUploadVideo, chooseAndUploadAudio } from '@/utils/upload'

// 路由参数
const storyID = ref('')
const isEdit = computed(() => !!storyID.value)

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  listImage: '',
  videoURL: '',
  soundURL: ''
})

// 原始数据（用于编辑时比较变化）
const originalData = reactive({
  name: '',
  description: '',
  listImage: '',
  videoURL: '',
  soundURL: ''
})

// 媒体类型
const mediaType = ref<'image' | 'video' | ''>('')
const hasAudio = ref(false)

// 错误信息
const errors = reactive({
  name: '',
  description: ''
})

// 提交状态
const isSubmitting = ref(false)

// 选择媒体类型
const selectMediaType = (type: 'image' | 'video') => {
  if (mediaType.value === type) {
    mediaType.value = ''
    if (type === 'image') {
      formData.listImage = ''
    } else {
      formData.videoURL = ''
    }
  } else {
    mediaType.value = type
    // 清除另一个类型的数据
    if (type === 'image') {
      formData.videoURL = ''
    } else {
      formData.listImage = ''
    }
  }
}

// 切换音频
const toggleAudio = () => {
  hasAudio.value = !hasAudio.value
  if (!hasAudio.value) {
    formData.soundURL = ''
  }
}

// 选择并上传图片
const handleChooseImage = async () => {
  try {
    const urls = await chooseAndUploadImage(1)
    if (urls.length > 0) {
      formData.listImage = urls[0]
    }
  } catch (error) {
    console.error('图片上传失败:', error)
  }
}

// 移除图片
const removeImage = () => {
  formData.listImage = ''
}

// 选择并上传视频
const handleChooseVideo = async () => {
  try {
    const url = await chooseAndUploadVideo()
    if (url) {
      formData.videoURL = url
    }
  } catch (error) {
    console.error('视频上传失败:', error)
  }
}

// 移除视频
const removeVideo = () => {
  formData.videoURL = ''
}

// 选择并上传音频
const handleChooseAudio = async () => {
  try {
    const url = await chooseAndUploadAudio()
    if (url) {
      formData.soundURL = url
    }
  } catch (error) {
    console.error('音频上传失败:', error)
  }
}

// 移除音频
const removeAudio = () => {
  formData.soundURL = ''
}

// 验证表单
const validateForm = (): boolean => {
  let isValid = true
  
  // 验证标题
  if (!formData.name.trim()) {
    errors.name = '请输入作品标题'
    isValid = false
  } else if (formData.name.length > STORY_CONFIG.MAX_TITLE_LENGTH) {
    errors.name = `标题不能超过${STORY_CONFIG.MAX_TITLE_LENGTH}个字符`
    isValid = false
  } else {
    errors.name = ''
  }
  
  // 验证内容
  if (!formData.description.trim()) {
    errors.description = '请输入作品内容'
    isValid = false
  } else if (formData.description.length > STORY_CONFIG.MAX_CONTENT_LENGTH) {
    errors.description = `内容不能超过${STORY_CONFIG.MAX_CONTENT_LENGTH}个字符`
    isValid = false
  } else {
    errors.description = ''
  }
  
  return isValid
}

// 获取变更的字段（编辑模式）
const getChangedFields = () => {
  const changed: Record<string, string> = {}
  
  if (formData.name !== originalData.name) {
    changed.name = formData.name
  }
  if (formData.description !== originalData.description) {
    changed.description = formData.description
  }
  if (formData.listImage !== originalData.listImage) {
    changed.listImage = formData.listImage
  }
  if (formData.videoURL !== originalData.videoURL) {
    changed.videoURL = formData.videoURL
  }
  if (formData.soundURL !== originalData.soundURL) {
    changed.soundURL = formData.soundURL
  }
  
  return changed
}

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/story/list' })
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return
  if (isSubmitting.value) return
  
  const sessionID = uni.getStorageSync(STORAGE_KEYS.SESSION_ID)
  const studentID = uni.getStorageSync(STORAGE_KEYS.STUDENT_ID) || uni.getStorageSync(STORAGE_KEYS.MEMBER_ID)
  
  if (!sessionID) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    uni.redirectTo({ url: '/pages/login/index' })
    return
  }
  
  isSubmitting.value = true
  
  try {
    if (isEdit.value) {
      // 编辑模式 - 只传变更的字段
      const changedFields = getChangedFields()
      
      if (Object.keys(changedFields).length === 0) {
        uni.showToast({ title: '没有修改内容', icon: 'none' })
        isSubmitting.value = false
        return
      }
      
      await request('/updateOneStory', 'GET', {
        sessionID,
        storyID: storyID.value,
        studentID,
        functionType: STORY_CONFIG.FUNCTION_TYPE,
        orderSeq: STORY_CONFIG.ORDER_SEQ,
        ...changedFields
      })
      
      uni.showToast({ title: '修改成功', icon: 'success' })
    } else {
      // 新增模式
      const params: Record<string, any> = {
        sessionID,
        studentID,
        name: formData.name,
        description: formData.description,
        functionType: STORY_CONFIG.FUNCTION_TYPE,
        orderSeq: STORY_CONFIG.ORDER_SEQ
      }
      
      // 添加媒体URL（如果有）
      if (formData.listImage) {
        params.listImage = formData.listImage
      }
      if (formData.videoURL) {
        params.videoURL = formData.videoURL
      }
      if (formData.soundURL) {
        params.soundURL = formData.soundURL
      }
      
      await request('/submitOneStory', 'GET', params)
      
      uni.showToast({ title: '创建成功', icon: 'success' })
    }
    
    // 通知列表页刷新
    uni.$emit('refreshStoryList')
    
    setTimeout(() => {
      goBack()
    }, 1500)
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

// 获取作品详情（编辑模式）
const fetchStoryDetail = async () => {
  if (!storyID.value) return
  
  const sessionID = uni.getStorageSync(STORAGE_KEYS.SESSION_ID)
  if (!sessionID) return
  
  try {
    // 使用详情接口获取作品数据
    const result = await request<{
      data: {
        storyID: string
        name: string
        description: string
        listImage: string
        videoURL: string
        soundURL: string
      }
    }>('/getStoryDetail', 'GET', {
      sessionID,
      storyID: storyID.value
    }, false)
    
    const story = result.data
    
    if (story) {
      formData.name = story.name || ''
      formData.description = story.description || ''
      formData.listImage = story.listImage || ''
      formData.videoURL = story.videoURL || ''
      formData.soundURL = story.soundURL || ''
      
      // 保存原始数据
      originalData.name = story.name || ''
      originalData.description = story.description || ''
      originalData.listImage = story.listImage || ''
      originalData.videoURL = story.videoURL || ''
      originalData.soundURL = story.soundURL || ''
      
      // 设置媒体类型
      if (story.listImage) {
        mediaType.value = 'image'
      } else if (story.videoURL) {
        mediaType.value = 'video'
      }
      
      if (story.soundURL) {
        hasAudio.value = true
      }
    }
  } catch (error) {
    console.error('获取作品详情失败:', error)
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
    fetchStoryDetail()
  }
})
</script>

<style scoped>
.edit-container {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
}

.edit-layout {
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

.submit-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 8rpx;
}

.submit-button.disabled {
  opacity: 0.6;
}

.submit-icon {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: bold;
}

.submit-text {
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

.form-wrapper {
  padding: 20rpx 32rpx;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 20rpx;
  flex-shrink: 0;
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

.form-content {
  flex: 1;
  overflow-y: auto;
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

.label-count {
  font-size: 12rpx;
  color: #999999;
  margin-left: auto;
}

.label-hint {
  font-size: 12rpx;
  color: #999999;
  margin-left: 8rpx;
}

.input-wrapper {
  background-color: #f5f5f5;
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

.textarea-wrapper {
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 12rpx 16rpx;
}

.form-textarea {
  width: 100%;
  height: 100rpx;
  font-size: 16rpx;
  color: #333333;
  line-height: 1.5;
}

.error-text {
  display: block;
  font-size: 12rpx;
  color: #FF3B30;
  margin-top: 4rpx;
}

.input-hint {
  display: block;
  font-size: 12rpx;
  color: #999999;
  margin-top: 4rpx;
}

/* 媒体选择器 */
.media-selector {
  display: flex;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.media-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  border: 2rpx solid transparent;
}

.media-option.active {
  background-color: #E3F2FD;
  border-color: #007AFF;
}

.media-icon {
  font-size: 24rpx;
}

.media-text {
  font-size: 14rpx;
  color: #333333;
  margin-top: 4rpx;
}

.media-notice {
  display: block;
  font-size: 12rpx;
  color: #FF9500;
  margin-top: 4rpx;
}

/* 上传区域样式 */
.upload-wrapper {
  width: 100%;
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120rpx;
  height: 120rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  border: 2rpx dashed #cccccc;
}

.upload-icon {
  font-size: 32rpx;
}

.upload-text {
  font-size: 12rpx;
  color: #999999;
  margin-top: 4rpx;
}

.upload-preview {
  position: relative;
  display: inline-block;
}

.preview-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
}

.preview-video {
  width: 160rpx;
  height: 120rpx;
  border-radius: 8rpx;
}

.audio-preview {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12rpx 16rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  width: fit-content;
}

.audio-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.audio-name {
  font-size: 14rpx;
  color: #333333;
  margin-right: 16rpx;
}

.preview-remove {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 28rpx;
  height: 28rpx;
  background-color: #FF3B30;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-preview .preview-remove {
  position: relative;
  top: 0;
  right: 0;
}

.remove-icon {
  font-size: 18rpx;
  color: #ffffff;
  font-weight: bold;
}

/* 表单底部 */
.form-footer {
  padding-top: 16rpx;
  flex-shrink: 0;
}

.submit-btn {
  width: 100%;
  height: 44rpx;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  border-radius: 8rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
}

.submit-btn[disabled] {
  opacity: 0.6;
}

.btn-text {
  font-size: 18rpx;
  font-weight: bold;
  color: #ffffff;
}
</style>
