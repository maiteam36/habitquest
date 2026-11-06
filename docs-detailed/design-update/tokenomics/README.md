# Tokenomics

**Status: implemented and running locally, November 5, 2026.** Three parallel
investigations covered model/call economics, budget accounting, and admin access/UI.
The initial analysis created only design documents and sanitized evidence. The owner
approved the complete plan, including retrieval costs. Completed implementation and
verification are tracked in the [execution record](05-implementation-progress.md).
No new paid model calls have been made during this work.

**Retrieval-cost update:** query embeddings, Pinecone search and attributable response
egress now explicitly contribute to operation estimates and recommended credit weights.
See [retrieval cost and credit derivation](04-retrieval-cost-and-credits.md).

Review completed: all three investigations cross-checked the proposal. Documentation
checks passed for local links, JSON sample/cost arithmetic, whitespace and code fences.

## Implemented policy

The implementation records provider usage and adds a **`/admin`** route with a
separate **`admin`** login. An Admin login link appears below Developer login on
the sign-in page. Admin generation history shows input/output token totals and
their measurement completeness. Family generation history stays in Family Settings.
A daily **coaching-credit allowance** is visible to caregivers; dollar costs appear
only when an admin enables them. The prototype starts in **tracking-only mode**:
usage is measured while demos can continue beyond coaching quotas and the old cap.

| Setting | Initial value | Reason |
|---|---|---|
| Daily family allowance | **100 coaching credits** | Generous starting product policy; calibrate from real usage, not a claimed benchmark. Shared across caregivers/children in that family. |
| Coach turn / Get more goals | **2 credits** | Includes retrieval, Coach writing and generated-text review as one useful result. |
| Reference cost per credit | **$0.0015, configurable** | Planning conversion for recommended weights, including embedding/search/egress; round the combined cost once. Accepted activity quotes stay fixed until an audited admin revision. |
| Batch of up to three habit choices | **1 credit per useful batch** | One writer call normally produces the whole batch. Automatic and explicit batches count identically. |
| Quest planner / weekly review | **2 credits each** | Initial weights pending measurements; no claim that their costs equal Coach. |
| Onboarding mapping | **2 credits** | Useful generated goal mapping only. |
| Buddy encouragement / child-note screening | **0 family credits** | Measure operator cost; do not make child-facing encouragement or screening compete with parent coaching. Existing bounded technical controls still apply. |
| Enforce coaching budgets | **Off** | Tracking continues beyond allowances and the old $5 imported-provider cap. Turning it on uses the same accumulated usage. |
| Show generation costs to caregivers | **Off** | Always show credits; optional USD breakdown is controlled by the server. |
| Admin username | **`admin`** | Separate operator identity, never a caregiver named admin. |
| Admin credential | **Provisioned privately** | Cryptographically random password and separate signing secret, stored only in ignored `backend/.env`. |

A new Coach response plus four fresh habit batches uses up to **6 credits**. A
planning session illustrated as five Coach turns plus four batches uses **14
credits**, so 100 credits covers seven such complete sessions plus two credits.
These are allowance illustrations, not a restriction to seven logins or sessions.

## Baseline evidence collected before implementation

| Finding | Evidence and practical meaning |
|---|---|
| Recent Coach response: **11.73s** | One November 5 synthetic local HTTP request. Not a population average or browser-completion benchmark. |
| Recent three-habit batches: **10.35–10.71s** | Two successful samples with different transport boundaries. Both used one Luna call. |
| Three-habit token-cost estimates: **$0.0007573–$0.0008176** | Observed Luna tokens × verified uncached list rates. Not reconciled invoices. |
| Previous reservation per three-habit batch: **$0.0289192** | Approximately 35–38 times those samples; conservative reservation, not actual cost. |
| Historical Coach samples cannot be split accurately by model | Luna and DeepSeek token counts were merged. The two-chat uncached allocation bound is **$0.0007828–$0.0021657**, excluding embedding and Pinecone. New instrumentation separates provider attempts. |
| Retrieval planning example: **$0.000022 per lookup** | 100 embedding tokens + 1 reported Pinecone RU at the Standard $18/M rate + 20,000 egress bytes at list equivalent. Usage/account plan are assumptions, not measured bills. |
| Coach including that retrieval example: **$0.0008048–$0.0021877** | The upper reference / $0.0015 gives 1.45847, rounded once to **2 credits**. Retrieval is included; it is not charged again per returned goal. |
| Full fresh screen can take substantially longer than Coach text | Three/four automatic batches run after Coach, with at most two in flight. Around **33s** is a plausible scenario using the recent samples, not a measured combined benchmark. |
| Planner/review/buddy benchmarks are missing | Show **Not measured**, not a fabricated average. Add instrumentation before benchmarking. |

## Documents

1. [Economics baseline and strategy](01-economics-baseline.md): current models, prices,
   call inventory, evidence boundaries, generation/session/family estimates and cost formulas.
2. [Analysis and benchmark plan](02-analysis-plan.md): what to measure, missing data,
   instrumentation boundaries and the controlled benchmark procedure.
3. [Execution and admin design](03-execution-plan.md): `/admin`, credentials, schema,
   API/UI contracts, enforcement semantics, rollout, tests and rollback.
4. [Sanitized baseline data](baseline.json): reproducible historical metrics and pricing
   assumptions, with no prompts, generated text, credentials or family identifiers.
5. [Retrieval cost and credit derivation](04-retrieval-cost-and-credits.md): embedding,
   Pinecone RUs/egress, complete planning examples, included usage and credit arithmetic.
6. [Execution record](05-implementation-progress.md): completed checks and local rollout.
7. [Operations](06-operations.md): admin access, policy, measurement boundaries and recovery.

## Approved implementation scope

The owner approved implementation in the order described in the execution plan:
**accounting → admin/authentication → family credits and demo bypass → UI/verification
→ local credential provisioning**. This includes moving shared-cap editing out of
caregiver Settings and defaulting the local prototype to tracking-only mode while
preserving previous reservations. Models and safety workflows stay as configured.
This updated scope includes retrieval telemetry and all-component credit recommendations,
with explicit pricing assumptions until actual account tariffs/usage are available.

A smaller alternative is accounting plus a read-only admin dashboard first; it would
not yet deliver the requested configurable family allowance or demo bypass. The full
incremental plan is recommended because all three are part of the requested outcome.
New paid benchmark runs remain a separate, bounded approval after instrumentation and
mocked checks are ready; existing evidence is sufficient to design the system now.
