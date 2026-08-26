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
- 真实微信 AppID、手机号授权、微信支付、短信服务和订阅消息仍需要生产配置与联调。

## 开发原则

- 遵循根目录 `DEVELOPMENT_PRINCIPLES.md` 和 `docs/development-workflow.md`。
- 小程序页面不自行伪造会员、订单、支付、认证或内容发布状态，关键状态以后台返回为准。
- 页面需要真实处理空状态、加载失败、未开放和无权限状态。
- 涉及页面 JS 或 JSON 配置时，提交前运行：

```bash
pnpm verify:miniprogram
```
