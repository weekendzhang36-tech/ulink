# Membership Mini Program Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the membership prototype from a desktop admin plus phone preview into a single WeChat Mini Program-style phone prototype where admins configure membership cards inside the Mini Program.

**Architecture:** Keep the static prototype under `prototype/membership/`. HTML owns the in-phone user/admin screens, CSS owns the iOS-inspired Mini Program visual system, and JavaScript owns tab switching, card type switching, admin list interactions, and live preview data updates.

**Tech Stack:** HTML, CSS, plain JavaScript.

## Global Constraints

- Keep the prototype directly openable from `prototype/membership/index.html`.
- Do not add external dependencies, build tools, real payment, real sharing, real backend, or real upload.
- Preserve the Apple iOS-inspired design direction from `AGENTS.md`.
- Admin management should happen inside the Mini Program UI, not in a desktop-style backend.

---

### Task 1: In-Mini-Program Membership Prototype

**Files:**
- Modify: `prototype/membership/index.html`
- Modify: `prototype/membership/styles.css`
- Modify: `prototype/membership/script.js`

**Interfaces:**
- Produces: A single phone-sized static prototype with `用户页` and `管理页`.
- Produces: JavaScript functions `setAppView(viewName)`, `setAdminPanel(panelName)`, `setCardType(type)`, and `updatePreview()`.

- [x] **Step 1: Replace desktop admin shell with a phone app shell**

Use one phone frame with a top Mini Program nav and segmented switch for `用户页` / `管理页`.

- [x] **Step 2: Move admin controls into mobile management panels**

Add in-phone admin sections for administrators, card settings, sale settings, content settings, and verification rules.

- [x] **Step 3: Preserve C-end detail page**

Keep the reference-like card detail page with image, price, title, benefits, membership summary, poster, share button, and pay button.

- [x] **Step 4: Wire interactions**

Update form fields, card type buttons, admin list buttons, and save buttons to drive the static prototype state.

- [x] **Step 5: Verify**

Run JavaScript syntax checks and browser interaction checks for both user and admin views.

