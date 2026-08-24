# U Link 小程序工程

这是原生微信小程序工程骨架。

## 本地打开

1. 打开微信开发者工具。
2. 选择导入项目。
3. 项目目录选择 `apps/miniprogram`。
4. 没有真实 AppID 时使用测试号或复制 `project.private.config.json.example` 后填写本机 AppID。

## 当前状态

- 页面使用 `utils/mock-data.js` 中的演示数据。
- `utils/api.js` 保留未来接入 PayloadCMS REST API 的入口。
- 暂未接入微信登录、手机号授权、支付和订阅消息。
