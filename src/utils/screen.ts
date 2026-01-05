/**
 * 屏幕适配工具
 * 根据设备尺寸检测是否为横屏设备/平板
 */

export interface ScreenInfo {
  width: number
  height: number
  isLandscape: boolean
  isTablet: boolean
  pixelRatio: number
  screenType: 'phone' | 'tablet' | 'desktop'
}

/**
 * 获取屏幕信息
 */
export const getScreenInfo = (): ScreenInfo => {
  try {
    const systemInfo = uni.getSystemInfoSync()
    const width = systemInfo.windowWidth || systemInfo.screenWidth || 375
    const height = systemInfo.windowHeight || systemInfo.screenHeight || 667
    const pixelRatio = systemInfo.pixelRatio || 1
    
    // 判断是否横屏
    const isLandscape = width > height
    
    // 判断设备类型
    // 根据屏幕短边来判断，手机通常短边小于600px
    const shortSide = Math.min(width, height)
    const longSide = Math.max(width, height)
    
    let screenType: 'phone' | 'tablet' | 'desktop' = 'phone'
    let isTablet = false
    
    // 短边大于600px认为是平板或PC
    if (shortSide >= 600) {
      isTablet = true
      screenType = 'tablet'
    }
    
    // 短边大于900px认为是桌面设备
    if (shortSide >= 900) {
      screenType = 'desktop'
    }
    
    // 也可以通过平台判断
    const platform = (systemInfo.platform || '').toLowerCase()
    if (platform === 'windows' || platform === 'mac' || platform === 'linux') {
      screenType = 'desktop'
    }
    
    // 通过model判断iPad
    const model = (systemInfo.model || '').toLowerCase()
    if (model.includes('ipad') || model.includes('pad')) {
      isTablet = true
      if (screenType === 'phone') {
        screenType = 'tablet'
      }
    }
    
    return {
      width,
      height,
      isLandscape,
      isTablet,
      pixelRatio,
      screenType
    }
  } catch (e) {
    console.error('getScreenInfo error:', e)
    return {
      width: 375,
      height: 667,
      isLandscape: false,
      isTablet: false,
      pixelRatio: 1,
      screenType: 'phone'
    }
  }
}

/**
 * 判断是否应该使用横屏布局
 * 当屏幕是横向或是平板/桌面设备时使用横屏布局
 */
export const shouldUseLandscapeLayout = (): boolean => {
  const info = getScreenInfo()
  return info.isLandscape || info.isTablet || info.screenType !== 'phone'
}

/**
 * 根据屏幕尺寸计算适配值
 * @param baseValue 基础值(以375px宽度为基准)
 * @param minValue 最小值
 * @param maxValue 最大值
 */
export const adaptSize = (baseValue: number, minValue?: number, maxValue?: number): number => {
  const info = getScreenInfo()
  const scale = info.width / 375
  let result = baseValue * scale
  
  if (minValue !== undefined && result < minValue) {
    result = minValue
  }
  if (maxValue !== undefined && result > maxValue) {
    result = maxValue
  }
  
  return result
}

/**
 * 获取适合的内容区域宽度
 * 在大屏设备上限制内容宽度以获得更好的阅读体验
 */
export const getContentWidth = (): string => {
  const info = getScreenInfo()
  
  if (info.screenType === 'desktop') {
    return '1200rpx'
  }
  
  if (info.isTablet) {
    return '900rpx'
  }
  
  return '100%'
}
