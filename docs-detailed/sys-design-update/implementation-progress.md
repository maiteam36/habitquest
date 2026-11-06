# AI refinement and planning integration: execution record

Started November 4, 2026. Implementation follows the [integration plan](pinecone-planner-integration-plan.md) and [refinement handoff](habitquest-ai-refinement-handoff.md). This file distinguishes implemented code from locally activated and live-verified behavior.

## Milestones

**Latest November 5 goal-linking follow-up:** [Goal links and saved recommendations](goal-linking-and-saved-recommendations.md)
records the read-only integrity audit, exact habit-to-goal navigation, habits before Goals on the
dashboard, saved/new Coach separation, larger cards and aligned dialogs. Existing data links
were consistent; no family records needed reassignment.

**Latest November 5 presentation/dashboard follow-up:** [Compact cards and dashboard plans](compact-cards-dashboard.md)
records four desktop goal columns, small habit previews with popup details, original 512px artwork,
and complete per-child assignment visibility on the dashboard. It preserves the workflow below.

**Latest November 5 reliability follow-up:** [Goal/plan reliability](goal-plan-reliability.md)
records the device-parking validation correction, explicit capacity/removal controls, incremental
goal and habit save/restore, approved details after chat reset, visible research, and automatic
three-habit preparation beneath newly returned goals. A separate real-API browser check exercises
the full workflow against a disposable database with provider transport blocked.

**November 5 update:** [Generation and child-plan repairs](generation-ui-repair.md)
records the compact cards, larger artwork, three initial habits on explicit goal interaction,
append-only count slider, child steps and other-day plan visibility. Settings now controls
generation seconds and browser-local timing history, plus the owner's persistent spending cap.
The approved cap is $5; prior $0.9830207 reservations were retained. This update supersedes
the earlier no-generation-on-goal-opening interaction rule.

| Work | Current state | Evidence / remaining gate |
|---|---|---|
| Refined LangGraph workflow | Active and live-verified | One central generation and review of new Coach prose/explanations only; two normal chat calls, one bounded revision. Successful synthetic recommendation below. |
| Model/provider configuration | Implemented and active | Separate imported credentials, Responses API, low reasoning, `store=False`; current commented `.env.example`. |
| Trusted context and reset protection | Implemented and active | Cross-worker fingerprints, durable reset fence, repeated followup/topic-switch handling and full goal-to-completion journey tested. |
| Frontend context and timing | Implemented and running | 100 tests pass; production build and desktop/mobile checks pass. Real backend stages, generation seconds and local icon-based setting suggestions are active. See the presentation follow-up below. |
| Pinecone source cards as goals | On-demand persistence active | Retrieval and browsing write nothing; only reviewed selected goals are created. All 377 unused bulk-created goals were backed up and removed. |
| Explicit generated habits and acceptance | Active and live-verified | One bounded writer, local validation, persisted drafts, child ownership and atomic parent/PIN acceptance. Successful one-call generation below. |
| Local activation and live measurements | Active and verified | Six additive migrations applied after backup. API/frontend running; final 788-test backend suite, frontend checks and bounded live benchmark pass. Initial-request latency remains above five seconds. |

## Preserved decisions

- Latest owner clarification: normal refined Coach uses one generation and one generated-text Safety review: two logical calls, or four with the single allowed revision. No remote ParentRisk call in refined Coach. Bounded habit generation uses one writer and local validation, at most one local correction. Legacy workflows remain separate.
- A canonical Pinecone habit card becomes a goal. Generated actions become habits under that goal only after the parent accepts them.
- Explicitly opening a goal prepares three habits only when no saved batch exists (November 5 owner update). Passive page loading, hovering and reading saved drafts do not generate. Quest planning and weekly review remain separate explicit features.
- Catalog-card points are excluded. Existing HabitQuest scoring and rewards remain in place.
- Five seconds is a target. Mocked tests establish correctness, not production latency or model quality.
- Private `.env` files remain ignored. Committed examples contain names, instructions and non-secret defaults only.
- Canonical source goals are saved only after reviewed generation selects them. No bulk preload.
- Source-goal retrieval uses code masking, embedding and Pinecone, with no chat/Safety/research calls. Legacy G guidance is excluded; canonical research provenance remains in the source reader.

## Verification environment

Database tests use separate disposable databases for context, generation and integration. They do not truncate the running app's family data. External model transport is blocked in tests; HTTP fixtures explicitly replace it. Existing local edits are preserved, and no commit or push is performed by this work.

Final frozen verification passed **788 backend tests with 100% statement and branch coverage** against the
disposable database with all six migrations. Ruff check/format and mypy passed. The frontend passed
**81 tests** and its production build. A new standalone wheel contains the current runtime modules and
the exact pinned canonical artifact. No application data was truncated by these tests.

