# U Link

`U Link` 是一个新的微信小程序项目，目前处于前期开发准备阶段。

## 项目定位

项目将以微信小程序作为主要载体。长期方向是一个面向青年的成长生态平台，连接校园与职场、本土与世界。

当前 MVP 先聚焦一个可上线、可支付、可运营的小闭环：学生登录、会员加入、微信支付，以及金融职业方向的内容与服务。

## MVP 范围

第一版自研部分：

- 学生微信登录与基础资料完善
- 会员加入、会员状态与权益展示
- 微信支付
- 金融职业分类内容发布
- 会员、内容、订单、支付状态等基础运营能力

第一版接入第三方服务：

- 简历制作/优化
- 职业测评

暂缓到后续生态阶段：

- 非遗内容与路线
- 研学/游学与中外文化交流
- 更完整的实习实践生态
- 创业出口和大型合作伙伴市场

## 设计方向

界面默认坚持类似 Apple iOS 的视觉风格：浅色系统背景、分组表单、清晰层级、克制圆角、细分割线和蓝色主操作按钮。

## 开发原则

项目开发必须遵循 [DEVELOPMENT_PRINCIPLES.md](./DEVELOPMENT_PRINCIPLES.md)，重点落在这些第一版底线：

- 不用假数据、假 fallback 或前端默认值掩盖真实接口、数据库、支付、登录或文件上传失败。
- mock 只允许出现在明确标记的原型、本地 demo、fixture 或本地开发路径里。
- 业务记录必须对应真实用户动作；浏览、预览和草稿不能为了迁就接口形状而落成正式业务数据。
- 生产数据必须持久化，PostgreSQL、PayloadCMS 上传、COS 文件、订单、会员、认证历史和密钥不能依赖应用容器本地磁盘。
- 涉及登录、手机号、支付、会员、认证和数据迁移的改动，完成前要跑对应测试、类型检查或构建检查。

日常开发工作流见 [docs/development-workflow.md](./docs/development-workflow.md)。它把上述原则落到开发前确认、实现边界、持久化要求和提交前检查。

## 当前状态

- 已创建项目协作说明：`AGENTS.md`
- 已纳入开发原则：`DEVELOPMENT_PRINCIPLES.md`
- 已补充开发工作流：`docs/development-workflow.md`
- 已补充产品说明：`docs/product.md`
- 已补充架构说明：`docs/architecture.md`
- 初步技术方向：原生微信小程序 + 腾讯云自部署 PayloadCMS + PostgreSQL + COS
- 已初始化基础工程：
  - `apps/cms`：PayloadCMS + Next.js 后台/API 工程。
  - `apps/miniprogram`：原生微信小程序前端工程骨架。
  - `prototype/`：客户演示和早期交互原型。

## 开发准备

需要本机安装：

- Node.js `20.9.0+`，当前项目使用 `.node-version` 标记为 `22.21.1`。
- pnpm `10.24.0+`。
- Docker 或本地 PostgreSQL。
- 微信开发者工具。

首次安装：

```bash
pnpm install
```

启动本地 PostgreSQL：

```bash
docker compose up -d postgres
```

本地 `docker-compose.yml` 使用 named volume `ulink_postgres_data` 保存开发数据，普通重启容器不会清空数据。生产环境不能依赖应用容器本地磁盘，数据库需要使用独立持久化 PostgreSQL，上传文件需要接入 COS，避免重新部署时丢失业务数据。

复制后台环境变量示例：

```bash
cp apps/cms/.env.example apps/cms/.env
```

启动 PayloadCMS：

```bash
pnpm dev:cms
```

后台地址：

```text
http://localhost:3000/admin
```

小程序工程用微信开发者工具打开：

```text
apps/miniprogram
```

学生资料页会把未提交完成的表单草稿保存在小程序本地缓存中，便于中途退出后恢复。草稿只保存姓名、生日、性别、学校/学院/专业/班级选择、协议勾选和短信手机号；不会保存短信验证码、手机号验证 token 或“已验证”状态。提交成功后会清理本地草稿，服务端仍只保存完整提交后的学生资料。

