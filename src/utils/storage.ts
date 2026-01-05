import { STORAGE_KEYS } from '@/config'

// 存储工具
export const storage = {
  // 设置存储
  set: (key: string, value: any): void => {
    try {
      const data = typeof value === 'string' ? value : JSON.stringify(value)
      uni.setStorageSync(key, data)
    } catch (e) {
      console.error('Storage set error:', e)
    }
  },
  
  // 获取存储
  get: <T = string>(key: string, defaultValue?: T): T | null => {
    try {
      const data = uni.getStorageSync(key)
      if (!data) return defaultValue || null
      
      try {
        return JSON.parse(data) as T
      } catch {
        return data as T
      }
    } catch (e) {
      console.error('Storage get error:', e)
      return defaultValue || null
    }
  },
  
  // 移除存储
  remove: (key: string): void => {
    try {
      uni.removeStorageSync(key)
    } catch (e) {
      console.error('Storage remove error:', e)
    }
  },
  
  // 清空存储
  clear: (): void => {
    try {
      uni.clearStorageSync()
    } catch (e) {
      console.error('Storage clear error:', e)
    }
  },
  
  // 获取设备ID
  getDeviceID: (): string | null => {
    return storage.get(STORAGE_KEYS.DEVICE_ID)
  },
  
  // 设置设备ID
  setDeviceID: (deviceID: string): void => {
    storage.set(STORAGE_KEYS.DEVICE_ID, deviceID)
  },
  
  // 获取会话ID
  getSessionID: (): string | null => {
    return storage.get(STORAGE_KEYS.SESSION_ID)
  },
  
  // 设置会话ID
  setSessionID: (sessionID: string): void => {
    storage.set(STORAGE_KEYS.SESSION_ID, sessionID)
  },
  
  // 获取会员ID
  getMemberID: (): string | null => {
    return storage.get(STORAGE_KEYS.MEMBER_ID)
  },
  
  // 设置会员ID
  setMemberID: (memberID: string): void => {
    storage.set(STORAGE_KEYS.MEMBER_ID, memberID)
  },
  
  // 是否首次启动
  isFirstLaunch: (): boolean => {
    return !storage.get(STORAGE_KEYS.DEVICE_ID)
  },
  
  // 获取注册协议ID
  getRegisterAgreementID: (): string | null => {
    return storage.get(STORAGE_KEYS.REGISTER_AGREEMENT_ID)
  },
  
  // 设置注册协议ID
  setRegisterAgreementID: (agreementID: string): void => {
    storage.set(STORAGE_KEYS.REGISTER_AGREEMENT_ID, agreementID)
  },
  
  // 获取隐私协议ID
  getPrivacyAgreementID: (): string | null => {
    return storage.get(STORAGE_KEYS.PRIVACY_AGREEMENT_ID)
  },
  
  // 设置隐私协议ID
  setPrivacyAgreementID: (agreementID: string): void => {
    storage.set(STORAGE_KEYS.PRIVACY_AGREEMENT_ID, agreementID)
  }
}
