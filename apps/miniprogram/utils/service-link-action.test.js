const assert = require('node:assert/strict')
const test = require('node:test')

const { getServiceLinkAction } = require('./service-link-action')

test('uses clipboard action for configured external service links', () => {
  assert.deepEqual(
    getServiceLinkAction({
      actionLabel: '开始测评',
      entryType: 'external_link',
      url: 'https://example.com/assessment',
    }),
    {
      data: 'https://example.com/assessment',
      label: '开始测评',
      toastText: '链接已复制',
      type: 'copy_link',
    },
  )
})

test('uses Mini Program navigation when app id is configured', () => {
  assert.deepEqual(
    getServiceLinkAction({
      actionLabel: '开始测评',
      entryType: 'mini_program',
      miniProgramAppId: 'wx1234567890abcdef',
      miniProgramPath: 'pages/start/index?source=ulink',
    }),
    {
      appId: 'wx1234567890abcdef',
      label: '开始测评',
      path: 'pages/start/index?source=ulink',
      type: 'mini_program',
    },
  )
})

test('uses consultation hint when service has no direct link', () => {
  assert.deepEqual(
    getServiceLinkAction({
      actionLabel: '预约咨询',
      contactHint: '请先预约顾问，确认第三方服务开放时间。',
      entryType: 'consultation',
    }),
    {
      content: '请先预约顾问，确认第三方服务开放时间。',
      label: '预约咨询',
      title: '预约咨询',
      type: 'consultation',
    },
  )
})

test('shows unavailable action when required service entry fields are missing', () => {
  assert.deepEqual(
    getServiceLinkAction({
      actionLabel: '开始测评',
      entryType: 'mini_program',
    }),
    {
      label: '暂未开放',
      title: '暂未开放',
      type: 'unavailable',
    },
  )
})
