import { API_CONFIG, DEVICE_CATEGORY } from '@/config'
import { api } from './request'
import { storage } from './storage'

// 获取设备信息
export interface DeviceInfo {
  name: string
  shortName: string
  category: number
  OSname: string
  company: string
  model: string
  mac: string
  udid?: string
}

// 获取系统信息
export const getDeviceInfo = (): DeviceInfo => {
  const systemInfo = uni.getSystemInfoSync()
  
  // 判断设备类型
  let category = DEVICE_CATEGORY.PHONE
  const platform = systemInfo.platform?.toLowerCase() || ''
  const model = systemInfo.model?.toLowerCase() || ''
  
  if (platform === 'windows' || platform === 'mac' || platform === 'linux') {
    category = DEVICE_CATEGORY.PC
  } else if (model.includes('ipad') || model.includes('pad')) {
    category = DEVICE_CATEGORY.PAD
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
  
  // MAC地址（UniApp无法直接获取，使用UUID代替）
  const mac = systemInfo.deviceId || generateUUID()
  
  return {
    name: deviceName,
    shortName: deviceName,
    category,
    OSname: osName,
    company,
    model: systemInfo.model || 'Unknown',
    mac,
    udid: systemInfo.deviceId
  }
}

// 生成UUID
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 初始化设备信息并获取deviceID
export const initDevice = async (): Promise<string> => {
  // 检查本地是否已有deviceID
  const cachedDeviceID = storage.getDeviceID()
  if (cachedDeviceID) {
    return cachedDeviceID
  }
  
  // 获取设备信息
  const deviceInfo = getDeviceInfo()
  
  try {
    // 调用接口获取deviceID
    const result = await api.submitDeviceInfo({
      applicationID: API_CONFIG.APPLICATION_ID,
      siteID: API_CONFIG.SITE_ID,
      ...deviceInfo
    })
    
    // 保存deviceID到本地
    storage.setDeviceID(result.deviceID)
    
    return result.deviceID
  } catch (error) {
    console.error('Init device error:', error)
    throw error
  }
}
