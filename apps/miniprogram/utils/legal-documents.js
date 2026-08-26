const documents = {
  'user-agreement': {
    title: '用户协议',
    body: [
      '欢迎使用 U Link。U Link 是面向学生成长服务的小程序，提供学生资料完善、认证状态、成长内容、会员计划、活动预约和第三方服务入口。',
      '你需要提供真实、准确的基础资料，以便完成学生认证、活动签到和会员权益核销。若资料发生变化，应及时更新。',
      '会员计划、活动报名、咨询预约和第三方服务入口以页面展示和后台实际配置为准。第三方服务由对应服务方提供，U Link 会尽量提供清晰入口和说明。',
      '请不要冒用他人身份、恶意提交虚假资料、干扰平台运行，或将他人信息用于无关用途。',
      '正式上线前，运营主体、退款规则、服务边界、争议处理和联系方式需要按实际经营安排补充确认。',
    ].join('\n\n'),
  },
  'privacy-policy': {
    title: '隐私政策',
    body: [
      'U Link 会在学生注册、认证、会员购买、活动预约和服务通知过程中收集必要信息。',
      '我们可能收集的信息包括微信登录标识、手机号、真实姓名、性别、生日、学校、学院、专业、班级、会员状态、订单状态、预约记录和订阅消息授权记录。',
      '上述信息用于学生身份确认、指导员认证管理、活动签到、会员权益核销、订单处理、内容预约和必要服务提醒。',
      '指导员只能查看自己负责班级学生的必要认证信息，并需要先确认管理端数据使用承诺。',
      '正式上线前，运营主体、联系方式、数据保存期限、第三方服务清单和用户权利处理方式需要按实际主体与合规要求补充确认。',
    ].join('\n\n'),
  },
}

function getLegalDocument(type) {
  return documents[type]
}

function listLegalDocuments() {
  return Object.keys(documents).map((type) => ({
    title: documents[type].title,
    type,
  }))
}

module.exports = {
  getLegalDocument,
  listLegalDocuments,
}
