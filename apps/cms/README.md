# U Link 后台工程

这是 `U Link` 的 PayloadCMS + Next.js 后台/API 工程，用于承载第一版后台管理、小程序业务 API、内容发布、会员订单、支付回调、学生认证和校园数据等能力。

## 开发原则

- 后台开发必须遵循根目录 `DEVELOPMENT_PRINCIPLES.md`、`CONTRIBUTING.md`、`docs/development-workflow.md` 和 `docs/development-checklist.md`。
- 服务层先表达业务规则，Next route handler 只负责 HTTP 请求、鉴权入口和响应适配。
- 生产路径不能用 mock、默认值、假 fallback 或测试数据掩盖数据库、微信、短信、支付、COS、订阅消息或第三方服务失败。
- 订单、会员、支付事件、学生认证、审核日志、内容预约和导入数据必须以后端持久化状态为准。
- 新增持久化业务对象前，先确认它对应真实用户动作或真实业务事件，并明确来源、归属和生命周期。
- 支付、导入、迁移、批量更新和生产发布前，先确认数据库备份、文件持久化和回滚边界。

## 持久化要求

- 生产 PostgreSQL 必须是独立持久化资源，不能依赖应用容器或镜像内数据。
- PayloadCMS 上传、内容封面、附件、学校素材和合作方资料必须接入 COS 或明确对象存储。
- `PAYLOAD_SECRET`、数据库密码、微信 AppSecret、微信支付私钥、APIv3 密钥、COS 密钥和短信密钥只能来自环境变量或密钥管理，不得提交到仓库。

## 常用命令

```bash
pnpm --filter @ulink/cms dev
pnpm --filter @ulink/cms test
pnpm --filter @ulink/cms typecheck
pnpm --filter @ulink/cms build
```

根目录提交前完整检查：

```bash
pnpm verify:precommit
```
