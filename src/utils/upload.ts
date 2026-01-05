import { UPLOAD_CONFIG } from '@/config'

// 上传响应接口
export interface UploadResponse {
  body: {
    filesID: string
    filesURL: string
    url: string
  }
  header: {
    code: number
    msg: string
  }
}

// 本地文件缓存键前缀
const FILE_CACHE_PREFIX = 'file_cache_'

/**
 * 获取文件扩展名
 */
export const getFileExtension = (fileName: string): string => {
  const lastDot = fileName.lastIndexOf('.')
  if (lastDot === -1) return ''
  return fileName.substring(lastDot + 1).toLowerCase()
}

/**
 * 获取不带扩展名的文件名
 */
export const getFileNameWithoutExtension = (fileName: string): string => {
  const lastDot = fileName.lastIndexOf('.')
  if (lastDot === -1) return fileName
  return fileName.substring(0, lastDot)
}

/**
 * 从路径中提取文件名
 */
export const extractFileName = (filePath: string): string => {
  const lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'))
  return lastSlash === -1 ? filePath : filePath.substring(lastSlash + 1)
}

/**
 * 上传单个文件到COS
 */
export const uploadFileToCOS = (filePath: string): Promise<UploadResponse['body']> => {
  return new Promise((resolve, reject) => {
    const fullFileName = extractFileName(filePath)
    const name = getFileNameWithoutExtension(fullFileName)
    const suffix = getFileExtension(fullFileName)
    
    uni.showLoading({
      title: '上传中...',
      mask: true
    })
    
    uni.uploadFile({
      url: UPLOAD_CONFIG.UPLOAD_URL,
      filePath: filePath,
      name: 'file',
      formData: {
        outToken: UPLOAD_CONFIG.OUT_TOKEN,
        fileBucketID: UPLOAD_CONFIG.FILE_BUCKET_ID,
        applicationID: UPLOAD_CONFIG.APPLICATION_ID,
        companyID: UPLOAD_CONFIG.COMPANY_ID,
        siteID: UPLOAD_CONFIG.SITE_ID,
        fileName: fullFileName,
        name: name,
        suffix: suffix
      },
      success: (res) => {
        uni.hideLoading()
        
        try {
          const response: UploadResponse = typeof res.data === 'string' 
            ? JSON.parse(res.data) 
            : res.data
          
          if (response.header.code === 0) {
            // 上传成功后，保存文件到本地缓存
            saveFileToLocal(response.body.url, filePath)
            resolve(response.body)
          } else {
            uni.showToast({
              title: '上传失败',
              icon: 'none'
            })
            reject(new Error(response.header.msg || '上传失败'))
          }
        } catch (e) {
          uni.showToast({
            title: '解析响应失败',
            icon: 'none'
          })
          reject(new Error('解析响应失败'))
        }
      },
      fail: (err) => {
        uni.hideLoading()
        uni.showToast({
          title: '网络错误，上传失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

/**
 * 保存文件URL到本地缓存映射
 */
export const saveFileToLocal = async (remoteUrl: string, localPath: string): Promise<void> => {
  try {
    // 存储URL到本地路径的映射
    const cacheKey = FILE_CACHE_PREFIX + encodeURIComponent(remoteUrl)
    uni.setStorageSync(cacheKey, localPath)
    
    // 同时下载文件到本地存储（如果是网络文件）
    if (localPath.startsWith('http')) {
      downloadAndCacheFile(remoteUrl)
    }
  } catch (e) {
    console.error('保存文件缓存失败:', e)
  }
}

/**
 * 下载并缓存文件到本地
 */
export const downloadAndCacheFile = (remoteUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 先检查本地是否已有缓存
    const localPath = getLocalFilePath(remoteUrl)
    if (localPath) {
      resolve(localPath)
      return
    }
    
    uni.downloadFile({
      url: remoteUrl,
      success: (res) => {
        if (res.statusCode === 200 && res.tempFilePath) {
          // 保存到本地文件系统
          const savedFilePath = res.tempFilePath
          const cacheKey = FILE_CACHE_PREFIX + encodeURIComponent(remoteUrl)
          
          // 尝试保存到持久化存储
          // #ifdef APP-PLUS
          const targetPath = `_doc/cached_files/${Date.now()}_${extractFileName(remoteUrl)}`
          uni.saveFile({
            tempFilePath: savedFilePath,
            success: (saveRes) => {
              uni.setStorageSync(cacheKey, saveRes.savedFilePath)
              resolve(saveRes.savedFilePath)
            },
            fail: () => {
              // 保存失败，使用临时路径
              uni.setStorageSync(cacheKey, savedFilePath)
              resolve(savedFilePath)
            }
          })
          // #endif
          
          // #ifndef APP-PLUS
          uni.setStorageSync(cacheKey, savedFilePath)
          resolve(savedFilePath)
          // #endif
        } else {
          reject(new Error('下载失败'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 获取本地缓存的文件路径
 */
export const getLocalFilePath = (remoteUrl: string): string | null => {
  try {
    const cacheKey = FILE_CACHE_PREFIX + encodeURIComponent(remoteUrl)
    const localPath = uni.getStorageSync(cacheKey)
    
    if (localPath) {
      // 验证文件是否存在
      // #ifdef APP-PLUS
      try {
        const fs = uni.getFileSystemManager()
        fs.accessSync(localPath)
        return localPath
      } catch {
        // 文件不存在，清除缓存
        uni.removeStorageSync(cacheKey)
        return null
      }
      // #endif
      
      // #ifndef APP-PLUS
      return localPath
      // #endif
    }
    
    return null
  } catch (e) {
    return null
  }
}

/**
 * 智能获取文件路径 - 优先使用本地缓存
 */
export const getSmartFilePath = async (remoteUrl: string): Promise<string> => {
  if (!remoteUrl) return ''
  
  // 如果已经是本地路径，直接返回
  if (!remoteUrl.startsWith('http')) {
    return remoteUrl
  }
  
  // 检查本地缓存
  const localPath = getLocalFilePath(remoteUrl)
  if (localPath) {
    return localPath
  }
  
  // 本地没有，尝试下载并缓存
  try {
    const cachedPath = await downloadAndCacheFile(remoteUrl)
    return cachedPath
  } catch {
    // 下载失败，返回原始URL
    return remoteUrl
  }
}

/**
 * 选择图片并上传
 */
export const chooseAndUploadImage = (count: number = 1): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        try {
          const uploadedUrls: string[] = []
          
          for (const tempPath of res.tempFilePaths) {
            const result = await uploadFileToCOS(tempPath)
            uploadedUrls.push(result.url)
          }
          
          resolve(uploadedUrls)
        } catch (err) {
          reject(err)
        }
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.includes('cancel')) {
          // 用户取消选择，不提示错误
          resolve([])
        } else {
          reject(err)
        }
      }
    })
  })
}

/**
 * 选择视频并上传
 */
export const chooseAndUploadVideo = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    uni.chooseVideo({
      sourceType: ['album', 'camera'],
      compressed: true,
      maxDuration: 60,
      success: async (res) => {
        try {
          const result = await uploadFileToCOS(res.tempFilePath)
          resolve(result.url)
        } catch (err) {
          reject(err)
        }
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.includes('cancel')) {
          resolve('')
        } else {
          reject(err)
        }
      }
    })
  })
}

/**
 * 选择并上传音频文件（通过文件选择器）
 */
export const chooseAndUploadAudio = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    // App端使用文件选择
    plus.io.resolveLocalFileSystemURL('_downloads/', (entry) => {
      uni.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['mp3', 'wav', 'm4a', 'aac', 'ogg'],
        success: async (res) => {
          try {
            const file = res.tempFiles[0]
            const result = await uploadFileToCOS(file.path)
            resolve(result.url)
          } catch (err) {
            reject(err)
          }
        },
        fail: (err) => {
          if (err.errMsg && err.errMsg.includes('cancel')) {
            resolve('')
          } else {
            reject(err)
          }
        }
      })
    }, () => {
      // 回退方案
      uni.showToast({
        title: '暂不支持选择音频文件',
        icon: 'none'
      })
      resolve('')
    })
    // #endif
    
    // #ifdef H5
    // H5端使用input file
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'audio/*'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (file) {
        try {
          // 创建临时URL
          const tempPath = URL.createObjectURL(file)
          const result = await uploadFileToCOS(tempPath)
          resolve(result.url)
        } catch (err) {
          reject(err)
        }
      }
    }
    input.click()
    // #endif
    
    // #ifdef MP-WEIXIN
    // 微信小程序使用录音或从聊天记录选择
    uni.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['mp3', 'wav', 'm4a', 'aac'],
      success: async (res) => {
        try {
          const file = res.tempFiles[0]
          const result = await uploadFileToCOS(file.path)
          resolve(result.url)
        } catch (err) {
          reject(err)
        }
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.includes('cancel')) {
          resolve('')
        } else {
          reject(err)
        }
      }
    })
    // #endif
  })
}

/**
 * 清除文件缓存
 */
export const clearFileCache = (): void => {
  try {
    const storageInfo = uni.getStorageInfoSync()
    const keys = storageInfo.keys || []
    
    keys.forEach(key => {
      if (key.startsWith(FILE_CACHE_PREFIX)) {
        uni.removeStorageSync(key)
      }
    })
  } catch (e) {
    console.error('清除文件缓存失败:', e)
  }
}
