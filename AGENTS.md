# AGENTS.md

## Project Overview

This is a new WeChat Mini Program project named `U Link`.

The product is intended to use WeChat Mini Program as its primary carrier. The long-term direction is a youth growth ecosystem connecting campus, career, local culture, and international experiences. The MVP must stay focused on student login, paid membership, and finance-career content/services before expanding into the broader ecosystem.

## Working Language

- Use Chinese for product notes, user-facing copy, and collaboration summaries unless the user asks otherwise.
- Code identifiers may use English where that is more idiomatic for the selected framework.

## Current Project State

- The repository has entered the early development preparation stage.
- A pnpm workspace has been initialized with `apps/cms` and `apps/miniprogram`.
- `apps/cms` is the initial PayloadCMS + Next.js backend/admin project.
- `apps/miniprogram` is the initial native WeChat Mini Program frontend project.
- The MVP architecture direction is Tencent Cloud self-hosting with PayloadCMS as the first backend/admin system.
- MVP product scope has been clarified in `docs/product.md`.
- MVP architecture direction has been clarified in `docs/architecture.md`.
- Project-wide development principles have been added in `DEVELOPMENT_PRINCIPLES.md`.

## MVP Scope

The first MVP should focus on a small, monetizable WeChat Mini Program loop:

- Student login and mandatory profile completion through WeChat.
- Lightweight student verification by class instructors.
- Membership purchase and membership status management.
- WeChat Pay integration for membership and paid offerings.
- Content publishing for several finance-career categories.
- Basic admin/operation capabilities for membership, content, orders, and payment status.

Student identity and school data must be designed as a multi-school model. The first rollout may include only Guangdong University of Finance in the school list, but UI, data models, and copy must not imply that U Link is a mini program made specifically for that school.

The following capabilities should be integrated through third-party services in the MVP instead of being built in-house:

- Resume creation or resume optimization.
- Career assessment / psychometric assessment.
- Other specialist career-service workflows that already have suitable external providers.

The following ecosystem modules are future expansion areas and should not dominate MVP implementation:

- Intangible cultural heritage content and routes.
- Study tour /研学 and cross-border cultural exchange.
- Broader internship ecosystem beyond the initial finance-career track.
- Entrepreneurship exits and large partner marketplace features.

## Expected Platform

- Primary client: WeChat Mini Program.
- Preferred MVP client: native WeChat Mini Program (`miniprogram` with WXML/WXSS/JS/TS), unless later implementation constraints require a framework.
- Preferred MVP backend/admin: one self-hosted PayloadCMS project on Tencent Cloud.
- Preferred MVP database: PostgreSQL.
- Preferred MVP file storage: Tencent Cloud COS.
- Do not use WeChat Cloud Development as the primary business data store unless the user explicitly changes this decision.

## Product Design Direction

- Keep the product UI aligned with an Apple iOS-inspired visual style unless the user explicitly changes direction.
- Prefer light system backgrounds, grouped white form sections, clear hierarchy, restrained rounded corners, subtle separators, and blue primary actions.
- Favor practical Mini Program screens over marketing-style landing pages.
- Avoid visual clutter, oversized decorative elements, heavy gradients, and one-off styling that does not match the iOS-like system direction.
- Registration, onboarding, profile, settings, and form-heavy flows should feel especially close to iOS grouped forms.

## Development Guidelines

- Follow `DEVELOPMENT_PRINCIPLES.md` and `docs/development-workflow.md` for truthfulness, data integrity, product modeling, persistence, testing, debugging, frontend UX, API contracts, branch discipline, and verification.
- Use `docs/development-checklist.md` as the quick self-review before committing or handing off implementation work.
- Prefer small, reversible changes while the project shape is still emerging.
- Keep project documentation updated when foundational decisions are made.
- Avoid introducing large abstractions or cross-platform frameworks before the product requirements are clear.
- Keep user privacy and campus/community data sensitivity in mind from the start.
- Do not commit secrets, private keys, app IDs, tokens, database credentials, or WeChat platform credentials.
- Prototype/mock content is allowed only for clearly marked prototype, demo, fixture, and local development paths. Do not use mock data or frontend fallback data to hide a broken production backend/API flow.
- Production persistence must survive redeploys. PostgreSQL, PayloadCMS uploads, COS files, orders, memberships, verification history, and secrets must not depend on application container local disk.
- During the current single-developer MVP stage, work directly in `main` unless the user asks for a branch. Use a branch or isolated workspace for high-risk migrations, large refactors, or future multi-person collaboration.

## Documentation To Add Later

When decisions are available, add or update:

- `README.md`: product positioning, setup, development commands, and release notes.
- `docs/wechat-mini-program.md`: WeChat Mini Program app ID handling, local development, preview, upload, and review process.
- `docs/privacy-and-compliance.md`: user data, consent, retention, and compliance considerations.

## Open Questions

- Which finance-career categories should be shipped first?
- Which third-party providers should be used for resume services and career assessment?
- What exact membership packages, benefits, and prices should be used for launch?
- What import format should be used for college, major, class, and instructor phone data?
- Which Tencent Cloud deployment shape should be used first: CVM, Lighthouse, or container-based deployment?
- What production domain names should be used for API and admin access?
