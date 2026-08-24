# Software Development Principles

## Truthfulness And Data Integrity

- Reuse real persisted results when they exist. Do not redo work or fabricate new output when a real stored result is available.
- Do not create fake fallback results to make an error look successful. If an upstream API, database read, media asset, model call, or background job fails, surface the real failure and make retry possible.
- Do not use placeholder copy, synthetic records, mock UI data, or generic labels as substitutes for missing or failed evidence.
- Do not add frontend fallback data, synthetic defaults, or client-side masking to bypass, hide, or make a broken backend/API flow look successful. Fix the underlying data flow or show the real empty/error state.
- Prototype, demo, fixture, and local development data may be synthetic only when clearly marked as such. Synthetic prototype content must not be mixed into production paths or presented as real user, payment, verification, or operational data.

## Product Modeling

- Do not let technical constraints define the product model. Existing endpoints, reusable functions, or convenient implementation paths must not decide when a business object exists.
- First describe the user workflow: where the user starts, what they see, what they click, what data is created or updated, and what page or process owns the next state.
- Persisted records must correspond to an explicit user commitment or product event. Browsing, previewing, drafting, and trial generation should not create durable business objects unless the user confirms an action such as save, use, submit, launch, or archive.
- Every data object must have clear ownership and lifecycle boundaries. A page may reference another object, but it must not blur which object is the source of truth.
- Cross-flow handoff should pass stable references, not copied state. Prefer IDs or durable references; the receiving page should load its primary object instead of relying on duplicated URL fields or copied snapshots that can drift.
- Boundary changes must be explicit in both UX and code. When a flow turns one domain object into another, that identity change must happen through a clear user action and a clear implementation entry point.

## State And URLs

- Put only shareable, stable, workflow-defining state in URLs.
- Do not put ambient UI state, selected workspace/account/store, temporary local choices, or implementation details in business URLs unless the product explicitly requires shareable deep links for that state.
- Avoid leaking internal object IDs into unrelated flows. If an ID belongs to one domain, use it only inside that domain or as an explicit source reference.
- A page should read the object it owns. If a page edits a task, read the task. If a page uses a material/reference, read that material/reference. Do not treat a source object as the destination object's data after the boundary has been crossed.

## Persistence And Side Effects

- Do not create durable records merely to work around an API shape. Change the API or create a proper non-persistent draft endpoint instead.
- Temporary state should be temporary by design: local component state, session state, cache, or an explicit draft resource with cleanup semantics.
- Backend writes should match the user's intent. Saving a reusable reference, creating a production task, launching a job, and archiving an item are different actions and should have different lifecycle semantics.
- Confirmation requirements should match business risk. Do not require high-risk confirmations for ordinary save/edit/library actions. Do require explicit confirmation for destructive, costly, public, or externally visible actions.

## Testing Integrity

- Do not change product code merely to satisfy a brittle or outdated test. First verify whether the test still represents intended behavior; update the test when the product contract has intentionally changed.
- Tests must validate real behavior and data boundaries. Do not introduce product fallbacks, fake data, or hidden compatibility shims solely to make tests pass.
- Add regression tests for the bug that actually occurred, not only for the line changed.
- Prefer tests that exercise public behavior, API contracts, persisted state, and user-visible outcomes over tests that overfit incidental implementation details.
- When a broader test suite has known stale failures, report them clearly instead of silently reshaping product code around them.

## Debugging Method

- Find the root cause before fixing. Do not stack speculative fixes on top of symptoms.
- Trace the bad value or failed action backward to where it entered the system.
- In multi-layer flows, verify each boundary: UI event, frontend payload, API request, backend validation, persistence, read model, and navigation.
- Validate fixes against the real failing path, not only against source inspection.
- If the running local service is stale, restart it and retest before concluding the code still fails.

## Frontend And UX

- Build the actual user workflow, not a decorative shell around it.
- Screens should prioritize operational information, decision evidence, and executable actions. Avoid filler content that hides incomplete behavior.
- Empty, loading, failed, and partial states must be honest and useful.
- Do not use visual density to disguise missing product behavior.
- Before handing off UI work, self-review it from the target user's workflow and fix obvious issues such as repeated information, unclear hierarchy, poor alignment, unusable controls, or misleading states.

## API And Data Contracts

- Keep API request shapes aligned with domain intent. Do not expose fields to clients just because internal audit or persistence code happens to need them.
- Backend-generated audit metadata should usually be backend-owned, not client-supplied, unless the user is explicitly confirming a risky action.
- Validate IDs according to their domain. External source IDs, internal entity IDs, task IDs, and asset IDs are not interchangeable.
- Use explicit fields for explicit meanings. Do not overload one field to mean "content article", "event registration", "membership order", and "third-party assessment entry" across different flows.
- Prefer adding the right endpoint or request model over bending an old endpoint into a new workflow.

## Deployment And Persistence

- Production data must survive application redeploys, process restarts, image rebuilds, and container replacement.
- PostgreSQL must be an independent persistent resource. Do not use an ephemeral application container database for production.
- PayloadCMS uploads, article images, attachments, school logos, and partner materials must be stored in Tencent Cloud COS or another explicit object store, not as the only copy on the application server disk.
- Runtime secrets such as `PAYLOAD_SECRET`, database passwords, WeChat Pay keys, Mini Program credentials, and COS keys must come from environment variables or secret management, not from committed files.
- Before database migrations, bulk imports, payment-related changes, or production releases, create a database backup and know how to roll back.
- Rolling back an application release must not roll back or delete unrelated database records, uploaded files, orders, memberships, or verification history unless an explicit data rollback plan has been approved.

## Worktree And Branch Discipline

- During the single-developer MVP stage, work directly in the current `main` checkout unless the user asks for a branch.
- Use a branch or isolated workspace for multi-person collaboration, high-risk migrations, large refactors, or experiments that should not touch `main` directly.
- Before committing, inspect the working tree and make sure you understand the included changes.
- Do not revert unrelated user changes. If unrelated changes exist, leave them alone or ask when they block the task.

## Verification Before Completion

- Do not claim a fix is complete without fresh evidence.
- Run the narrow regression test that proves the bug is fixed.
- Run type checks or build checks when the change touches typed code or contracts.
- When possible, verify the actual UI/API path that failed for the user.
- Report what passed and any known remaining failures or risks.
