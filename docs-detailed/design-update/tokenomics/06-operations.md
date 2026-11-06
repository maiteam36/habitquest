# Tokenomics operations

## Local console and credentials

Open `http://localhost:5180/admin` directly, or choose **Admin login** below
Developer login on the Get started sign-in page. Admin login remains available
when the optional developer-login control is disabled.
The separate operator username is `admin`. Its random password is stored only as
`ADMIN_PASSWORD` in ignored `backend/.env`; `ADMIN_JWT_SECRET` is a separate random
signing secret. Neither value belongs in documentation, screenshots or frontend
environment variables. The console keeps its 30-minute token in memory; a refresh
requires sign-in. Family sessions remain separate.

`ADMIN_ENABLED` controls availability. Increment `ADMIN_AUTH_VERSION` and restart
the API to invalidate existing admin sessions. Rotate the password/signing secret
privately when needed. The console does not create an administrator in family tables
and cannot browse family conversation or generated content.

For local startup use:

```bash
cd backend
uv run python -m uvicorn habitquest_backend.main:app --host 127.0.0.1 --port 8000 --no-proxy-headers
```

Disabling forwarded-header interpretation preserves the connection address used by
local sign-in throttling. A deployment behind a proxy needs an explicit trusted-proxy
configuration and a shared rate limiter before running multiple API workers.

## Policy and pricing

The initial policy gives each family 100 daily credits, with 2 credits for a useful
Coach response, planner, review or onboarding mapping and 1 for a useful batch of up
to three habit choices. Buddy and child-note screening remain 0 family credits;
their provider costs are recorded. Family-local day boundaries use its configured
timezone. A Coach turn may reserve up to four automatic batches, with two running
at a time. Affordable partial results are supported when enforcement is enabled.

Both **Enforce coaching budgets** and **Show generation costs** default to off.
Tracking-only mode records usage and overage while allowing prototype demos beyond
daily credits and the former cumulative $5 cap. Turning enforcement on uses the
existing accumulated exposure; it does not erase prior reservations. The old caregiver
cap endpoints return 410. The imported legacy reservation is retained once as
operator carryover, not assigned to a family or represented as measured spend.

The Coach toolbar and dashboard share a slim credit pill: used/allowed credits,
a short progress track, and **Demo · limits off** or **Limits on**. Its height matches
the original child selectors; the track is 120px on desktop and can shrink on narrow
screens. Demo totals are never clamped: `114 / 100` also shows `+14 over`, while the
track stops at 100%. Pending reservations appear separately from used credits;
the remaining balance and reset time are available in the accessible description
and hover text. Completed and failed generations refresh the balance. Report
completion refreshes it before reloading the dashboard suggestions.

The admin **Show generation costs to caregivers** setting also controls the
dashboard's per-review/planner credit quotes and completed-generation accounting
details. The overall credit pill remains visible. The existing family seconds
setting remains independent. Coach child selectors display age inline as `8 yrs`.
See the [desktop/mobile evidence](../../evidence/2026-11-05/coaching-meter/README.md).

Admin configuration edits are revision-checked and audited. Tariff edits create new
versions; existing attempts keep their snapshots. The effective model list reads the
same configuration resolver used for dispatch. Changing a model in the backend env
and restarting therefore changes the model display and pricing match; the console
does not change model routing. Unmatched models show unknown pricing and unmeasured
cohorts instead of inheriting another model's averages.

Credit recommendations combine chat tokens, embeddings, Pinecone read units and
attributable egress before dividing by the configurable reference USD per credit
and rounding once. Accepted activity weights only change through an admin revision.
The seeded Pinecone rate is a **planning assumption**, because the account tariff
and free egress allowance have not been verified. Provider usage and tariff coverage
are reported separately. Verify the actual account rate before relying on it for
enforced operator-cost admission; unknown/unbounded costs fail closed when enforced.
Earlier unbounded or planning-only exposure also prevents new enforced dispatches.
Adding a new tariff does not silently reprice those historical attempts. Such history
needs a separately reviewed reconciliation before the cap can be relied upon; the
current console does not provide an invoice-reconciliation editor.

## Measurement boundaries

Admin **Generation history** displays **Input tokens**, **Output tokens** and
**Token counts** near the start of the table. Each row sums actual reported usage
from that operation's own HTTP attempts, including retries and failures that report
usage. Embedding input is included; Pinecone read units are not tokens. Cached input
and reasoning tokens are already part of provider totals and are not added twice.
Automatic habit batches retain their own rows rather than being counted again in
the parent Coach row. Conservative token bounds are never displayed as measurements.

**Measured** means both counters were reported for every token-bearing attempt.
**Partial** shows the known sums when some counters are missing. **Not measured**
means no counters were reported, and **Not applicable** means there were no
token-bearing attempts. A missing direction displays **Not measured**, while a
reported zero displays **0**. Existing historical counters appear immediately;
unknown historical usage is not reconstructed. This read-only summary adds no
provider calls, migrations or ledger writes.

Each actual HTTP attempt has an operation, invocation/retry identity, model/role,
latency, status, usage and immutable tariff snapshot. Request bodies, vectors,
responses and keys are not retained in accounting. Cached input and reasoning
counters do not double-count tokens. Failed attempts still retain measured cost or
unresolved conservative exposure. Missing usage is unknown, never silently zero.
Database writes commit before dispatch and outside the business-result transaction,
so a rolled-back result cannot erase provider exposure.

Family credits settle once for a useful generated result. Safe local responses,
failed operations and idempotent result replays do not debit extra credits. The
original quote and daily window remain attached across midnight or policy changes.
Parent interaction totals include automatic habit batches; explicit extra batches
have their own operations. Saved results keep their accounting links after refresh.
Abandoned operations release pending family credits on subsequent budget/status/new
request reads after a conservative recovery interval (420 seconds with default
settings). Dispatched cost exposure remains intact, late usage can still settle it,
and the same request key cannot silently regenerate. The interval accounts for
configured timeouts and SDK Retry-After waits. Claiming an automatic slot starts its
execution clock while preserving its original budget window and policy.

Metrics use the latest 30 days of operations, with separate attempt/model cost
cohorts and cumulative operator exposure. Server completion, individual provider
attempt latency, optional browser response observations and all-choices-ready
duration have different boundaries. Historical mixed-model samples remain estimates;
new-model cohorts display **Not measured** until observations exist. No new live
latency benchmark was run as part of this implementation.

The approved design and historical research remain in [the baseline](01-economics-baseline.md)
and [retrieval supplement](04-retrieval-cost-and-credits.md). Mocked desktop/mobile
screenshots are in [the evidence directory](../../evidence/2026-11-05/tokenomics/README.md).

## Verification and rollback

See [the execution record](05-implementation-progress.md) for actual checks and
local cutover results. Migrations `202611050003_tokenomics.sql` and
`202611050004_tokenomics_metrics.sql` are additive. Never edit an applied migration.
Retain operations/attempts and legacy carryover if rolling back the UI; restoring an
old cap endpoint or dropping accounting tables would lose the intended authority or
spending history. Any database restore needs explicit approval.

The old `scripts/check_refined_live.py` refuses to run after Tokenomics migration:
it depended on the retired reservation cap. Future paid checks require a separately
approved scope and an independent cumulative test guard. Demo bypass does not grant
permission to run live benchmarks.
