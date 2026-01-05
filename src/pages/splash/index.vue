<template>
  <view class="splash-container">
    <view class="splash-content">
      <view class="splash-layout">
        <view class="logo-container">
          <view class="logo-icon">📚</view>
          <text class="logo-text">eBoom</text>
          <text class="logo-subtitle">教育培训平台</text>
        </view>
        <view class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">{{ loadingText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loadingText = ref('正在初始化...')

// 关闭原生启动屏幕
const closeSplashScreen = () => {
  // #ifdef APP-PLUS
  try {
    plus.navigator.closeSplashscreen()
  } catch (e) {
    console.log('closeSplashscreen error:', e)
  }
  // #endif
}

// 导航到下一页
const navigateNext = (isFirst: boolean) => {
  uni.redirectTo({
    url: `/pages/ad/index?isFirst=${isFirst ? '1' : '0'}`,
    fail: (err) => {
      console.error('Navigate failed:', err)
      // 如果跳转失败，尝试使用reLaunch
      uni.reLaunch({
        url: `/pages/ad/index?isFirst=${isFirst ? '1' : '0'}`
      })
    }
  })
}

// 检查是否首次启动
const isFirstLaunch = (): boolean => {
  try {
    const deviceID = uni.getStorageSync('deviceID')
    return !deviceID
  } catch (e) {
    return true
  }
}

// 初始化设备信息
const initDeviceInfo = async (): Promise<void> => {
  try {
    const systemInfo = uni.getSystemInfoSync()
    
    // 判断设备类型
    let category = 3 // 默认手机
    const platform = (systemInfo.platform || '').toLowerCase()
    const model = (systemInfo.model || '').toLowerCase()
    
    if (platform === 'windows' || platform === 'mac' || platform === 'linux') {
      category = 1 // PC
    } else if (model.includes('ipad') || model.includes('pad')) {
      category = 2 // PAD
    }
    
    // 设备名称
    const deviceName = systemInfo.model || '未知设备'
    
    // 操作系统信息
    const osName = `${systemInfo.osName || systemInfo.platform || 'Unknown'} ${systemInfo.osVersion || ''}`
    
    // 制造商
    let company = 'Unknown'
    if (systemInfo.brand) {
      company = systemInfo.brand
    } else if (platform === 'ios') {
      company = 'Apple'
    }
    
    // MAC地址
    const mac = systemInfo.deviceId || 'unknown-device-id'
    
    // 调用接口获取deviceID
    const result = await new Promise<any>((resolve, reject) => {
      const params = {
        applicationID: 'ff8080819ac6039e019ac8172ff100b6',
        siteID: 'ff8080819b535a05019b54b1f4240044',
        name: deviceName,
        shortName: deviceName,
        category: category,
        OSname: osName,
        company: company,
        model: systemInfo.model || 'Unknown',
        mac: mac,
        udid: systemInfo.deviceId || ''
      }
      
      // 构建URL参数
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent((params as any)[key])}`)
        .join('&')
      
      uni.request({
        url: `https://api.eboom.com.cn/interface-server/api/submitDeviceInfo?${queryString}`,
        method: 'GET',
        timeout: 10000, // 10秒超时
        success: (res: any) => {
          if (res.data && res.data.header && res.data.header.code === 0) {
            resolve(res.data.body)
          } else {
            reject(new Error('API error'))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
    
    // 保存deviceID
    if (result && result.deviceID) {
      uni.setStorageSync('deviceID', result.deviceID)
    }
  } catch (error) {
    console.error('Init device error:', error)
    // 即使失败也生成一个临时ID继续
    const tempID = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    uni.setStorageSync('deviceID', tempID)
  }
}

onMounted(async () => {
  // 先关闭原生启动屏
  closeSplashScreen()
  
  // 设置超时保护，最多等待15秒
  const timeoutId = setTimeout(() => {
    console.log('Timeout, force navigate')
    navigateNext(true)
  }, 15000)
  
  try {
    // 检查是否首次启动
    const firstLaunch = isFirstLaunch()
    
    if (firstLaunch) {
      loadingText.value = '正在获取设备信息...'
      // 首次启动，获取设备ID
      await initDeviceInfo()
      loadingText.value = '初始化完成'
      
      clearTimeout(timeoutId)
      // 延迟后跳转到广告页
      setTimeout(() => {
        navigateNext(true)
      }, 500)
    } else {
      loadingText.value = '欢迎回来'
      clearTimeout(timeoutId)
      // 非首次启动，直接跳转广告页
      setTimeout(() => {
        navigateNext(false)
      }, 500)
    }
  } catch (error) {
    console.error('Splash error:', error)
    loadingText.value = '初始化失败，请重试'
    
    clearTimeout(timeoutId)
    // 即使失败也尝试继续
    setTimeout(() => {
      navigateNext(true)
    }, 1000)
  }
})
</script>

<style scoped>
.splash-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  overflow: hidden;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.splash-layout {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 80rpx;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.logo-text {
  font-size: 56rpx;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 2rpx;
}

.logo-subtitle {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 8rpx;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 40rpx;
  border-left: 1rpx solid rgba(255, 255, 255, 0.3);
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
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
  color: rgba(255, 255, 255, 0.9);
  margin-top: 12rpx;
}
</style>
