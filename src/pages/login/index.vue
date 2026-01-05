<template>
  <view class="login-container">
    <!-- 横屏布局：左侧品牌 + 右侧表单 -->
    <view class="login-layout">
      <!-- 左侧品牌区域 -->
      <view class="brand-section">
        <view class="brand-content">
          <view class="brand-logo">📚</view>
          <text class="brand-title">教育培训平台</text>
          <text class="brand-subtitle">eBoom · 开启学习之旅</text>
        </view>
      </view>
      
      <!-- 右侧表单区域 -->
      <scroll-view class="form-section" scroll-y :show-scrollbar="false">
        <view class="form-container">
          <!-- 标题 -->
          <view class="form-header">
            <text class="form-title">欢迎登录</text>
            <text class="form-subtitle">请输入您的账号信息</text>
          </view>
          
          <!-- 手机号 -->
          <view class="form-item">
            <view class="input-wrapper">
              <text class="input-icon">📱</text>
              <input 
                class="form-input"
                type="number"
                v-model="loginName"
                placeholder="请输入手机号"
                maxlength="11"
                :adjust-position="true"
              />
            </view>
            <text v-if="phoneError" class="error-text">{{ phoneError }}</text>
          </view>
          
          <!-- 密码 -->
          <view class="form-item">
            <view class="input-wrapper">
              <text class="input-icon">🔒</text>
              <input 
                class="form-input"
                :password="!showPassword"
                v-model="password"
                placeholder="请输入密码"
                maxlength="30"
                :adjust-position="true"
              />
              <text class="show-password" @click="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </text>
            </view>
            <text v-if="passwordError" class="error-text">{{ passwordError }}</text>
          </view>
          
          <!-- 协议勾选 -->
          <view class="agreement-section">
            <view class="checkbox-wrapper" @click="toggleAgreement">
              <view :class="['checkbox', { 'checkbox-checked': isAgreed }]">
                <text v-if="isAgreed" class="checkbox-icon">✓</text>
              </view>
              <view class="agreement-text">
                <text>登录前请仔细阅读</text>
                <text class="link" @click.stop="goToArticle('register')">《注册协议》</text>
                <text>和</text>
                <text class="link" @click.stop="goToArticle('privacy')">《隐私协议》</text>
              </view>
            </view>
          </view>
          
          <!-- 登录按钮 -->
          <button 
            class="login-button" 
            :disabled="isLoading"
            @click="handleLogin"
          >
            <text class="button-text">{{ isLoading ? '登录中...' : '立即登录' }}</text>
          </button>
          
          <!-- 注册链接 -->
          <view class="register-section">
            <text class="register-text">还没有账号？</text>
            <text class="register-link" @click="goToRegister">立即注册</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { API_CONFIG, STORAGE_KEYS } from '@/config'

// 表单数据
const loginName = ref('')
const password = ref('')
const isAgreed = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)

// 错误信息
const phoneError = ref('')
const passwordError = ref('')

// 获取deviceID
const getDeviceID = (): string | null => {
  try {
    return uni.getStorageSync('deviceID') || null
  } catch (e) {
    return null
  }
}