## Initial live results and fixes

The user authorized three synthetic Coach sends and one explicit habit-generation request. They used a
temporary family, which was removed afterward; no actual family conversation or plan was used.
The [sanitized evidence](../evidence/2026-11-04/refinement-live-check.json) records routing, attempts,
stage timing and outcomes.

- All three Coach sends reached ParentRisk, embedding and Pinecone, then failed source hydration. Their
  3.05s / 2.05s / 1.59s round trips were **failures, not useful-response latency**. Pinecone returns numeric
  metadata as floats (`512.0`, for example). The adapter now accepts equal finite integral values while
  retaining identity/hash/type checks. A sanitized real response fixture passes; 76 focused retrieval tests
  pass with 100% statement/branch coverage.
- Habit generation took 12.75s, used two writer attempts and returned no draft. Both failed local validation
  before Safety. The original report did not retain the rejection rule, so its cause cannot be asserted.
  Responses now include safe allowlisted validation codes/schema paths, and correction instructions name
  the failed rule. A proven clipped-sentence false positive was also fixed. All 26 previously captured
  synthetic prototype actions pass current copy/source checks; [offline replay evidence](../evidence/2026-11-04/generation-validation-offline-replay.json).
- No unreviewed output was displayed or assigned. These checks do not meet the useful-result or five-second
  acceptance criteria.

The prototype's prior accounted usage was imported at **$0.32470198**. The conservative persistent ledger
stood at **$0.46379734** after these checks, under the same **$1 cap**. These amounts reserve worst-case
attempts using carried-over price estimates; they are not actual billed cost. Existing main-provider
risk/Safety costs are outside that imported OpenAI ledger.

The user subsequently authorized up to two additional Coach requests and two habit-generation requests,
with inspection between operations and the same cumulative cap. The first additional Coach check
([evidence](../evidence/2026-11-04/refinement-live-recheck.json)) completed retrieval, then received two parsed
Safety rejections and returned a fallback in **16.09s**. It made five logical chat calls, one embedding and
one Pinecone search; it created **zero local goals**, as required. Its review reasons were not captured, so
the reason for rejection cannot be inferred from that report. The persistent ledger reached **$0.50095606**.
One additional Coach operation and two habit-generation operations remain within this authorization.

The on-demand implementation passed 158 focused Coach/context/graph tests, a lock-order regression,
84 generation/validation tests, 37 catalog tests and 17 real database permission/concurrency tests.
A subsequent frozen run passed **755 tests with 100% statement and branch coverage**, including the real
database guard tests. Frontend verification again passed **81 tests** and the production build. Final
ranking and writer-contract fixes discovered by live checks will receive another complete verification.

## Successful refined Coach check

The [text-only live evidence](../evidence/2026-11-04/refinement-text-only-live.json) uses an isolated app
instance and a synthetic family, with real configured providers and the local database. Measurement
includes ASGI request handling, providers and database work; it excludes local TCP and browser paint.

- Outcome: useful homework/help-seeking recommendations, **7.3865 seconds**, exactly **two chat calls**
  (one Luna Coach, one DeepSeek text review), one embedding and one Pinecone search, no revision/retry.
- Two selected goals were created from a starting count of zero. The remaining 375 child-use source cards
  were not materialized. The synthetic family was removed afterward; canonical goals remain reusable.
- Stage times: generation **3.903s**, text Safety **1.317s**, embedding **1.504s**, Pinecone **0.486s**;
  local masking/validation/hydration were milliseconds. Code risk routing took **0.045ms**, with no risk model.
- Independent source review found both goals relevant and the advice supported. It also found that UUID
  ordering put the alternative before the primary goal; migration006 now preserves the selected order.
  Minor copy issues remain: repetitive research caveats/jargon and an awkward semicolon at a reason's
  schema limit. Those were authored by the model, not introduced by post-review truncation.
- The habit writer then made two attempts in **12.778s** and was correctly rejected locally for parent-facing
  instructions in child fields. Parsed synthetic output also exposed completion/participation confusion.
  The writer contract and field-specific feedback are being corrected; no habit was assigned.

The cumulative conservative ledger reached **$0.56573398** after that check.

## Successful bounded habit check

The [final habit evidence](../evidence/2026-11-04/refinement-habit-final-live.json) confirms that the corrected
field audiences and completion contract work against the configured live writer:

- **6.8901 seconds**, **one Luna writer call**, zero corrections, zero remote risk/Safety calls.
- One locally validated child-facing draft under the selected help-signal goal; no automatic assignment.
- Completion describes an observable action; help, breaks and adult support remain available separately.
  Independent review passed source fit, age-appropriate child instructions and completion semantics.
