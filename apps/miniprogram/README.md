# U Link 小程序工程

这是原生微信小程序工程骨架。

## 本地打开

1. 打开微信开发者工具。
2. 选择导入项目。
3. 项目目录选择 `apps/miniprogram`。
4. 没有真实 AppID 时使用测试号或复制 `project.private.config.json.example` 后填写本机 AppID。

## 当前状态

- 页面通过 `utils/api.js` 调用 PayloadCMS 后台的 `/api/miniprogram/*` 接口。
- `utils/mock-data.js` 只作为显式本地 demo fallback 使用，不能进入生产路径，也不能用来掩盖真实接口失败。
- 已接入登录、资料提交、认证状态、内容、成长计划、订单和本地模拟支付的第一批接口形状。
- 首页、我的、成长计划、订单、预约、内容详情、认证状态、资料页和指导员认证管理页已统一处理登录过期与资料未完成跳转。
- “我的预约”支持读取当前学生自己的预约记录，并可取消预约；取消以后以后端状态和名额释放结果为准。
- 内容列表和详情页会展示后台内容封面；没有封面时不显示占位图。
- 资料页会保存本地草稿并在提交成功后清理；草稿不保存验证码、手机号验证 token 或已验证状态。
- 真实微信 AppID、手机号授权、微信支付、短信服务和订阅消息仍需要生产配置与联调。
- 订阅消息模板 ID 先在 `app.js` 的 `subscriptionTemplates` 中预留配置位。未配置模板 ID 时，小程序会提示“提醒模板待配置”，不会写入假订阅记录。

## 开发原则

- 遵循根目录 `DEVELOPMENT_PRINCIPLES.md`、`CONTRIBUTING.md`、`docs/development-workflow.md` 和 `docs/development-checklist.md`。
- 小程序页面不自行伪造会员、订单、支付、认证或内容发布状态，关键状态以后台返回为准。
- 页面需要真实处理空状态、加载失败、未开放和无权限状态。
- demo fallback 只能在显式 demo mode 中使用；生产路径接口失败时要展示真实错误或空状态，不能静默切到 mock 数据。
- 跨页面只传内容 ID、订单号、预约 ID 等稳定引用，目标页面进入后重新读取自己负责的数据。
- 涉及页面 JS 或 JSON 配置时，提交前运行：

```bash
pnpm verify:miniprogram
```
