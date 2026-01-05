<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { api } from '@/utils/request'
import { API_CONFIG } from '@/config'

// 当前App版本
const APP_VERSION = '0.1'

// 静默检查版本更新
const checkVersionSilently = async () => {
  try {
    const result = await api.getVersionDetail({
      siteID: API_CONFIG.SITE_ID
    })
    
    if (result.data) {
      const serverVersion = result.data.code
      
      // 比较版本号
      if (compareVersion(serverVersion, APP_VERSION) > 0) {
        // 服务器版本更新，显示更新提示
        const fileURL = result.data.fileURL
        const description = result.data.tipsUpgrade || result.data.description || '有新版本可用，建议更新'
        
        uni.showModal({
          title: `发现新版本 ${serverVersion}`,
          content: description,
          confirmText: '立即更新',
          cancelText: '稍后再说',
          success: (res) => {
            if (res.confirm && fileURL) {
              // #ifdef APP-PLUS
              plus.runtime.openURL(fileURL)
              // #endif
            }
          }
        })
      }
    }
  } catch (error) {
    // 静默失败，不显示错误
    console.log('版本检查失败:', error)
  }
}

// 比较版本号（返回 1: a>b, 0: a=b, -1: a<b）
const compareVersion = (a: string, b: string): number => {
  const partsA = a.split('.').map(Number)
  const partsB = b.split('.').map(Number)
  
  const len = Math.max(partsA.length, partsB.length)
  
  for (let i = 0; i < len; i++) {
    const numA = partsA[i] || 0
    const numB = partsB[i] || 0
    
    if (numA > numB) return 1
    if (numA < numB) return -1
  }
  
  return 0
}

onLaunch(() => {
  console.log('App Launch')
  
  // 启动时静默检查版本
  setTimeout(() => {
    checkVersionSilently()
  }, 3000) // 延迟3秒检查，避免影响启动速度
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 全局样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  background-color: #f8f8f8;
  height: 100%;
}

/* 安全区域适配 */
.safe-area-inset-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.safe-area-inset-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 富文本样式 */
.rich-text-content {
  line-height: 1.8;
  word-break: break-all;
}

.rich-text-content p {
  margin: 10px 0;
}

.rich-text-content img {
  max-width: 100%;
  height: auto;
}

/* 按钮样式 */
.btn-primary {
  background-color: #007AFF;
  color: #ffffff;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  text-align: center;
}

.btn-primary:active {
  background-color: #0056b3;
}

/* 输入框样式 */
.input-field {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  width: 100%;
  box-sizing: border-box;
}

/* 链接样式 */
.link {
  color: #007AFF;
  text-decoration: underline;
}
</style>