- Synthetic family cleanup completed. The local source-goal count stayed at two, demonstrating that habit
  generation does not bulk-create goals.
- Conservative ledger after all approved functional checks: **$0.59335318 of the same $1 cap**.

Both functional check allowances are now used. **The measured five-second target is not met** by these
single samples; neither establishes p50/p95 or browser paint latency.

## Final latency adjustments

Tested changes now remove server-only hashes/provenance, research IDs/URLs and duplicated research limits
from model-facing projections while preserving full canonical state and source-reader links. Source-goal
responses target a concise practical reply and one primary goal for one issue; required support and evidence
limits remain in context. Parent-only habit copy also has soft brevity targets without removing required
content. Existing model HTTP pools retain idle connections for 60 seconds, preserving connection counts,
TLS, role credentials, attempts and per-request deadlines. Pinecone transport behavior is unchanged.

The user approved three additional synthetic Coach turns and one contextual habit benchmark. All four
completed successfully, without revisions or SDK retries, under the same cumulative $1 guard.

## Final bounded live benchmark

[Complete synthetic evidence](../evidence/2026-11-04/refinement-latency-benchmark.json). This sequential
benchmark uses real providers and database operations through an isolated in-process ASGI client. It
excludes browser paint and local HTTP transport; inspection pauses occur between operations.

| Operation | Elapsed | Chat calls | Result |
|---|---:|---:|---|
| Initial homework-help Coach request | **6.692s** | 2 | One direct learning-question goal; text approved on first pass. |
| “Make it easier” follow-up | **4.336s** | 2 | Same goal retained; guidance simplifies the action to pointing. |
| Change topic to screen-time stopping | **3.996s** | 2 | Correct media stopping-point goal, with no homework carryover. |
| Generate a homework gesture habit, no extra materials | **4.612s** | 1 | Valid child instructions, `materials=[]`, observable completion, no correction. |

Each Coach turn used one embedding and one Pinecone request, with no remote risk/research/guidance call.
Habit generation used no retrieval or Safety model. Independent source/quality review passed all four
criteria. Goal count moved from two to three: only the newly selected screen-time goal was added; all
other canonical cards remained unmaterialized. Synthetic family/draft data was removed, with no habit
assigned to an actual family.

Final conservative accounted usage is **$0.73244854 of the original $1 OpenAI test cap**, including the
prototype's prior usage. This is a reservation ledger using carried-over price estimates, not billed
cost; existing Nebius calls are outside that imported-provider ledger. The approved benchmark allowance
is now used. No further paid checks are scheduled.

**Three of these four operations were under five seconds; the initial Coach request was not.** The
successful warmed timings satisfy the target in this small sample, not as a production guarantee or
p50/p95 result. A larger independently authorized benchmark would be needed to establish consistent
first-request and browser-visible performance.

## Catalog presentation and progress follow-up

The owner reported 20–30 seconds for initial Coach results and 6–7 seconds for
habit generation. This follow-up improves presentation and makes the wait
observable before further provider-latency optimization. See the
[implementation and timing guide](catalog-presentation-and-progress.md).

- Original age-specific catalog art, categories and age badges now accompany
  source goals. Source details retain child/parent steps, adaptations and research.
- Coach requests ordered steps; habits show steps, duration, cue, materials,
  completion and grown-up help, with a direct add-to-plan action and expandable schedule.
- All four generation interfaces show server-reported stages and browser seconds.
  Saved habit batches retain their server generation duration. No fake progress or
  unreviewed intermediate wording is streamed.
- Location dropdowns became Fluent icon choices with local, editable suggestions
  from explicit places, topics, conversation context and category. Canonical goal
  contexts restrict choices; no extra model call is used. Generated habit icons
  also use the existing Fluent assets.
- The API was restarted; no-cost HTTP and mocked graph probes passed. No environment
  or schema changes were needed, no application goals were bulk-imported, and no
  further paid provider checks were run.
- Verification: 100 frontend tests, build, two desktop/mobile browser checks;
  793 backend cases verified across the full suite and corrected 29-case focused
  recheck, 100% combined statement/branch coverage, Ruff check/format and mypy.

Two saved habit batches inspected read-only took **7.484s** and **8.447s**, with
nearly all time in the one writer call. The 20–30-second Coach request has no
retained stage evidence, so its cause is not established. The earlier 4–5-second
synthetic sample must not be treated as typical browser latency. This UI work
does not establish that the five-second target has been met.

## Remaining measurements

Measure full Send-to-reviewed-result p50/p95, useful-result rate, revision rate, logical calls, provider attempts, token usage and stage times on fixed synthetic cases. A handful of development checks cannot establish production p50/p95. Report failures and fast fallbacks separately from useful answers.