## 常用命令

```bash
pnpm dev:cms          # 启动 PayloadCMS 后台
pnpm --filter @ulink/cms test
pnpm typecheck       # 后台 TypeScript 检查
pnpm lint            # 后台 lint
pnpm verify:cms      # 后台测试 + 类型检查 + lint
pnpm test:miniprogram
pnpm verify:miniprogram
pnpm verify          # 后台检查 + 小程序 JS/JSON 检查
```

## 小程序 API

后台已提供第一批小程序业务 API：

- `POST /api/miniprogram/auth/login`
- `POST /api/miniprogram/phone/wechat`
- `POST /api/miniprogram/phone/sms/request`
- `POST /api/miniprogram/phone/sms/verify`
- `POST /api/miniprogram/profile/submit`
- `GET /api/miniprogram/profile/status`
- `GET /api/miniprogram/home`
- `GET /api/miniprogram/campus`
- `GET /api/miniprogram/content`
- `GET /api/miniprogram/content/:id`
- `POST /api/miniprogram/content/:id/reservations`
- `GET /api/miniprogram/service-links`
- `GET /api/miniprogram/growth-plan`
- `GET /api/miniprogram/instructor/verifications`
- `POST /api/miniprogram/instructor/verifications`
- `GET /api/miniprogram/orders`
- `POST /api/miniprogram/orders`
- `GET /api/miniprogram/orders/:orderNo`
- `POST /api/miniprogram/orders/:orderNo/cancel`
- `POST /api/miniprogram/payments/mock-callback`

本地开发可以在 `apps/cms/.env` 中开启：

```text
MINIPROGRAM_MOCK_WECHAT_LOGIN=true
MINIPROGRAM_MOCK_WECHAT_PHONE=true
MINIPROGRAM_MOCK_SMS=true
MINIPROGRAM_MOCK_SMS_CODE=123456
MINIPROGRAM_MOCK_PAYMENT=true
```

这些开关只用于本地开发。生产环境需要接入真实微信登录、微信手机号授权、短信服务、微信支付商户配置和回调验签，不能用 mock 结果冒充真实成功。

真实微信支付下单需要在服务端配置：

```text
WECHAT_MINIPROGRAM_APP_ID=
WECHAT_PAY_MCH_ID=
WECHAT_PAY_CERT_SERIAL_NO=
WECHAT_PAY_PRIVATE_KEY=
WECHAT_PAY_NOTIFY_URL=
WECHAT_PAY_API_V3_KEY=
WECHAT_PAY_PLATFORM_SERIAL_NO=
WECHAT_PAY_PLATFORM_PUBLIC_KEY=
```

`WECHAT_PAY_PRIVATE_KEY`、`WECHAT_PAY_API_V3_KEY` 和 `WECHAT_PAY_PLATFORM_PUBLIC_KEY` 必须来自服务器环境变量或密钥管理，不要提交到仓库。真实支付链路里，小程序支付窗口返回成功后仍会回查后台订单状态；会员生效以服务端支付回调更新后的订单和会员记录为准。

真实支付回调入口：

- `POST /api/miniprogram/payments/wechat-callback`

回调处理会先使用微信支付平台公钥验签，再用 APIv3 密钥解密 `resource`，并校验 AppID、商户号、订单号和金额后激活会员。本地开发仍可使用 `POST /api/miniprogram/payments/mock-callback`，但必须显式开启 `MINIPROGRAM_MOCK_PAYMENT=true`。

## 下一步

建议优先确认：

- 首批金融职业内容分类
- 会员套餐、价格和权益
- 简历/职业测评第三方服务供应商
- 腾讯云部署形态：CVM、轻量应用服务器或容器化部署
- 数据库和对象存储规格
- 微信小程序 AppID、开发者权限和发布流程
