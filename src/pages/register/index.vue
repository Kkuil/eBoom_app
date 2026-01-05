<template>
  <view class="register-container">
    <!-- 横屏布局：左侧品牌 + 右侧表单 -->
    <view class="register-layout">
      <!-- 左侧品牌区域 -->
      <view class="brand-section">
        <view class="brand-content">
          <view class="brand-logo">📚</view>
          <text class="brand-title">教育培训平台</text>
          <text class="brand-subtitle">开启学习新旅程</text>
        </view>
      </view>
      
      <!-- 右侧表单区域 -->
      <scroll-view class="form-section" scroll-y :show-scrollbar="false">
        <view class="form-container">
          <!-- 返回按钮 + 标题 -->
          <view class="form-header">
            <view class="back-button" @click="goBack">
              <text class="back-icon">←</text>
            </view>
            <text class="form-title">手机号注册</text>
          </view>
          
          <!-- 手机号 -->
          <view class="form-item">
            <view class="input-wrapper">
              <text class="input-icon">📱</text>
              <input 
                class="form-input"
                type="number"
                v-model="phone"
                placeholder="请输入手机号"
                maxlength="11"
                :adjust-position="true"
              />
            </view>
            <text v-if="phoneError" class="error-text">{{ phoneError }}</text>
          </view>
          
          <!-- 验证码 -->
          <view class="form-item">
            <view class="input-wrapper code-wrapper">
              <text class="input-icon">🔐</text>
              <input 
                class="form-input code-input"
                type="number"
                v-model="verifyCode"
                placeholder="请输入验证码"
                maxlength="6"
                :adjust-position="true"
              />
              <view 
                class="code-button" 
                :class="{ 'code-button-disabled': countdown > 0 || isSendingCode }"
                @click="sendVerifyCode"
              >
                <text class="code-button-text">
                  {{ countdown > 0 ? `${countdown}s后重发` : (isSendingCode ? '发送中...' : '获取验证码') }}
                </text>
              </view>
            </view>
            <text v-if="codeError" class="error-text">{{ codeError }}</text>
          </view>
          
          <!-- 协议勾选 -->
          <view class="agreement-section">
            <view class="checkbox-wrapper" @click="toggleAgreement">
              <view :class="['checkbox', { 'checkbox-checked': isAgreed }]">
                <text v-if="isAgreed" class="checkbox-icon">✓</text>
              </view>
              <view class="agreement-text">
                <text>注册前请仔细阅读</text>
                <text class="link" @click.stop="goToArticle('register')">《注册协议》</text>
                <text>和</text>
                <text class="link" @click.stop="goToArticle('privacy')">《隐私协议》</text>
              </view>
            </view>
          </view>
          
          <!-- 注册按钮 -->
          <button 
            class="register-button" 
            :disabled="isLoading"
            @click="handleRegister"
          >
            <text class="button-text">{{ isLoading ? '注册中...' : '立即注册' }}</text>
          </button>
          
          <!-- 登录链接 -->
          <view class="login-section">
            <text class="login-text">已有账号？</text>
            <text class="login-link" @click="goBack">立即登录</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { API_CONFIG, STORAGE_KEYS } from '@/config'

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

// 表单数据
const phone = ref('')
const verifyCode = ref('')
const isAgreed = ref(false)
const isLoading = ref(false)
const isSendingCode = ref(false)
const countdown = ref(0)

// 错误信息
const phoneError = ref('')
const codeError = ref('')

// 倒计时定时器
let countdownTimer: number | null = null

// 组件卸载时清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/login/index' })
    }
  })
}

// 验证手机号
const validatePhone = (): boolean => {
  const phoneValue = phone.value.trim()
  if (!phoneValue) {
    phoneError.value = '请输入手机号'
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(phoneValue)) {
    phoneError.value = '请输入正确的手机号'
    return false
  }
  phoneError.value = ''
  return true
}

