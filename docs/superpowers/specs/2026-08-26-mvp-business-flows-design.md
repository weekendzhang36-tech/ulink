# MVP Business Flows Design

## Goal

Build the first real implementation layer for U Link Mini Program login, profile verification, content publishing, membership, and payment flows.

## Scope

This phase creates a working API contract between the native Mini Program and the PayloadCMS backend. It keeps WeChat login and WeChat Pay behind replaceable adapters so development can continue before production AppID, merchant ID, payment certificates, SMS templates, and COS bucket details are available.

## Product Rules

- The Mini Program remains the primary student client.
- PayloadCMS remains the first backend/admin system.
- PostgreSQL is the persistent business database.
- Prototype/mock data is allowed only for clearly marked local development and demo paths.
- Production code must not fabricate successful login, payment, profile, or content results when upstream services fail.
- Resume and career assessment remain third-party service entries, not in-house systems.
- Student profile submission creates durable student data only after the user submits the complete profile and agrees to policies.
- Membership purchase creates an order first, then activates membership only after a paid payment event.
- Payment callbacks must be idempotent. Repeated callbacks for the same transaction must not extend membership twice.

## Backend Design

Add a Mini Program API namespace under `/api/miniprogram/*`.

Initial endpoints:

- `POST /api/miniprogram/auth/login`: exchange WeChat `code` for a signed U Link session token. Development mode may use a clearly named mock WeChat gateway.
- `POST /api/miniprogram/profile/submit`: submit complete student profile and move the student into `pending` verification.
- `GET /api/miniprogram/profile/status`: return profile, verification status, membership status, and instructor permission summary for the current session.
- `GET /api/miniprogram/home`: return growth plan, module map, featured content, and current student state.
- `GET /api/miniprogram/content`: return published content list filtered by module/category.
- `GET /api/miniprogram/content/[id]`: return one published content detail.
- `GET /api/miniprogram/growth-plan`: return the active growth plan.
- `POST /api/miniprogram/orders`: create a membership order and return payment parameters.
- `GET /api/miniprogram/orders/[orderNo]`: return order and membership status.
- `POST /api/miniprogram/payments/mock-callback`: local-development-only endpoint to simulate a successful payment callback.

## Data Model Additions

- `memberships`: student, growth plan, status, startedAt, expiresAt, source order.
- `payment-events`: event key, order, status, transaction ID, raw payload, processedAt.

Existing collections for students, growth plans, orders, content categories, contents, service links, and campus data continue to be used.

## Service Layer

Business rules live in testable service functions that depend on interfaces, not directly on Payload route handlers.

- Auth service verifies WeChat code exchange result and signs session tokens.
- Profile service validates required fields, enforces phone uniqueness, and updates verification status according to profile changes.
- Content service returns only enabled categories and published content.
- Membership service creates orders, prevents order amount drift, and activates or extends membership after payment.
- Payment service records payment events before changing order/member state to preserve idempotency.

## Mini Program Design

Replace pure local mock calls with a request wrapper that calls `/api/miniprogram/*`.

- Local demo mode may still use mock data, but only when explicitly enabled.
- API errors are surfaced as real empty/error states.
- Login page calls `wx.login`, sends the code to the backend, stores the U Link session token, then routes to profile completion or home.
- Profile page submits the complete profile to the backend.
- Home, content detail, growth plan, and order status pages read from the backend API.
- Payment action calls backend order creation, then calls `wx.requestPayment` when real parameters are available. In local demo mode it can use the mock callback endpoint.

## Verification

- Unit tests cover session signing, profile submission validation, phone uniqueness, order creation, and payment callback idempotency.
- Type checks must pass.
- CMS production build must pass.
- Mini Program JSON/WXML/JS files must remain parseable and consistent with `app.json`.
