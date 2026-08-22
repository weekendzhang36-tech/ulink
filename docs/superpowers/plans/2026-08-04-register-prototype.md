# Register Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, browser-openable iOS-style registration prototype for the `U Link` WeChat Mini Program.

**Architecture:** The prototype is dependency-free and lives under `prototype/register/`. HTML owns structure, CSS owns the iOS-inspired visual system, and JavaScript owns simulated registration state, phone-path switching, validation, and screen transitions.

**Tech Stack:** HTML, CSS, plain JavaScript.

## Global Constraints

- Build as a static HTML prototype under `prototype/register/`.
- The prototype should be directly openable in a browser.
- Use a phone-sized frame to approximate a WeChat Mini Program screen.
- Keep the implementation dependency-free: HTML, CSS, and plain JavaScript.
- Do not integrate real WeChat login, SMS, backend APIs, or persistent storage.

---

### Task 1: Static Prototype

**Files:**
- Create: `prototype/register/index.html`
- Create: `prototype/register/styles.css`
- Create: `prototype/register/script.js`

**Interfaces:**
- Produces: A local prototype opened from `prototype/register/index.html`.
- Produces: JavaScript functions `setScreen(screenName)`, `setPhoneMode(mode)`, and `validateAndSubmit()` used by DOM event handlers.

- [x] **Step 1: Create phone-frame HTML**

Create semantic sections for welcome, profile form, SMS verification, and success states.

- [x] **Step 2: Add iOS-style CSS**

Use grouped form rows, light system background, large titles, blue primary actions, restrained radius, and bottom action area.

- [x] **Step 3: Add interaction logic**

Implement simulated WeChat login, phone-mode switching, SMS-code validation representation, required-field checks, and success transition.

- [x] **Step 4: Verify locally**

Open or inspect the static files and confirm both phone scenarios are reachable without external dependencies.
