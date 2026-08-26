const growthPlan = {
  id: 'growth-plan-half-year',
  title: '友邻成长计划',
  priceText: '¥5 / 半年',
  description: '有效期内接收实习邀请、活动提醒、成长内容推送和咨询预约提醒。',
  benefits: ['实习邀请和实践机会提醒', '金融沙龙、财商课和线下活动推送', '职业规划、简历准备和岗位认知内容推送', '咨询预约提醒'],
}

const modules = [
  { key: 'career_planning', title: '职业规划', summary: '测评、规划、简历与课程支持' },
  { key: 'practice', title: '实习实践', summary: '实训营、岗位介绍与实践机会' },
  { key: 'finance_foundation', title: '金融底色', summary: '金融沙龙、财商课与机构资源' },
  { key: 'culture_exchange', title: '文化交流', summary: '非遗文化、中外交流与研学路线' },
]

const articles = [
  {
    actionLabel: '预约报名',
    actionUrl: 'https://example.com/finance-salon',
    capacityText: '28 人已预约 · 剩余 12 个名额',
    id: 'finance-salon',
    isMemberOnly: false,
    module: 'finance_foundation',
    statusText: '报名中',
    title: '青年金融沙龙：从校园到银行网点',
    meta: '8月22日 · 线下活动',
    summary: '邀请在职学长聊一线岗位、客户沟通和新人适应。',
    body: '沙龙会围绕银行网点、客户经理和运营岗位展开，适合想先听真实经历，再决定是否深入了解的同学。',
  },
  {
    actionLabel: '预约报名',
    actionUrl: 'https://example.com/practice-camp',
    capacityText: '36 人已预约 · 剩余 14 个名额',
    id: 'practice-camp',
    isMemberOnly: true,
    module: 'practice',
    statusText: '报名中',
    title: '金融岗位模拟实训营开放报名',
    meta: '8月22日 · 活动报名',
    summary: '2 小时体验一次客户资料整理与风险提示任务。',
    body: '面向还没有实习经验的同学，现场会给一份模拟客户资料，带大家完成信息整理、问题提炼和汇报表达。',
  },
]

const serviceLinks = [
  {
    actionLabel: '开始测评',
    description: '进入合作服务页，完成职业兴趣和能力倾向测评。',
    id: 'service-assessment',
    module: 'career_planning',
    serviceType: 'assessment',
    title: '职业测评入口',
    typeLabel: '职业测评',
    url: 'https://example.com/assessment',
  },
  {
    actionLabel: '查看简历服务',
    description: '查看简历制作、简历优化和投递前检查服务。',
    id: 'service-resume',
    module: 'career_planning',
    serviceType: 'resume',
    title: '简历优化入口',
    typeLabel: '简历服务',
    url: 'https://example.com/resume',
  },
]

const studentState = {
  canManageStudents: false,
  name: '林一诺',
  school: '广东金融学院',
  className: '金融学 2026-1 班',
  membershipState: {
    expiresText: '加入后可查看有效期',
    isActive: false,
    statusText: '未开通',
  },
  verificationStatus: '待认证',
  message: '资料已提交，等待指导员确认。',
}

const instructorVerifications = {
  pendingCount: 1,
  students: [
    {
      classId: 'class_001',
      collegeId: 'college_001',
      id: 'student_001',
      majorId: 'major_001',
      phone: '13800000001',
      realName: '林一诺',
      schoolId: 'school_001',
      submittedAt: '2026-08-26T09:00:00.000Z',
      verificationStatus: 'pending',
    },
  ],
}

const campus = {
  classes: [{ id: 'class_001', name: '金融学 2026-1 班' }],
  colleges: [{ id: 'college_001', name: '金融学院' }],
  majors: [{ id: 'major_001', name: '金融学' }],
  schools: [{ id: 'school_001', name: '广东金融学院' }],
}

module.exports = {
  articles,
  campus,
  growthPlan,
  instructorVerifications,
  modules,
  serviceLinks,
  studentState,
}
