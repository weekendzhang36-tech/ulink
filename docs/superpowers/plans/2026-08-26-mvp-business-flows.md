# MVP Business Flows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the first real Mini Program and PayloadCMS backend flows for content, membership, payment, login, and profile submission.

**Architecture:** Keep business rules in testable TypeScript services under `apps/cms/src/lib/miniprogram`. Next route handlers expose `/api/miniprogram/*` and adapt those services to PayloadCMS. The native Mini Program calls these APIs through a single request wrapper and keeps mock data only as an explicit local demo fallback.

**Tech Stack:** PayloadCMS 3, Next.js 15 App Router, TypeScript, Node test runner, native WeChat Mini Program WXML/WXSS/JS.

**Spec:** `docs/superpowers/specs/2026-08-26-mvp-business-flows-design.md`

## Global Constraints

- Work directly in `main` during the single-developer MVP stage.
- Do not commit secrets, app IDs, merchant IDs, certificates, tokens, or database credentials.
- Prototype/mock data is allowed only for clearly marked local development and demo paths.
- Production persistence must survive redeploys.
- Payment callbacks must be idempotent.
- Resume and career assessment stay as third-party service entries.

---

### Task 1: Backend Service Layer And Tests

**Files:**
- Create: `apps/cms/src/lib/miniprogram/types.ts`
- Create: `apps/cms/src/lib/miniprogram/errors.ts`
- Create: `apps/cms/src/lib/miniprogram/session.ts`
- Create: `apps/cms/src/lib/miniprogram/auth.ts`
- Create: `apps/cms/src/lib/miniprogram/profile.ts`
- Create: `apps/cms/src/lib/miniprogram/content.ts`
- Create: `apps/cms/src/lib/miniprogram/membership.ts`
- Create: `apps/cms/src/lib/miniprogram/testing/memoryRepository.ts`
- Create: `apps/cms/src/lib/miniprogram/*.test.ts`
- Modify: `apps/cms/package.json`

**Interfaces:**
- Produces: service functions consumed by route handlers in Task 3.
- Produces: `MiniProgramRepository`, `WechatLoginGateway`, and `PaymentGateway` interfaces.

- [x] Add Node test script to `apps/cms/package.json`.
- [x] Write failing tests for session token verification, profile submission, order creation, and payment idempotency.
- [x] Implement service types and in-memory test repository.
- [x] Implement services until tests pass.
- [x] Run `pnpm --filter @ulink/cms test`.

### Task 2: Payload Collections For Membership And Payment Events

**Files:**
- Modify: `apps/cms/src/collections/GrowthPlans.ts`
- Modify: `apps/cms/payload.config.ts`

**Interfaces:**
- Consumes: membership/payment concepts from Task 1.
- Produces: `memberships` and `payment-events` collections.

- [x] Add `memberships` collection with student, growth plan, status, startedAt, expiresAt, source order.
- [x] Add `payment-events` collection with eventKey, order, status, transactionId, rawPayload, processedAt.
- [x] Register both collections in Payload config.
- [x] Run `pnpm --filter @ulink/cms typecheck`.

### Task 3: Mini Program API Routes

**Files:**
- Create: `apps/cms/src/lib/miniprogram/payloadRepository.ts`
- Create: `apps/cms/src/lib/miniprogram/routeHelpers.ts`
- Create: `apps/cms/src/app/(miniprogram)/api/miniprogram/**/route.ts`
- Modify: `apps/cms/.env.example`

**Interfaces:**
- Consumes: services from Task 1 and collections from Task 2.
- Produces: `/api/miniprogram/*` backend contract.

- [x] Add Payload-backed repository adapter.
- [x] Add route helper for JSON responses, session extraction, and error serialization.
- [x] Implement auth, profile, home, content, growth-plan, order, order status, and mock payment callback routes.
- [x] Add local-only environment examples for mock WeChat login and mock payment mode.
- [x] Run `pnpm --filter @ulink/cms typecheck`.
- [x] Run `PAYLOAD_SECRET=dev-local-build-secret DATABASE_URL=postgres://ulink:ulink_dev_password@localhost:5432/ulink pnpm --filter @ulink/cms build`.

### Task 4: Mini Program Request Layer And Flow Pages

**Files:**
- Modify: `apps/miniprogram/app.js`
- Modify: `apps/miniprogram/app.json`
- Modify: `apps/miniprogram/utils/api.js`
- Create: `apps/miniprogram/pages/login/*`
- Create: `apps/miniprogram/pages/profile/*`
- Modify: existing home, growth-plan, content-detail, verification, and mine pages as needed.

**Interfaces:**
- Consumes: `/api/miniprogram/*` backend contract from Task 3.
- Produces: student-facing login/profile/content/member/order flows.

- [x] Replace pure mock API functions with `wx.request` calls and explicit demo fallback.
- [x] Add login page that calls `wx.login` and stores the U Link session token.
- [x] Add profile page that submits complete student profile data.
- [x] Update home, content, growth plan, verification, and mine pages to consume backend-shaped responses.
- [x] Add local demo payment callback behavior only behind explicit demo mode.
- [x] Run Mini Program JSON parse checks.

### Task 5: Documentation, Verification, And Commit

**Files:**
- Modify: `README.md`
- Modify: `docs/progress.md`

**Interfaces:**
- Consumes: all previous tasks.
- Produces: developer-facing setup and progress notes.

- [x] Document new API flow, local mock gateway flags, and verification commands.
- [x] Run `pnpm --filter @ulink/cms test`.
- [x] Run `pnpm typecheck`.
- [x] Run `pnpm --filter @ulink/cms build` with local env values.
- [x] Check `git status --short` and staged diff.
- [x] Commit and push to `main`.

### Task 6: Instructor Verification Management

**Files:**
- Create: `apps/cms/src/lib/miniprogram/instructor.ts`
- Create: `apps/cms/src/lib/miniprogram/instructor.test.ts`
- Modify: `apps/cms/src/lib/miniprogram/types.ts`
- Modify: `apps/cms/src/lib/miniprogram/payloadRepository.ts`
- Modify: `apps/cms/src/lib/miniprogram/testing/memoryRepository.ts`
- Create: `apps/cms/src/app/(miniprogram)/api/miniprogram/instructor/verifications/route.ts`
- Create: `apps/miniprogram/pages/instructor-verifications/*`
- Modify: `apps/miniprogram/app.json`
- Modify: `apps/miniprogram/pages/home/*`
- Modify: `apps/miniprogram/pages/mine/*`
- Modify: `apps/miniprogram/utils/api.js`

**Interfaces:**
- Consumes: session token and student phone from the existing Mini Program login/profile flow.
- Produces: instructor-only student verification list and review action API.

- [x] Write failing tests for instructor list permissions, unauthorized review rejection, and batch verification.
- [x] Implement instructor service functions.
- [x] Add Payload repository methods for instructor class lookup, student list lookup, and verification status updates.
- [x] Add `/api/miniprogram/instructor/verifications` GET and POST routes.
- [x] Add Mini Program instructor management page and conditional Mine/Home entrances.
- [x] Run `pnpm --filter @ulink/cms test`.
- [x] Run `pnpm --filter @ulink/cms typecheck`.
- [x] Run `PAYLOAD_SECRET=dev-local-build-secret DATABASE_URL=postgres://ulink:ulink_dev_password@localhost:5432/ulink pnpm --filter @ulink/cms build`.
