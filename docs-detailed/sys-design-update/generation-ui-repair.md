# Generation and child-plan repairs

Follow-up: [goal/plan reliability and richer catalog cards](goal-plan-reliability.md) fixes
the subsequently reported full-plan, device-parking validation and reset/readback failures.

November 5, 2026. This supersedes the initial presentation behavior in
[catalog presentation and progress](catalog-presentation-and-progress.md).

## What the audit established

- The recent successful saved batches each contained **two habits**, matching the old
  UI's default of two. The most recent four attempts returned no drafts because the
  original cumulative $1 planning allowance could not cover another reservation.
- All five inspected generated assignments were active and had active source goals.
  Their schedules were Monday, Wednesday and Friday. They were correctly absent
  from Thursday's **Today** list, but the child had no useful view of those other days.
- Every accepted generated habit was stored with the same star icon. Draft icons were
  guessed from a few keywords, so related actions also looked alike before acceptance.
- Cards exposed almost every field at once. A goal reader and generation controls
  expanded inside an already wide recommendation, producing a long page.

These findings came from code and read-only counts/status/schedule queries. No family
messages or names are reproduced here. They do not establish current model latency.

## Parent interaction

1. Goals appear in a compact grid with larger reference artwork, child-friendly title
   and description, age and setting. Recommendation rationale is expandable.
2. Clicking a goal opens one shared workspace and prepares **three habits** when no
   previous batch exists. Merely loading the Coach page or hovering does not generate.
   Previously saved batches are reused, including their accepted states.
3. The count slider requests missing choices after a short debounce. Each request is
   bounded to three habits. The slider offers at most three extra choices beyond the
   current total. Lowering it does not delete existing choices. Errors do not loop
   into automatic retries. An explicit retry reuses the same request ID for unchanged inputs.
4. Habit cards show a larger Fluent icon, concise action, age/duration/frequency and
   add-to-plan button. Steps, help, grown-up guidance and schedule controls are expandable.
5. Acceptance still requires the existing parent/PIN checks. The client verifies the
   returned assignment against the actual plan and refreshes today's mirrored state.
   A **View plan** link gives a direct way to inspect the saved assignment.

New weekly habits default to the current weekday in the family's timezone; daily
habits retain all seven days. Parents can change the schedule before accepting.
Existing schedules were not silently changed.

## Child view and images

Today's generated habits load approved child-facing instructions and numbered steps
immediately. Materials/cue/help are available separately. The source goal's reference
image and child-facing title/description provide context without showing adult guidance.
This uses the public pinned catalog metadata; it does not import database goals or
send another model request.

Active habits scheduled for other days now appear in **Other days in your plan**.
They show their schedule and readable habit/goal details. They have no completion
button; the API continues to reject completion on an unscheduled day.

The existing writer chooses `emoji_key` from the bundled Fluent allowlist for each
specific action. The key is persisted into the accepted habit's icon so drafts,
parent plans and child cards agree. Old records retain a local keyword fallback.
No image-generation call is added. The exact requested count and existing local
content/source/novelty checks still apply; a different icon alone is not a different habit.

## Generation details and saved times

**Family settings → AI generation** has a **Show generation seconds and stage details**
toggle. It is off by default. The live three-dot status always follows actual server
stage events, including retrieval, writing, review and saving. Hiding seconds does
not replace those events with a simulated animation.

The last 100 browser operations are saved per signed-in account on that browser,
including failures, operation type, date, total seconds and server stage offsets.
They remain available under **Recent generation history** after navigation or reload.
No prompts, names, tokens or model responses are included. This is browser-local
history, not a cross-device telemetry database; clearing browser storage removes it.
Earlier calls cannot be reconstructed. Saved habit batches also retain their existing
server metrics in Postgres.

Browser totals include transport and request preparation. Server stage differences
measure the work between reported stages. A completed HTTP operation that returns
no habits is not evidence of useful-response latency. This work does not establish
a five-second guarantee, and no new paid benchmarks were run.

## Budget settings and activation

The user approved increasing the same cumulative cap from **$1 to $5**. Existing
accounted reservations of **$0.9830207** were preserved. These are conservative
reservations, not billed provider charges. The balance is not reset on restart,
cap change, timeout or failed generation.

Settings shows the cap, reserved amount and remaining allowance. Only the explicitly
provisioned budget owner can change the app-wide cap; other caregivers can read it,
and kid tokens cannot access it. The cap cannot be lower than accounted usage or
higher than the existing $100 service limit. Each reservation still checks the cap
atomically before dispatch. A missing ledger fails closed.

- `GET /v1/ai/budget` returns status and edit permission, without credentials or owner IDs.
- `PATCH /v1/ai/budget` accepts `{"cap_usd": 5}` for the budget owner only.
- `hq.planning_budget.cap_usd` is the persistent setting. `PLANNING_TEST_BUDGET_USD`
  remains the deployment fallback when no stored cap is set.
- `hq.planning_budget.owner_user_id` is provisioned by the database operator, not
  chosen by the first caller. On this workstation it was set to the existing sole
  reservation owner. Provision an explicit account when deploying elsewhere.
- Migrations `202611050001_planning_budget_settings.sql` and
  `202611050002_budget_missing_state.sql` are additive. The local database was backed
  up to a private file before application; no previous migrations were edited.

Budget failures now link to generation settings. Raising the cap for app usage does
not authorize additional agent-run paid tests; verification uses mocked providers.

## Verification evidence

The regression checks exercise automatic three-habit generation, slider append/retry,
retained choices, distinct icon keys, PIN acceptance, plan refresh, child-only copy,
other-day visibility without completion, timing preference/history, and owner-only
budget updates with usage preserved. Desktop/mobile checks intercept every API call
with synthetic fixtures; their displayed seconds are not live provider benchmarks.

Verification completed:

- Frontend: 103 tests passed, then nine focused rechecks passed after the final timing/debounce fixes;
  TypeScript and production build passed. Vite still reports its existing large-bundle advisory.
- Backend: the 797-case suite reported 796 passing cases and one new assertion expecting 409 instead
  of the existing 404 for off-day completion. That assertion was corrected; 86 focused cases passed.
  A further 32 context cases passed after adding a deterministic pre-dispatch deadline check to the
  tests. Combined statement and branch coverage is 100%; Ruff check/format and mypy pass.
- Fresh disposable database: all migrations applied and 26 schema/budget checks passed.
- Two desktop/mobile browser checks passed, including Settings edits, timing preference/history after
  reload, generation, acceptance and child details. Every API response is synthetic. Screenshots below
  show the actual rendered app; they do not contain family data.
- The API was restarted. [Read-only HTTP evidence](../evidence/2026-11-05/repair-readonly-smoke.json)
  confirms API/frontend readiness, the owner's editable $5 cap with unchanged reservations, and five
  existing generated habits visible in the child's other-day plan. No paid provider request was made.

- [Desktop goal grid](../evidence/2026-11-05/compact-goals-1280.png)
- [Desktop habit grid](../evidence/2026-11-05/compact-habits-1280.png)
- [Mobile goal card](../evidence/2026-11-05/compact-card-390.png)
- [Child habit, desktop](../evidence/2026-11-05/child-habit-1280.png)
- [Child habit, mobile](../evidence/2026-11-05/child-habit-390.png)
- [Generation Settings](../evidence/2026-11-05/generation-settings-1280.png)
