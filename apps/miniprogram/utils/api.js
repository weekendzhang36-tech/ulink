const mockData = require('./mock-data')

function isDemoMode() {
  const app = getApp()

  return Boolean(app.globalData.demoMode)
}

function getApiBaseURL() {
  const app = getApp()

  return app.globalData.apiBaseURL
}

function getSessionToken() {
  return wx.getStorageSync('ulinkSessionToken')
}

function setSessionToken(token) {
  wx.setStorageSync('ulinkSessionToken', token)
}

function formatGrowthPlan(plan) {
  if (!plan) return null

  return {
    ...plan,
    priceText: plan.priceText || `¥${Number(plan.priceCents || 0) / 100} / 半年`,
    benefits: Array.isArray(plan.benefits)
      ? plan.benefits.map((item) => item.text || item).filter(Boolean)
      : [],
  }
}

function request({ auth = false, data, method = 'GET', path }) {
  if (isDemoMode()) {
    return Promise.reject(new Error('demo-mode'))
  }

  return new Promise((resolve, reject) => {
    const header = {}
    const token = getSessionToken()
    if (auth && token) {
      header.Authorization = `Bearer ${token}`
    }

    wx.request({
      data,
      header,
      method,
      url: `${getApiBaseURL()}${path}`,
      fail: reject,
      success(response) {
        const responseData = response.data || {}
        if (response.statusCode >= 400 || responseData.error) {
          reject(new Error((responseData.error && responseData.error.message) || '请求失败'))
          return
        }

        resolve(responseData.data)
      },
    })
  })
}

function withDemoFallback(promise, fallback) {
  return promise.catch((error) => {
    if (isDemoMode() || error.message === 'demo-mode') {
      return fallback()
    }

    throw error
  })
}

function getHomeData() {
  return withDemoFallback(request({ auth: true, path: '/home' }), () => ({
    growthPlan: mockData.growthPlan,
    modules: mockData.modules,
    articles: mockData.articles,
    studentState: mockData.studentState,
  })).then((data) => ({
    ...data,
    growthPlan: formatGrowthPlan(data.growthPlan),
  }))
}

function getGrowthPlan() {
  return withDemoFallback(request({ path: '/growth-plan' }), () => mockData.growthPlan).then(formatGrowthPlan)
}

function getArticleById(id) {
  return withDemoFallback(request({ auth: true, path: `/content/${id}` }), () =>
    mockData.articles.find((article) => article.id === id) || mockData.articles[0],
  ).then((article) => ({
    ...article,
    body: typeof article.body === 'string' ? article.body : article.summary,
  }))
}

function getContentsByModule(moduleKey) {
  return withDemoFallback(request({ path: `/content?module=${moduleKey}` }), () =>
    mockData.articles.filter((article) => article.module === moduleKey),
  )
}

function getStudentState() {
  return withDemoFallback(request({ auth: true, path: '/profile/status' }), () => ({
    student: mockData.studentState,
  })).then((data) => {
    const student = data.student || {}

    return {
      canManageStudents: Boolean(data.instructor && data.instructor.canManageStudents),
      className: student.className || student.classId || '',
      message:
        student.message ||
        (student.verificationStatus === 'verified'
          ? '资料已认证，可以继续查看成长服务。'
          : '资料已提交，等待指导员确认。'),
      name: student.name || student.realName || '未登录',
      school: student.school || student.schoolId || '',
      verificationStatus:
        student.verificationStatus === 'needs_review'
          ? '需确认'
          : student.verificationStatus || '未提交',
    }
  })
}

function getInstructorVerifications(status = 'pending') {
  const query = status ? `?status=${status}` : ''

  return withDemoFallback(request({ auth: true, path: `/instructor/verifications${query}` }), () =>
    mockData.instructorVerifications,
  )
}

function reviewInstructorStudents({ action, studentIds }) {
  return request({
    auth: true,
    data: {
      action,
      studentIds,
    },
    method: 'POST',
    path: '/instructor/verifications',
  })
}

function getCampusOptions() {
  return withDemoFallback(request({ path: '/campus' }), () => mockData.campus)
}

function loginWithWechatCode(code) {
  return request({
    data: { code },
    method: 'POST',
    path: '/auth/login',
  }).then((data) => {
    setSessionToken(data.sessionToken)

    return data
  })
}

function verifyWechatPhone(phoneCode) {
  return withDemoFallback(
    request({
      data: {
        phoneCode,
        sessionToken: getSessionToken(),
      },
      method: 'POST',
      path: '/phone/wechat',
    }),
    () => ({
      phone: '13800000001',
      phoneVerificationToken: 'demo-phone-verification-token',
    }),
  )
}

function submitProfile(profile) {
  const sessionToken = getSessionToken()

  return withDemoFallback(
    request({
      data: {
        ...profile,
        sessionToken,
      },
      method: 'POST',
      path: '/profile/submit',
    }),
    () => ({
      profileCompleted: true,
      sessionToken,
      student: {
        ...profile,
        id: 'demo-student',
        verificationStatus: 'pending',
      },
    }),
  ).then((data) => {
    if (data.sessionToken) setSessionToken(data.sessionToken)

    return data
  })
}

function createGrowthPlanOrder(growthPlanId) {
  return request({
    data: {
      growthPlanId,
      sessionToken: getSessionToken(),
    },
    method: 'POST',
    path: '/orders',
  })
}

function getOrderStatus(orderNo) {
  return request({
    auth: true,
    path: `/orders/${orderNo}`,
  })
}

function mockConfirmPayment(orderNo) {
  return request({
    data: { orderNo },
    method: 'POST',
    path: '/payments/mock-callback',
  })
}

module.exports = {
  createGrowthPlanOrder,
  getArticleById,
  getCampusOptions,
  getContentsByModule,
  getGrowthPlan,
  getHomeData,
  getInstructorVerifications,
  getOrderStatus,
  getSessionToken,
  getStudentState,
  loginWithWechatCode,
  mockConfirmPayment,
  reviewInstructorStudents,
  submitProfile,
  verifyWechatPhone,
}
