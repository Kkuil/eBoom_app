// API配置
export const API_CONFIG = {
  // 接口前缀
  BASE_URL: 'https://api.eboom.com.cn/interface-server/api',
  
  // 应用ID
  APPLICATION_ID: 'ff8080819ac6039e019ac8172ff100b6',
  
  // 站点ID
  SITE_ID: 'ff8080819b535a05019b54b1f4240044',
  
  // 协议ID
  AGREEMENT_IDS: {
    // 注册协议定义ID
    REGISTER: 'ff8080819b54efc0019b5e6dd89301ed',
    // 隐私协议定义ID
    PRIVACY: 'ff8080819b54efc0019b5e6cd61701eb'
  },
  
  // 文章ID
  ARTICLE_IDS: {
    // 注册协议文章ID
    REGISTER_ARTICLE: 'ff8080819b54efc0019b5e5eb7f201e9',
    // 隐私协议文章ID
    PRIVACY_ARTICLE: 'ff8080819b54efc0019b5e6080f701ea'
  }
}

// 存储键名
export const STORAGE_KEYS = {
  DEVICE_ID: 'deviceID',
  SESSION_ID: 'sessionID',
  MEMBER_ID: 'memberID',
  STUDENT_ID: 'studentID',
  IS_FIRST_LAUNCH: 'isFirstLaunch',
  REGISTER_AGREEMENT_ID: 'registerAgreementID',
  PRIVACY_AGREEMENT_ID: 'privacyAgreementID'
}

// 设备类型
export const DEVICE_CATEGORY = {
  PC: 1,
  PAD: 2,
  PHONE: 3,
  SMART_DEVICE: 4
}

// 作品相关常量
export const STORY_CONFIG = {
  // 功能类型
  FUNCTION_TYPE: 1,
  // 排序
  ORDER_SEQ: 1,
  // 默认分页
  DEFAULT_PAGE_SIZE: 10,
  // 标题最大长度
  MAX_TITLE_LENGTH: 50,
  // 内容最大长度
  MAX_CONTENT_LENGTH: 500
}

// 文件上传配置
export const UPLOAD_CONFIG = {
  // 上传接口
  UPLOAD_URL: 'https://api.eboom.com.cn/interface-server/api/uploadOneFileToCOS.json',
  // 认证Token
  OUT_TOKEN: '86F34608DA5BA352A5F8BAB331E21C8A',
  // 文件存储桶ID
  FILE_BUCKET_ID: 'ff8080819b21179f019b2545d8ae0179',
  // 应用ID
  APPLICATION_ID: 'ff8080819ac6039e019ac8172ff100b6',
  // 公司ID
  COMPANY_ID: 'ff8080819ac6039e019ac81652a700b2',
  // 站点ID
  SITE_ID: 'ff8080819ac6039e019ac81765440111'
}

// 性别定义
export const TITLE_CONFIG = {
  MALE: '1d88af067fff4d6e95575e77f7365029',
  FEMALE: '384aba23a5ac4344b5848250d793cd64'
}
