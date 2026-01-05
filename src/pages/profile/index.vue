<template>
  <view class="profile-container">
    <!-- 左侧信息区域 -->
    <view class="profile-left">
      <!-- 头像区域 -->
      <view class="avatar-section" @click="handleChangeAvatar">
        <view class="avatar-large">
          <image v-if="userInfo.avatarURL" :src="userInfo.avatarURL" class="avatar-image" mode="aspectFill" />
          <text v-else class="avatar-text">{{ userInitial }}</text>
        </view>
        <text class="avatar-edit-hint">点击更换头像</text>
        <text class="user-name">{{ userInfo.shortName || '用户' }}</text>
        <text class="user-phone">{{ userInfo.phone || '' }}</text>
      </view>

      <!-- 用户信息列表 -->
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">会员等级</text>
          <text class="info-value">{{ userInfo.rankName || '普通会员' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">登录名</text>
          <text class="info-value">{{ userInfo.loginName || '未设置' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">推荐码</text>
          <text class="info-value">{{ userInfo.recommendCode || '无' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">最后登录</text>
          <text class="info-value">{{ formatDate(userInfo.lastLoginTime) }}</text>
        </view>
      </view>
    </view>

    <!-- 右侧操作区域 -->
    <view class="profile-right">
      <!-- 顶部导航 -->
      <view class="nav-bar">
        <view class="nav-back" @click="goBack">
          <text class="nav-back-icon">←</text>
        </view>
        <text class="nav-title">个人中心</text>
        <view class="nav-placeholder"></view>
      </view>

      <!-- 功能菜单 -->
      <scroll-view class="menu-scroll" scroll-y>
        <!-- 个人信息编辑 -->
        <view class="section-title">
          <text class="section-title-text">个人信息</text>
        </view>
        <view class="menu-list">
          <view class="menu-item" @click="showEditShortName">
            <text class="menu-icon">👤</text>
            <text class="menu-text">用户名</text>
            <text class="menu-value">{{ userInfo.shortName || '未设置' }}</text>
            <text class="menu-arrow">></text>
          </view>
          <view class="menu-item" @click="showEditGender">
            <text class="menu-icon">⚧</text>
            <text class="menu-text">性别</text>
            <text class="menu-value">{{ userInfo.titleID === '1d88af067fff4d6e95575e77f7365029' ? '男' : '女' }}</text>
            <text class="menu-arrow">></text>
          </view>
          <view class="menu-item" @click="showEditBirthday">
            <text class="menu-icon">🎂</text>
            <text class="menu-text">生日</text>
            <text class="menu-value">{{ userInfo.birthdayStr || '未设置' }}</text>
            <text class="menu-arrow">></text>
          </view>
          <view class="menu-item">
            <text class="menu-icon">📧</text>
            <text class="menu-text">邮箱</text>
            <text class="menu-value">{{ userInfo.email || '未绑定' }}</text>
          </view>
          <view class="menu-item">
            <text class="menu-icon">🪪</text>
            <text class="menu-text">身份证号</text>
            <text class="menu-value">{{ maskIdNumber(userInfo.idNumber) }}</text>
          </view>
        </view>

        <!-- 其他功能 -->
        <view class="section-title">
          <text class="section-title-text">其他</text>
        </view>
        <view class="menu-list">
          <view class="menu-item" @click="goToSettings">
            <text class="menu-icon">⚙️</text>
            <text class="menu-text">设置</text>
            <text class="menu-arrow">></text>
          </view>
        </view>

        <!-- 退出登录按钮 -->
        <view class="logout-section">
          <button class="logout-button" @click="handleLogout" :disabled="isLoggingOut">
            <text class="logout-text">{{ isLoggingOut ? '退出中...' : '退出登录' }}</text>
          </button>
        </view>
      </scroll-view>
    </view>

    <!-- 编辑用户名弹窗 -->
    <view class="modal-overlay" v-if="showShortNameModal" @click="showShortNameModal = false">
      <view class="modal-backdrop" @click="showBirthdayModal = false"></view>
      <view class="modal-content" @click.stop>
        <text class="modal-title">修改用户名</text>
        <view class="modal-input-wrapper">
          <input class="modal-input" type="text" v-model="editShortName" placeholder="请输入新用户名" maxlength="20" />
        </view>
        <view class="modal-actions">
          <view class="modal-btn cancel-btn" @click="showShortNameModal = false">
            <text class="modal-btn-text">取消</text>
          </view>
          <view class="modal-btn confirm-btn" @click="handleUpdateShortName">
            <text class="modal-btn-text">确定</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 选择性别弹窗 -->
    <view class="modal-overlay" v-if="showGenderModal" @click="showGenderModal = false">
      <view class="modal-backdrop" @click="showBirthdayModal = false"></view>
      <view class="modal-content" @click.stop>
        <text class="modal-title">选择性别</text>
        <view class="gender-options">
          <view :class="['gender-option', { active: selectedGender === 'male' }]" @click="selectedGender = 'male'">
            <text class="gender-icon">👨</text>
            <text class="gender-text">男</text>
          </view>
          <view :class="['gender-option', { active: selectedGender === 'female' }]" @click="selectedGender = 'female'">
            <text class="gender-icon">👩</text>
            <text class="gender-text">女</text>
          </view>
        </view>
        <view class="modal-actions">
          <view class="modal-btn cancel-btn" @click="showGenderModal = false">
            <text class="modal-btn-text">取消</text>
          </view>
          <view class="modal-btn confirm-btn" @click="handleUpdateGender">
            <text class="modal-btn-text">确定</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 选择生日弹窗 -->
    <view class="modal-overlay" v-if="showBirthdayModal">
      <view class="modal-backdrop" @click="showBirthdayModal = false"></view>
      <view class="modal-content">
        <text class="modal-title">选择生日</text>
        <view class="birthday-picker-wrapper">
          <picker mode="date" :value="selectedBirthday" @change="onBirthdayChange" :end="todayStr">
            <view class="birthday-picker">
              <text class="birthday-value">{{ selectedBirthday || '请选择日期' }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>
        <view class="modal-actions">
          <view class="modal-btn cancel-btn" @click="showBirthdayModal = false">
            <text class="modal-btn-text">取消</text>
          </view>
          <view class="modal-btn confirm-btn" @click="handleUpdateBirthday">
            <text class="modal-btn-text">确定</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { api } from '@/utils/request'
import { storage } from '@/utils/storage'
import { chooseAndUploadImage } from '@/utils/upload'
import { API_CONFIG, TITLE_CONFIG } from '@/config'

const ARTICLE_IDS = {
  REGISTER_ARTICLE: 'ff8080819b54efc0019b5e5eb7f201e9',
  PRIVACY_ARTICLE: 'ff8080819b54efc0019b5e6080f701ea'
}

// 用户信息
const userInfo = reactive({
  avatarURL: '' as string | null,
  birthdayStr: '' as string | null,
  email: '' as string | null,
  idNumber: '' as string | null,
  lastLoginTime: '' as string | null,
  loginName: '',
  shortName: '',
  titleID: '' as string | null,
  titleName: '' as string | null,
  name: '',
  phone: '',
  recommendCode: '' as string | null,
  rankName: '' as string | null,
  majorName: '' as string | null,
  memberIsVIP: 0,
  levelNumber: 1
})

const isLoggingOut = ref(false)
const isLoading = ref(false)

// 编辑弹窗状态
const showShortNameModal = ref(false)
const showGenderModal = ref(false)
const showBirthdayModal = ref(false)

// 编辑数据
const editShortName = ref('')
const selectedGender = ref<'male' | 'female'>('male')
const selectedBirthday = ref('')

// 今天日期
const todayStr = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})

// 用户首字母
const userInitial = computed(() => {
  return userInfo.shortName ? userInfo.shortName.substring(0, 1) : 'U'
})

// 格式化日期
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '未知'
  return dateStr.split(' ')[0] || dateStr
}

// 脱敏身份证号
const maskIdNumber = (idNumber: string | null): string => {
  if (!idNumber) return '未绑定'
  if (idNumber.length >= 15) {
    return idNumber.substring(0, 4) + '********' + idNumber.substring(idNumber.length - 4)
  }
  return idNumber
}

// 返回上一页
const goBack = () => {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({ url: '/pages/home/index' })
    }
  })
}

// 跳转设置页面
const goToSettings = () => {
  uni.navigateTo({ url: '/pages/settings/index' })
}

// 加载用户信息
const loadUserInfo = async () => {
  const sessionID = storage.getSessionID()
  const memberID = storage.getMemberID()

  if (!sessionID || !memberID) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    uni.redirectTo({ url: '/pages/login/index' })
    return
  }

  isLoading.value = true

  try {
    const result = await api.getMemberDetail({
      sessionID,
      memberID
    })

    Object.assign(userInfo, result)
  } catch (error) {
    console.error('获取用户信息失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 更换头像
const handleChangeAvatar = async () => {
  try {
    const urls = await chooseAndUploadImage(1)
    if (urls.length > 0) {
      const sessionID = storage.getSessionID()
      if (!sessionID) return

      await api.updateMemberAvatar({
        sessionID,
        avatarURL: urls[0]
      })

      userInfo.avatarURL = urls[0]
      uni.showToast({ title: '头像更新成功', icon: 'success' })
    }
  } catch (error) {
    console.error('更换头像失败:', error)
  }
}

// 显示编辑用户名弹窗
const showEditShortName = () => {
  editShortName.value = userInfo.shortName || ''
  showShortNameModal.value = true
}

// 更新用户名
const handleUpdateShortName = async () => {
  const newName = editShortName.value.trim()
  if (!newName) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }

  const sessionID = storage.getSessionID()
  if (!sessionID) return

  try {
    await api.updateMemberShortName({
      sessionID,
      shortName: newName
    })

    userInfo.shortName = newName
    showShortNameModal.value = false
    uni.showToast({ title: '用户名更新成功', icon: 'success' })
  } catch (error) {
    console.error('更新用户名失败:', error)
  }
}

// 显示选择性别弹窗
const showEditGender = () => {
  if (userInfo.titleName === '女') {
    selectedGender.value = 'female'
  } else {
    selectedGender.value = 'male'
  }
  showGenderModal.value = true
}

// 更新性别
const handleUpdateGender = async () => {
  const sessionID = storage.getSessionID()
  if (!sessionID) return

  const titleID = selectedGender.value === 'male'
    ? TITLE_CONFIG.MALE
    : TITLE_CONFIG.FEMALE

  try {
    await api.updateMemberTitle({
      sessionID,
      titleID
    })

    console.log("dadas", selectedGender.value)
    userInfo.titleID = selectedGender.value === 'male' ? TITLE_CONFIG.MALE : TITLE_CONFIG.FEMALE
    showGenderModal.value = false
    uni.showToast({ title: '性别更新成功', icon: 'success' })
  } catch (error) {
    console.error('更新性别失败:', error)
  }
}

// 显示选择生日弹窗
const showEditBirthday = () => {
  if (userInfo.birthdayStr) {
    selectedBirthday.value = userInfo.birthdayStr
  } else {
    selectedBirthday.value = ''
  }
  showBirthdayModal.value = true
}

// 生日选择变化
const onBirthdayChange = (e: any) => {
  selectedBirthday.value = e.detail.value
}

// 更新生日
const handleUpdateBirthday = async () => {
  if (!selectedBirthday.value) {
    uni.showToast({ title: '请选择生日', icon: 'none' })
    return
  }

  const sessionID = storage.getSessionID()
  if (!sessionID) return

  const dateStr = selectedBirthday.value + ' 00:00:00'
  const timestamp = new Date(dateStr.replace(/-/g, '/')).getTime()

  try {
    await api.updateMemberBirthday({
      sessionID,
      birthday: timestamp
    })

    userInfo.birthdayStr = selectedBirthday.value
    showBirthdayModal.value = false
    uni.showToast({ title: '生日更新成功', icon: 'success' })
  } catch (error) {
    console.error('更新生日失败:', error)
  }
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        await doLogout()
      }
    }
  })
}

