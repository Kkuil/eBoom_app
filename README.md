# eBoom 教育培训 App

基于 UniApp + Vue3 + TypeScript + TailwindCSS 开发的教育培训类移动应用。

## 技术栈

- **框架**: UniApp (Vue3)
- **语言**: TypeScript
- **样式**: TailwindCSS
- **状态管理**: Pinia

## 项目结构

```
src/
├── config/           # 配置文件
│   └── index.ts      # API配置、常量定义
├── pages/            # 页面目录
│   ├── splash/       # 启动页面
│   ├── ad/           # 广告页面
│   ├── guide/        # 引导页面
│   ├── login/        # 登录页面
│   ├── register/     # 注册页面
│   ├── article/      # 文章页面
│   └── home/         # 首页
├── utils/            # 工具函数
│   ├── request.ts    # API请求封装
│   ├── storage.ts    # 本地存储封装
│   └── device.ts     # 设备信息获取
├── App.vue           # 根组件
├── main.ts           # 入口文件
├── env.d.ts          # 类型声明
├── manifest.json     # 应用配置
└── pages.json        # 页面配置
```

## 功能说明

### 1. 启动页面 (Splash)
- 应用启动时判断是否首次启动
- 首次启动调用 `/submitDeviceInfo` 接口获取 deviceID
- 将 deviceID 保存到本地缓存

### 2. 广告页面 (Ad)
- 展示5秒倒计时
- 支持点击跳过
- 根据是否首次启动跳转不同页面

### 3. 引导页面 (Guide)
- 4个引导页面，滑动切换
- 最后一页有"立即体验"按钮
- 仅首次启动显示

### 4. 登录/注册页面
- 手机号验证（11位）
- 密码验证（8-30位，含字母、数字、符号）
- 协议签署（调用 `/signOneBlankAgreement` 接口）
- 登录接口 `/memberLogin`
- 保存 sessionID 和 memberID

### 5. 文章页面
- 接口 `/getArticleSimpleDetail`
- 支持富文本展示
- 用于展示注册协议和隐私协议

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务

```bash
# H5
npm run dev:h5

# 安卓
npm run dev:android

# iOS
npm run dev:ios
```

### 构建生产版本

```bash
# 安卓
npm run build:android

# iOS
npm run build:ios
```

## API 接口说明

接口前缀: `https://api.eboom.com.cn/interface-server/api`

### 响应格式

```json
{
  "body": { ... },
  "header": {
    "code": 0,
    "msg": "success"
  }
}
```

- `code`: 0 表示成功，其他为错误
- `msg`: 开发人员信息，不直接展示给用户

### 主要接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /submitDeviceInfo | GET | 提交设备信息，获取deviceID |
| /getArticleSimpleDetail | GET | 获取文章详情 |
| /signOneBlankAgreement | GET | 签署协议 |
| /memberLogin | GET | 会员登录 |
| /memberRegister | GET | 会员注册 |

## 注意事项

1. 所有错误信息需要转化为用户友好的文字
2. deviceID 需要持久化保存，后续接口都需要用到
3. 登录成功后保存 sessionID 和 memberID
4. 协议签署返回的 agreementID 需要在注册时携带
"# eBoom_app" 
