# Analysis and benchmark plan

**Benchmark phase remains planned.** Instrumentation and admin implementation were
approved separately; see the [execution record](05-implementation-progress.md).
Existing synthetic evidence establishes a starting point, not a current per-model
cost distribution or reliable latency percentile. No extra live-provider calls were
authorized for implementation verification.

## Questions to answer

1. What does each useful Coach response, habit batch, plan, review and helper cost?
2. How much time is spent in each model, retrieval, server processing and the browser queue?
3. How much of a family's allowance does one interaction consume, including automatic batches?
4. How often are retries, corrections, failures or missing usage changing the economics?
5. What allowance covers normal family use while giving a predictable cost envelope?
6. How much do query embeddings, similarity search and response egress contribute to
   each operation and the credit recommendation, including tiny fractional amounts?

## Measurements and definitions

| Metric | Start → finish | Important distinction |
|---|---|---|
| Provider attempt duration | One actual HTTP dispatch → response/failure | Includes the provider's waiting/network time; record retries separately |
| Logical model-call duration | One application invocation → final SDK result | Can include multiple HTTP attempts/backoff |
| Generation time | The writer invocation(s) for one operation | Separate writer from Safety, embedding and Pinecone |
| Server response latency | Authorized endpoint entry → final useful response/result | Includes database/context/persistence and all required checks |
| Browser response latency | User action → reviewed answer rendered | Includes reset waits, network and render overhead |
| All-choices-ready latency | Coach Send → all requested child batches terminal | Includes queue delay and overlapping batches; report partial failures separately |
| Cost per generation | Sum of priced invocations for that logical operation | Include review and corrections; do not multiply per-habit cost by batch count twice |
| Cost per useful result | Total provider expenditure, including failures, / useful results | Exposes the cost of reliability problems; separate from success-only mean |
| Family allowance | Credits settled + pending within family-local daily window | Independent of token price, logins and number of children |

The existing stage stream reports stage-entry elapsed offsets. These are not individual
stage durations or time-to-first-model-token. Structured outputs do not currently expose
TTFT. Show **Not collected** for TTFT until a genuine token event is instrumented.

## Evidence work already completed

- Resolved current role/model/provider configuration from allowlisted settings and call sites.
- Verified current prices from official OpenAI and Nebius sources; identified Pinecone billing gaps.
- Extracted metadata from November 4/5 successful synthetic artifacts into [baseline.json](baseline.json).
- Kept prior narrow-output ASGI runs separate from later multi-goal and three-habit workloads.
- Calculated uncached token-price estimates only where model/usage attribution supports them.
- Identified the difference between the old global reservation guard and per-family cost accounting.

## Instrumentation needed before publishing new averages

Capture a server-owned operation ID plus invocation and HTTP-attempt IDs. Carry the
context through LangGraph and thread/executor boundaries. Cover both the role-specific
adapter and legacy `chat_model`, plus embeddings and Pinecone. No extra model calls,
research agents, prompt logging or model changes are needed.

| Field group | Minimum fields |
|---|---|
| Identity | Operation ID, parent interaction ID, family/child scope, activity, session ID where known |
| Configuration | Requested and returned model ID, provider identity, API mode, service tier/region, prompt/pipeline version, effective token cap |
| Workload | Requested/useful result count, batch size, fresh versus reused result, automatic versus explicit origin |
| Time | Request, queue, invocation and attempt start/end; outcome; browser observations stored separately |
| Usage | Nullable input/output/cache-read/cache-write/reasoning token details; Pinecone billed/read units where available |
| Retrieval precision | Embedding input tokens; Pinecone reported RU value and rounding status, egress bytes, precise aggregate usage separately; account plan/allowance verification status |
| Price | Immutable tariff ID/version, verified source/date, currency, rate-match status |
| Cost | Token-priced estimate, complete/incomplete/unpriced/reconciled status, unknown exposure and outstanding holds |
| Allowance | Policy/window ID, credits held/settled/released, mode at admission |
| Credit derivation | Accepted activity quote, reference USD/credit, component cost profile, measured versus assumed quantities and recommendation/policy revision |

For embedding, capture the response's usage before the adapter reduces it to a vector.
For Pinecone, capture REST `usage.read_units` and `usage.egress_bytes` before hydration
discards them. Reported RUs are rounded up by Pinecone; mark their cost as an estimate,
not precise billed cost. Do not log the embedding vector or returned document fields.
See the [retrieval supplement](04-retrieval-cost-and-credits.md) for rates and examples.

