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

## 当前状态

- 已创建项目协作说明：`AGENTS.md`
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

## 常用命令

```bash
pnpm dev:cms          # 启动 PayloadCMS 后台
pnpm typecheck       # 后台 TypeScript 检查
pnpm lint            # 后台 lint
```

## 下一步

建议优先确认：

- 首批金融职业内容分类
- 会员套餐、价格和权益
- 简历/职业测评第三方服务供应商
- 腾讯云部署形态：CVM、轻量应用服务器或容器化部署
- 数据库和对象存储规格
- 微信小程序 AppID、开发者权限和发布流程
