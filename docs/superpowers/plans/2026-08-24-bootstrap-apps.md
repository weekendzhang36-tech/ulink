# Backend And Mini Program Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Create the initial backend and frontend project foundations for U Link.

**Architecture:** Use a pnpm workspace with two apps: `apps/cms` for a PayloadCMS + Next.js backend/admin and `apps/miniprogram` for a native WeChat Mini Program frontend. Keep secrets out of git and make the first backend collections match the MVP product model.

**Tech Stack:** pnpm workspace, PayloadCMS 3, Next.js App Router, TypeScript, PostgreSQL adapter, native WeChat Mini Program.

**Spec:** `docs/product.md`, `docs/architecture.md`, `AGENTS.md`

## Global Constraints

- Primary client is native WeChat Mini Program.
- Backend/admin is a self-hosted PayloadCMS project on Tencent Cloud.
- Preferred database is PostgreSQL.
- Do not commit secrets, private keys, app IDs, tokens, database credentials, or WeChat platform credentials.
- MVP stays focused on student login, instructor verification, paid growth plan / membership, finance-career content, and basic operations.
- Student and school data must support a multi-school model.
- Resume and assessment services are third-party entries, not first-party systems.

---

### Task 1: Workspace Foundation

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.node-version`
- Modify: `.gitignore`
- Modify: `README.md`

**Interfaces:**
- Produces: root scripts `dev:cms`, `dev:miniprogram`, `typecheck`, `lint`.
- Produces: a workspace that includes `apps/*`.

- [x] **Step 1: Add root package manifest**

Create a private root package with pnpm scripts that call app-level scripts.

- [x] **Step 2: Add pnpm workspace file**

Include all apps under `apps/*`.

- [x] **Step 3: Add Node version marker**

Set Node to `22.21.1`, which satisfies Payload's Node 20.9+ requirement.

- [x] **Step 4: Update gitignore**

Ignore dependency directories, build output, local environment files, miniprogram private config, and generated Payload types.

- [x] **Step 5: Update README**

Document initial setup, app directories, and development commands.

### Task 2: PayloadCMS Backend Foundation

**Files:**
- Create: `apps/cms/package.json`
- Create: `apps/cms/next.config.mjs`
- Create: `apps/cms/tsconfig.json`
- Create: `apps/cms/payload.config.ts`
- Create: `apps/cms/src/app/(payload)/layout.tsx`
- Create: `apps/cms/src/app/(payload)/admin/[[...segments]]/page.tsx`
- Create: `apps/cms/src/app/(payload)/admin/[[...segments]]/not-found.tsx`
- Create: `apps/cms/src/app/(payload)/admin/importMap.js`
- Create: `apps/cms/src/app/(payload)/api/[...slug]/route.ts`
- Create: `apps/cms/src/app/(payload)/graphql/route.ts`
- Create: `apps/cms/src/app/(payload)/graphql-playground/route.ts`
- Create: `apps/cms/src/app/(frontend)/page.tsx`
- Create: `apps/cms/src/collections/*.ts`
- Create: `apps/cms/.env.example`
- Create: `docker-compose.yml`

**Interfaces:**
- Produces: Payload admin at `/admin`.
- Produces: Payload REST API under `/api`.
- Produces: MVP collections for admins, students, school data, content, growth plans, orders, and service links.

- [x] **Step 1: Add CMS package and Next config**

Set dependencies for Payload, Next, Postgres adapter, rich text editor, React, TypeScript, and sharp. Wrap Next config with `withPayload`.

- [x] **Step 2: Add Payload route files**

Create the App Router files required by Payload's current template.

- [x] **Step 3: Add collection modules**

Create focused collection files for users, campus data, student data, content, growth plans, orders, and service links.

- [x] **Step 4: Add Payload config**

Use `postgresAdapter` with `DATABASE_URL`, configure admin user collection, register collections, enable lexical editor, and set generated types output path.

- [x] **Step 5: Add local env and database compose file**

Provide `.env.example` and a local PostgreSQL service for development.

### Task 3: WeChat Mini Program Foundation

**Files:**
- Create: `apps/miniprogram/project.config.json`
- Create: `apps/miniprogram/project.private.config.json.example`
- Create: `apps/miniprogram/app.json`
- Create: `apps/miniprogram/app.js`
- Create: `apps/miniprogram/app.wxss`
- Create: `apps/miniprogram/sitemap.json`
- Create: `apps/miniprogram/pages/**`
- Create: `apps/miniprogram/utils/api.js`
- Create: `apps/miniprogram/utils/mock-data.js`
- Create: `apps/miniprogram/README.md`

**Interfaces:**
- Produces: a WeChat Developer Tools-openable miniprogram project.
- Produces: pages for home, growth plan, content detail, verification state, and mine.
- Produces: mock data shaped for future PayloadCMS API consumption.

- [x] **Step 1: Add miniprogram configuration**

Use placeholder AppID and add a private config example.

- [x] **Step 2: Add app shell**

Create global app config, shared styles, and lifecycle file.

- [x] **Step 3: Add pages**

Create native WXML/WXSS/JS/JSON files for MVP page shells.

- [x] **Step 4: Add API and mock utilities**

Centralize mock growth plan, modules, articles, and user state.

### Task 4: Verification And Documentation

**Files:**
- Modify: `docs/progress.md`
- Modify: `README.md`

**Interfaces:**
- Produces: documented setup and verification status.

- [x] **Step 1: Run static checks**

Run root and app-level TypeScript checks where dependencies are available.

- [x] **Step 2: Verify source structure**

Use repository search commands to confirm expected files and no secrets.

- [x] **Step 3: Update progress notes**

Record the new backend and miniprogram foundation.