// API请求封装
const request = <T = any>(url: string, params?: Record<string, any>): Promise<T> => {
  return new Promise((resolve, reject) => {
    let fullUrl = `${API_CONFIG.BASE_URL}${url}`
    if (params) {
      const queryString = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      if (queryString) {
        fullUrl += `?${queryString}`
      }
    }
    
    console.log('Request URL:', fullUrl)
    
    uni.request({
      url: fullUrl,
      method: 'GET',
      timeout: 15000,
      success: (res: any) => {
        console.log('Response:', res.data)
        if (res.data && res.data.header && res.data.header.code === 0) {
          resolve(res.data.body)
        } else {
          const errorMsg = res.data?.header?.message || '操作失败，请稍后重试'
          uni.showToast({ title: errorMsg, icon: 'none' })
          reject(new Error(errorMsg))
        }
      },
      fail: (err) => {
        console.error('Request failed:', err)
        uni.showToast({ title: '网络连接失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

// 验证手机号
const validatePhone = (): boolean => {
  const phone = loginName.value.trim()
  if (!phone) {
    phoneError.value = '请输入手机号'
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    phoneError.value = '请输入正确的手机号'
    return false
  }
  phoneError.value = ''
  return true
}

// 验证密码
const validatePassword = (): boolean => {
  const pwd = password.value
  if (!pwd) {
    passwordError.value = '请输入密码'
    return false
  }
  passwordError.value = ''
  return true
}

// 切换协议勾选
const toggleAgreement = async () => {
  if (!isAgreed.value) {
    try {
      const deviceID = getDeviceID()
      if (!deviceID) {
        uni.showToast({ title: '设备信息异常，请重启应用', icon: 'none' })
        return
      }
      
      uni.showLoading({ title: '签署协议中...' })
      
      const registerResult = await request<{ agreementID: string }>('/signOneBlankAgreement', {
        agreementDefineID: API_CONFIG.AGREEMENT_IDS.REGISTER,
        deviceID
      })
      uni.setStorageSync(STORAGE_KEYS.REGISTER_AGREEMENT_ID, registerResult.agreementID)
      
      const privacyResult = await request<{ agreementID: string }>('/signOneBlankAgreement', {
        agreementDefineID: API_CONFIG.AGREEMENT_IDS.PRIVACY,
        deviceID
      })
      uni.setStorageSync(STORAGE_KEYS.PRIVACY_AGREEMENT_ID, privacyResult.agreementID)
      
      uni.hideLoading()
      isAgreed.value = true
    } catch (error) {
      uni.hideLoading()
      console.error('Sign agreement error:', error)
    }
  } else {
    isAgreed.value = false
  }
}

// 跳转文章页面
const goToArticle = (type: 'register' | 'privacy') => {
  const articleID = type === 'register' 
    ? API_CONFIG.ARTICLE_IDS.REGISTER_ARTICLE 
    : API_CONFIG.ARTICLE_IDS.PRIVACY_ARTICLE
  
  uni.navigateTo({
    url: `/pages/article/index?articleID=${articleID}`
  })
}

// 跳转注册页面
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/index'
  })
}

// 处理登录
const handleLogin = async () => {
  const isPhoneValid = validatePhone()
  const isPasswordValid = validatePassword()
  
  if (!isPhoneValid || !isPasswordValid) {
    return
  }
  
  if (!isAgreed.value) {
    uni.showToast({ title: '请先阅读并同意相关协议', icon: 'none' })
    return
  }
  
  const deviceID = getDeviceID()
  if (!deviceID) {
    uni.showToast({ title: '设备信息异常，请重启应用', icon: 'none' })
    return
  }
  
  isLoading.value = true
  
  try {
    uni.showLoading({ title: '登录中...' })
    
    const result = await request<{
      memberID: string
      sessionID: string
      name: string
    }>('/memberLogin', {
      siteID: API_CONFIG.SITE_ID,
      deviceID,
      loginName: loginName.value.trim(),
      password: password.value
    })
    
    uni.setStorageSync(STORAGE_KEYS.SESSION_ID, result.sessionID)
    uni.setStorageSync(STORAGE_KEYS.MEMBER_ID, result.memberID)
    
    uni.hideLoading()
    uni.showToast({ title: '登录成功', icon: 'success' })
    
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/home/index' })
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background-color: #ffffff;
  overflow: hidden;
}

.login-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

/* 左侧品牌区域 */
.brand-section {
  width: 45%;
  height: 100%;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-content {
  text-align: center;
  color: #ffffff;
}

.brand-logo {
  font-size: 72rpx;
  margin-bottom: 20rpx;
}

.brand-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.brand-subtitle {
  display: block;
  font-size: 20rpx;
  opacity: 0.9;
}

/* 右侧表单区域 */
.form-section {
  width: 55%;
  height: 100%;
  background-color: #ffffff;
}

.form-container {
  padding: 24rpx 32rpx;
  max-width: 600rpx;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.form-header {
  margin-bottom: 24rpx;
  flex-shrink: 0;
}

.form-title {
  display: block;
  font-size: 24rpx;
  font-weight: bold;
  color: #333333;
}

.form-subtitle {
  display: block;
  font-size: 14rpx;
  color: #999999;
  margin-top: 6rpx;
}

.form-item {
  margin-bottom: 16rpx;
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  height: 50rpx;
}

.input-icon {
  font-size: 20rpx;
  margin-right: 12rpx;
}

.form-input {
  flex: 1;
  font-size: 20rpx;
  color: #333333;
}

.show-password {
  font-size: 20rpx;
  padding: 8rpx;
}

.error-text {
  display: block;
  font-size: 18rpx;
  color: #FF3B30;
  margin-top: 4rpx;
  padding-left: 12rpx;
}

.agreement-section {
  margin: 10rpx 0;
  flex-shrink: 0;
}

.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
}

.checkbox {
  width: 18rpx;
  height: 18rpx;
  border: 1rpx solid #cccccc;
  border-radius: 6rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8rpx;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.checkbox-checked {
  background-color: #007AFF;
  border-color: #007AFF;
}

.checkbox-icon {
  font-size: 18rpx;
  color: #ffffff;
}

.agreement-text {
  flex: 1;
  font-size: 14rpx;
  color: #666666;
  line-height: 1.4;
}

.link {
  color: #007AFF;
}

.login-button {
  width: 100%;
  height: 42rpx;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  border-radius: 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  flex-shrink: 0;
}

.login-button[disabled] {
  opacity: 0.6;
}

.button-text {
  font-size: 16rpx;
  font-weight: bold;
  color: #ffffff;
}

.register-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8rpx;
  flex-shrink: 0;
}

.register-text {
  font-size: 16rpx;
  color: #999999;
}

.register-link {
  font-size: 16rpx;
  color: #007AFF;
  margin-left: 6rpx;
}
</style>
