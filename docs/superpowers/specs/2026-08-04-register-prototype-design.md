# Registration Prototype Design

## Goal

Create a small browser-based interactive prototype for the `U Link` WeChat Mini Program registration flow.

The prototype is for validating flow, layout, copy, and visual direction only. It will not integrate real WeChat login, phone authorization, SMS verification, backend APIs, or persistent storage.

## Prototype Format

- Build as a static HTML prototype under `prototype/register/`.
- The prototype should be directly openable in a browser.
- Use a phone-sized frame to approximate a WeChat Mini Program screen.
- Keep the implementation dependency-free: HTML, CSS, and plain JavaScript.

## Registration Flow

The prototype includes three main states:

1. Welcome and WeChat login
   - Show the product name `U Link`.
   - Provide a primary action: `用微信登录`.
   - Login is simulated in the frontend.

2. Profile completion
   - Required fields:
     - Name
     - Phone number
     - Gender
     - Birthday
   - Phone handling has two simulated paths:
     - WeChat phone available: show the authorized phone number and allow the user to change it.
     - WeChat phone unavailable: ask the user to verify another phone number by SMS code.
   - Gender options:
     - 男
     - 女
     - 不透露
   - Birthday can use a native date input or a lightweight in-page control.

3. Completion
   - Validate required fields before submission.
   - Show a simple success screen after completion.

## Visual Direction

Use an Apple iOS-inspired interface:

- Light system background.
- Large, clear title typography.
- White grouped form sections.
- Subtle separators.
- Soft shadows only where useful.
- Rounded but restrained controls.
- Blue primary action.
- Bottom fixed action area.
- Smooth, understated transitions.

The prototype should feel like a practical Mini Program registration screen, not a marketing landing page.

## Interaction Details

- Include a visible control for switching between the simulated phone paths so the reviewer can inspect both cases.
- Show validation feedback near the relevant field or above the submit button.
- Keep all fields editable where that helps review the flow.
- Avoid storing real personal data.

## Non-Goals

- Real WeChat OAuth.
- Real WeChat phone-number authorization.
- Real SMS sending or verification.
- Backend registration API.
- Database schema.
- Production Mini Program packaging.

## Acceptance Criteria

- A reviewer can open the prototype locally and click through the entire registration flow.
- Both phone scenarios are visible and testable.
- The visual style clearly follows an iOS-like light grouped form pattern.
- Required-field validation is represented.
- The prototype files are isolated under `prototype/register/`.
