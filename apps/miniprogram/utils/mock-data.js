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
    id: 'finance-salon',
    module: 'finance_foundation',
    title: '青年金融沙龙：从校园到银行网点',
    meta: '8月22日 · 线下活动',
    summary: '邀请在职学长聊一线岗位、客户沟通和新人适应。',
    body: '沙龙会围绕银行网点、客户经理和运营岗位展开，适合想先听真实经历，再决定是否深入了解的同学。',
  },
  {
    id: 'practice-camp',
    module: 'practice',
    title: '金融岗位模拟实训营开放报名',
    meta: '8月22日 · 活动报名',
    summary: '2 小时体验一次客户资料整理与风险提示任务。',
    body: '面向还没有实习经验的同学，现场会给一份模拟客户资料，带大家完成信息整理、问题提炼和汇报表达。',
  },
]

const studentState = {
  name: '林一诺',
  school: '广东金融学院',
  className: '金融学 2026-1 班',
  verificationStatus: '待认证',
  message: '资料已提交，等待指导员确认。',
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
  modules,
  studentState,
}