// 验证验证码
const validateCode = (): boolean => {
  const codeValue = verifyCode.value.trim()
  if (!codeValue) {
    codeError.value = '请输入验证码'
    return false
  }
  if (!/^\d{4,6}$/.test(codeValue)) {
    codeError.value = '请输入正确的验证码'
    return false
  }
  codeError.value = ''
  return true
}

// 发送验证码
const sendVerifyCode = async () => {
  if (countdown.value > 0 || isSendingCode.value) {
    return
  }
  
  if (!validatePhone()) {
    return
  }
  
  const deviceID = getDeviceID()
  if (!deviceID) {
    uni.showToast({ title: '设备信息异常，请重启应用', icon: 'none' })
    return
  }
  
  isSendingCode.value = true
  
  try {
    // 调用发送验证码接口
    // sendType: 0-注册验证码
    await request('/sendSMSVerifyCode', {
      siteID: API_CONFIG.SITE_ID,
      deviceID,
      phone: phone.value.trim(),
      sendType: 0
    })
    
    uni.showToast({ title: '验证码已发送', icon: 'success' })
    
    // 开始60秒倒计时
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        if (countdownTimer) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }
      }
    }, 1000) as unknown as number
  } catch (error) {
    console.error('Send verify code error:', error)
  } finally {
    isSendingCode.value = false
  }
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

// 处理注册
const handleRegister = async () => {
  // 验证表单
  const isPhoneValid = validatePhone()
  const isCodeValid = validateCode()
  
  if (!isPhoneValid || !isCodeValid) {
    return
  }
  
  if (!isAgreed.value) {
    uni.showToast({
      title: '请先阅读并同意相关协议',
      icon: 'none'
    })
    return
  }
  
  const deviceID = getDeviceID()
  if (!deviceID) {
    uni.showToast({ title: '设备信息异常，请重启应用', icon: 'none' })
    return
  }
  
  isLoading.value = true
  
  try {
    uni.showLoading({ title: '注册中...' })
    
    const registerAgreementID = uni.getStorageSync(STORAGE_KEYS.REGISTER_AGREEMENT_ID) || undefined
    const privacyAgreementID = uni.getStorageSync(STORAGE_KEYS.PRIVACY_AGREEMENT_ID) || undefined
    
    // 使用手机号验证码注册接口
    const result = await request<{ sessionID: string; memberID: string }>('/memberPhoneRegister', {
      siteID: API_CONFIG.SITE_ID,
      deviceID,
      phone: phone.value.trim(),
      verifyCode: verifyCode.value.trim(),
      registerAgreementID,
      privacyAgreementID
    })
    
    // 保存登录信息
    uni.setStorageSync(STORAGE_KEYS.SESSION_ID, result.sessionID)
    uni.setStorageSync(STORAGE_KEYS.MEMBER_ID, result.memberID)
    
    uni.hideLoading()
    uni.showToast({ title: '注册成功', icon: 'success' })
    
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/home/index' })
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    console.error('Register error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  width: 100vw;
  height: 100vh;
  background-color: #ffffff;
  overflow: hidden;
}

.register-layout {
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
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  flex-shrink: 0;
}

.back-button {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12rpx;
}

.back-icon {
  font-size: 24rpx;
  color: #333333;
}

.form-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #333333;
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

/* 验证码样式 */
.code-wrapper {
  padding-right: 8rpx;
}

.code-input {
  flex: 1;
}

.code-button {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  padding: 8rpx 12rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.code-button-disabled {
  opacity: 0.6;
}

.code-button-text {
  font-size: 14rpx;
  color: #ffffff;
  white-space: nowrap;
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

.register-button {
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

.register-button[disabled] {
  opacity: 0.6;
}

.button-text {
  font-size: 16rpx;
  font-weight: bold;
  color: #ffffff;
}

.login-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8rpx;
  flex-shrink: 0;
}

.login-text {
  font-size: 16rpx;
  color: #999999;
}

.login-link {
  font-size: 16rpx;
  color: #007AFF;
  margin-left: 6rpx;
}
</style>
