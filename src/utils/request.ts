import { API_CONFIG } from '@/config'

// API响应接口
export interface ApiResponse<T = any> {
  body: T
  header: {
    code: number
    msg: string
  }
}

// 错误信息转换（将开发信息转为用户友好信息）
const getErrorMessage = (code: number, msg: string): string => {
  // 根据错误码返回用户友好的错误信息
  const errorMessages: Record<number, string> = {
    1: '操作失败，请稍后重试',
    2: '参数错误，请检查输入信息',
    3: '账号或密码错误，请重新输入',
    4: '账号已存在，请直接登录',
    5: '账号不存在，请先注册',
    6: '验证码错误，请重新获取',
    7: '网络连接失败，请检查网络',
    8: '服务暂时不可用，请稍后再试',
    9: '登录已过期，请重新登录',
    10: '权限不足，无法执行此操作'
  }
  
  return errorMessages[code] || '操作失败，请稍后重试'
}

// 显示错误提示
const showError = (message: string) => {
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}

// 请求封装
export const request = <T = any>(
  url: string,
  method: 'GET' | 'POST' = 'GET',
  data?: Record<string, any>,
  showLoading: boolean = true
): Promise<T> => {
  return new Promise((resolve, reject) => {
    if (showLoading) {
      uni.showLoading({
        title: '加载中...',
        mask: true
      })
    }
    
    // 构建完整URL
    let fullUrl = `${API_CONFIG.BASE_URL}${url}`
    
    // GET请求参数拼接
    if (method === 'GET' && data) {
      const params = Object.keys(data)
        .filter(key => data[key] !== undefined && data[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
        .join('&')
      if (params) {
        fullUrl += `?${params}`
      }
    }
    
    uni.request({
      url: fullUrl,
      method,
      data: method === 'POST' ? data : undefined,
      header: {
        'Content-Type': method === 'POST' ? 'application/json' : 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (showLoading) {
          uni.hideLoading()
        }
        
        const response = res.data as ApiResponse<T>
        
        if (response.header.code === 0) {
          resolve(response.body)
        } else {
          const errorMsg = getErrorMessage(response.header.code, response.header.msg)
          showError(errorMsg)
          reject(new Error(errorMsg))
        }
      },
      fail: (err) => {
        if (showLoading) {
          uni.hideLoading()
        }
        
        const errorMsg = '网络连接失败，请检查网络'
        showError(errorMsg)
        reject(new Error(errorMsg))
      }
    })
  })
}

// API接口定义
export const api = {
  // 提交设备信息
  submitDeviceInfo: (params: {
    applicationID: string
    siteID: string
    name: string
    shortName: string
    category: number
    OSname: string
    company: string
    model: string
    mac: string
    phoneNumber?: string
    udid?: string
    imei?: string
    pushDeviceID?: string
  }): Promise<{ deviceID: string }> => {
    return request('/submitDeviceInfo', 'GET', params)
  },
  
  // 获取文章详情
  getArticleSimpleDetail: (articleID: string): Promise<{
    apiArticleDto: {
      articleID: string
      title: string
      contentText: string
      createdDateStr: string
      createdTimeStr: string
      subTitle?: string
      description?: string
      faceImage?: string
      listImage?: string
    }
  }> => {
    return request('/getArticleSimpleDetail', 'GET', { articleID })
  },
  
  // 签署协议
  signOneBlankAgreement: (params: {
    agreementDefineID: string
    deviceID: string
  }): Promise<{ agreementID: string }> => {
    return request('/signOneBlankAgreement', 'GET', params)
  },
  
  // 会员登录
  memberLogin: (params: {
    siteID: string
    deviceID: string
    loginName: string
    password: string
  }): Promise<{
    memberID: string
    sessionID: string
    name: string
    shortName: string
    phone: string
    avatarURL?: string
    rankName: string
    majorName: string
    loginName: string
  }> => {
    return request('/memberLogin', 'GET', params)
  },
  
  // 会员注册
  memberRegister: (params: {
    siteID: string
    deviceID: string
    loginName: string
    password: string
    phone: string
    registerAgreementID?: string
    privacyAgreementID?: string
  }): Promise<{
    memberID: string
    sessionID: string
  }> => {
    return request('/memberRegister', 'GET', params)
  },
  
  // 获取会员个人详情
  getMemberDetail: (params: {
    sessionID: string
    memberID: string
  }): Promise<{
    avatarURL: string | null
    birthdayStr: string | null
    email: string | null
    idNumber: string | null
    lastLoginTime: string | null
    loginName: string
    shortName: string
    titleName: string | null
    name: string
    phone: string
    recommendCode: string | null
    rankName: string | null
    majorName: string | null
    memberIsVIP: number
    levelNumber: number
  }> => {
    return request('/getOneMemberDetail', 'GET', params)
  },
  
  // 更新会员头像
  updateMemberAvatar: (params: {
    sessionID: string
    avatarURL: string
  }): Promise<{ updateTime: number }> => {
    return request('/updateMyMemberAvatar', 'GET', params)
  },
  
  // 更新会员用户名
  updateMemberShortName: (params: {
    sessionID: string
    shortName: string
  }): Promise<{ updateTime: number }> => {
    return request('/updateMyMemberShortname', 'GET', params)
  },
  
  // 更新会员性别
  updateMemberTitle: (params: {
    sessionID: string
    titleID: string
  }): Promise<{ updateTime: number }> => {
    return request('/updateMyMemberTitle', 'GET', params)
  },
  
  // 更新会员生日
  updateMemberBirthday: (params: {
    sessionID: string
    birthday: number // 时间戳
  }): Promise<{ updateTime: number }> => {
    return request('/updateMyMemberBirthday', 'GET', params)
  },
  
  // 获取版本详情
  getVersionDetail: (params: {
    siteID: string
  }): Promise<{
    data: {
      versionID: string
      code: string
      name: string
      description: string
      tipsUpgrade: string
      fileURL: string | null
      codeURL: string | null
      publishURL: string | null
      logoURL: string | null
      isDefaultUpgrade: number
      isNoLogin: number
      status: number
      appType: number
      modifiedTimeStr: string
    }
  }> => {
    return request('/getVersionDetail', 'GET', params)
  },
  
  // 获取导航文章列表（常见问题）
  getNavigatorArticleList: (params: {
    navigatorID: string
    currentPage: number
    pageNumber: number
  }): Promise<{
    data: {
      rows: Array<{
        articleID: string
        title: string
        description: string
        createdDateStr: string
        subTitle: string
        listImage: string | null
      }>
      total: number
      hasNextPage: boolean
      currentPage: number
    }
  }> => {
    return request('/getNavigatorSimpleArticleList', 'GET', params)
  },
  
  // 提交意见反馈
  submitFeed: (params: {
    sessionID: string
    title: string
    attachmentList: string
  }): Promise<{ feedID: string }> => {
    return request('/submitOneFeed', 'GET', params)
  },
  
  // 获取我的反馈列表
  getMyFeedList: (params: {
    sessionID: string
    currentPage: number
    pageNumber: number
  }): Promise<{
    data: {
      rows: Array<{
        feedID: string
        title: string
        name: string
        content: string
        submitTimeStr: string
        attachmentList: string[]
        lastFeedBack: string | null
        lastFeedBackTimeStr: string | null
        memberName: string
        memberShortName: string
      }>
      total: number
      hasNextPage: boolean
      currentPage: number
    }
  }> => {
    return request('/getMyFeedList', 'GET', params)
  }
}