// 执行退出登录
const doLogout = async () => {
  isLoggingOut.value = true

  try {
    const sessionID = storage.getSessionID()
    const deviceID = storage.getDeviceID()

    if (sessionID && deviceID) {
      const params = {
        sessionID,
        siteID: API_CONFIG.SITE_ID,
        deviceID
      }

      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent((params as any)[key])}`)
        .join('&')

      await new Promise<void>((resolve) => {
        uni.request({
          url: `${API_CONFIG.BASE_URL}/loginOut?${queryString}`,
          method: 'GET',
          timeout: 10000,
          success: () => resolve(),
          fail: () => resolve()
        })
      })
    }

    storage.remove('sessionID')
    storage.remove('memberID')

    uni.showToast({
      title: '已退出登录',
      icon: 'success'
    })

    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/login/index'
      })
    }, 1000)
  } catch (error) {
    console.error('Logout error:', error)
    storage.remove('sessionID')
    storage.remove('memberID')

    uni.redirectTo({
      url: '/pages/login/index'
    })
  } finally {
    isLoggingOut.value = false
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.profile-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
  background-color: #f5f5f5;
  overflow: hidden;
}

/* 左侧信息区域 */
.profile-left {
  width: 35%;
  height: 100%;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  box-sizing: border-box;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15rpx;
}

.avatar-large {
  width: 75rpx;
  height: 75rpx;
  border-radius: 50rpx;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.avatar-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
}

.avatar-edit-hint {
  font-size: 12rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8rpx;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 4rpx;
}

.user-phone {
  font-size: 14rpx;
  color: rgba(255, 255, 255, 0.8);
}

.info-list {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 12rpx;
  padding: 12rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 16rpx;
  color: rgba(255, 255, 255, 0.8);
}

.info-value {
  font-size: 16rpx;
  color: #ffffff;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 右侧操作区域 */
.profile-right {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 42rpx;
  padding: 0 24rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.nav-back {
  width: 42rpx;
  height: 42rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back-icon {
  font-size: 28rpx;
  color: #333333;
}

.nav-title {
  font-size: 16rpx;
  font-weight: bold;
  color: #333333;
}

.nav-placeholder {
  width: 48rpx;
}

.menu-scroll {
  flex: 1;
  height: 200rpx;
  overflow-y: auto;
}

.section-title {
  padding: 16rpx 24rpx 8rpx;
}

.section-title-text {
  font-size: 18rpx;
  font-weight: bold;
  color: #666666;
}

.menu-list {
  padding: 0 24rpx 16rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16rpx 16rpx;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  margin-bottom: 8rpx;
}

.menu-icon {
  font-size: 24rpx;
  margin-right: 12rpx;
}

.menu-text {
  font-size: 18rpx;
  color: #333333;
  min-width: 80rpx;
}

.menu-value {
  flex: 1;
  font-size: 16rpx;
  color: #999999;
  text-align: right;
  margin-right: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-arrow {
  font-size: 18rpx;
  color: #cccccc;
}

.logout-section {
  padding: 12rpx;
}

.logout-button {
  width: 100%;
  height: 36rpx;
  background-color: #FF3B30;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.logout-button[disabled] {
  opacity: 0.6;
}

.logout-text {
  font-size: 16rpx;
  font-weight: bold;
  color: #ffffff;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.modal-content {
  position: relative;
  width: 70%;
  max-width: 400rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  z-index: 2;
}

.modal-title {
  display: block;
  font-size: 22rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 20rpx;
}

.modal-input-wrapper {
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 16rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.modal-input {
  flex: 1;
  font-size: 18rpx;
  color: #333333;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
}

.modal-btn {
  flex: 1;
  height: 44rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  background-color: #f5f5f5;
}

.confirm-btn {
  background-color: #007AFF;
}

.modal-btn-text {
  font-size: 18rpx;
  font-weight: bold;
}

.cancel-btn .modal-btn-text {
  color: #666666;
}

.confirm-btn .modal-btn-text {
  color: #ffffff;
}

/* 性别选择 */
.gender-options {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.gender-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  border: 2rpx solid transparent;
}

.gender-option.active {
  background-color: #E3F2FD;
  border-color: #007AFF;
}

.gender-icon {
  font-size: 32rpx;
  margin-bottom: 8rpx;
}

.gender-text {
  font-size: 16rpx;
  color: #333333;
}

/* 生日选择 */
.birthday-picker-wrapper {
  margin-bottom: 20rpx;
}

.birthday-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  cursor: pointer;
}

.birthday-value {
  font-size: 18rpx;
  color: #333333;
}

.picker-arrow {
  font-size: 12rpx;
  color: #999999;
}
</style>