Do not store names, prompts, generated prose, messages, raw response/error bodies,
credentials or full sensitive provider URLs in tokenomics tables. An HMAC input digest
can support idempotency without retaining duplicate family text in telemetry. Apply
family RLS; admin sees sanitized metrics and operator configuration only.

Failures need records even if a later business transaction rolls back. A late response
can supply usage after the UI deadline; capture its cost without surfacing its rejected
content. Unknown usage stays unknown. A successful final SDK response must not be copied
onto each preceding failed retry. Report usage coverage as well as cost averages.
Record retrieval work even when it returns no eligible goals or later validation fails.
Attribute it to the initiating operation once; saved catalog reads and subsequent habit
batches do not inherit another embedding/search charge unless they actually dispatch one.

## Benchmark phases

| Phase | Method | Completion criterion |
|---|---|---|
| A: historical baseline | This document and existing metadata; no paid calls | Every active capability has evidence or an explicit Not measured label |
| B: accounting correctness | Mocked providers with fixed usage, errors and retries | Correct costs, holds, release, replay and family isolation; no raw-content capture |
| C: initial live smoke | Separate bounded authorization after B | Useful results for requested capabilities, recorded per-model usage, observed latency and budget debit; do not claim p95 |
| D: representative baseline | Fixed synthetic cases, controlled model/config versions and concurrency | Comparable samples, known measurement boundaries and cost completeness |
| E: family demand calibration | About two weeks of normal prototype use in tracking-only mode | Per-family daily activity/credits and simulated limit hits; content-free aggregates |

For each paid phase, present the number/type of calls, worst-case spend reservation,
existing cumulative test allowance and cleanup scope before execution. Stop on the first
unexpected accounting/validation error and inspect it; do not burn the allowance in
blind retries. The demo bypass must not bypass the separately approved benchmark cap.
No new real-family data is needed for synthetic provider tests.

### Workload matrix

- Fresh Coach request returning three/four relevant goals; separately measure subsequent
  nine/twelve habit choices with the current two-request queue.
- Warm follow-up reusing usable batches; topic change; Get more goals; More habit choices.
- One explicit three-habit batch, one correction case where it naturally occurs, and
  rejection/failure paths classified separately from useful outputs.
- Quest planner, weekly review and onboarding at several controlled context sizes.
- Buddy writing and its text screen; eligible child check-in screening.
- Manual schedule edits and saved detail reads as zero-generation controls.
- Cold process/connection and warmed runs, single request and current bounded concurrency.
- Retrieval accounting fixtures: small fractional RUs versus rounded API units, missing
  embedding/search usage, zero-result searches, egress allowance, known included usage,
  unknown plan, retries and replay; verify combined-cost credit rounding only once.

Use the same sanitized cases and prompt versions when comparing configurations. A
provider's published tokens/second is not a substitute for these measurements. Do not
change models in this implementation; any later model experiment is separately scoped.

### Reporting rules

Always show the time window, task, exact model/provider/config cohort, batch size,
sample count, useful-result rate, retry/correction rate and missing-usage fraction.
Show individual results or ranges for tiny samples. The initial dashboard can show
an empirical mean/median with `n` and a **Low sample** badge; show p95 only with at least
100 comparable useful observations, still labeling it empirical rather than guaranteed.
Use success-only latency and separate failure latency; cost-per-useful-result includes
failures. Keep billed invoice reconciliation separate from list-price calculations.

Historical browser-only timing entries remain useful but unpriced. Do not guess their
model or family from the current configuration. Historical mixed-model Coach totals
cannot be backfilled as exact model costs. Unknown Pinecone plan costs remain unknown.

## Budget calibration decision

Start with 100 family credits/day and the [provisional activity weights](README.md).
After tracking-only observation, inspect per-family daily median/p90/p95 credits,
number of children, active sessions, failure credits released and operator cost.
Report how many legitimate sessions would have been interrupted under each proposed
allowance. Change the allowance by an audited admin policy revision, not by silently
repricing existing generations.

Calibrate from total direct operation cost, including embedding, search and attributable
egress. Admin compares measured cost-derived recommendations with the accepted activity
quotes before publishing a revision. Keep shared overhead and plan minimums separate,
and distinguish list-price equivalents from estimated payable or reconciled cost.

The analysis is ready for approval now. Complete empirical benchmarks for currently
unmeasured helpers require the instrumentation phase, not invented numbers in the plan.
