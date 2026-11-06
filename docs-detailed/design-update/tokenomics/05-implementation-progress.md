# Tokenomics execution record

**Implemented and running locally, November 5, 2026.** The owner approved the complete
plan, including embedding and Pinecone search costs. Three implementation agents
worked on accounting, admin/authentication, and frontend behavior; the root agent
integrated provider hooks, regression checks and the local rollout.
No paid provider checks were run during this execution.

**Later approved follow-up:** a sign-in-page Admin login link and reported
input/output tokens in admin Generation history are documented in
[current operations](06-operations.md). The initial rollout and verification below
remain as historical evidence.

## Delivered

- Additive operations, HTTP attempts, family-local daily windows, immutable tariff
  versions, policy audit and restricted operator/service database roles.
- Separate usage and timing for generation, review, embeddings and Pinecone search;
  no request bodies, vectors, response text, keys or credentials in accounting.
- Durable cost exposure before dispatch, retries counted separately, useful-result
  credits settled once, saved-result replay and bounded automatic-batch slots.
- Strict-mode handling of unresolved prior costs and stale-request recovery that
  releases family credits while retaining dispatched provider exposure.
- An isolated, unlinked `/admin` route, separate random credentials and short-lived
  in-memory session; configuration, effective models, prices, metrics and audit.
- Family credit meters, per-generation accounting and parent/automatic-batch totals.
  Family Settings retains optional seconds and recent timing history. Caregiver
  global-cap reads/edits now return 410 rather than exposing operator data.
- No changes to model routing, prompts, safety policy, goal/habit links or points.

## Verification

| Check | Result |
|---|---|
| Complete backend suite | **1,004 passed**, 100% statement and branch coverage |
| Backend lint, format, types | Ruff check/format and mypy passed |
| Fresh disposable database | All migrations, including `003` and `004`, applied; final suite used `habitquest_tokenomics_test` |
| Frontend suite | **144 passed** |
| Production frontend build | Passed; existing large-bundle warning remains |
| Mocked Chrome flows | **4 passed**, admin/Coach at 1280px and 390px; external requests blocked |
| Documentation and secret checks | Local links/code fences/whitespace passed; no private env values found in repository text |
| Local HTTP after restart | Readiness, admin login/config/models/prices/metrics/history/audit and `/admin` passed |
| Local authorization checks | Admin token rejected by family APIs; caregiver/kid tokens rejected by admin; kid denied family allowance |
| Local privacy/policy checks | Family USD fields omitted; legacy cap endpoint 410; defaults 100 credits, enforcement off, cost visibility off |

The initial combined backend run found a test supplying incomplete activity weights
and uncovered missing pre-cutover replay/search-failure checks. Those were corrected
before the final full run. No application source changed after the passing final suite.

## Local rollout

The verified target was `habitquest` on `127.0.0.1:5432`, using `hq_dev`.
The previous port-8000 API was drained before backup and migration. Family, child,
assignment, draft and Coach-message row counts were unchanged. Prior reservations
remain in the old ledger and were imported once as **$1.796936060000** of carryover
at the new ledger's 12-decimal precision; that is a conservative historical
reservation, not newly measured provider spend.

The database backup was validated as a PostgreSQL custom archive and is private:
`/private/tmp/habitquest-before-tokenomics-20261105T212803Z.dump` (216,076 bytes).
Migrations `202611050003_tokenomics.sql` and `202611050004_tokenomics_metrics.sql`
were applied without editing prior migrations. Admin secrets were generated only
in git-ignored `backend/.env`, with file permissions `0600`.
The API was restarted on port 8000 with `--no-proxy-headers`; the existing frontend
continues on port 5180. No unrelated service was restarted.

Open `http://localhost:5180/admin`, use username `admin`, and read the password from
`ADMIN_PASSWORD` in the private backend env file. See [operations](06-operations.md).
Screenshots use synthetic data: [interface evidence](../../evidence/2026-11-05/tokenomics/README.md).

## Evidence limits and remaining benchmark phase

Pinecone tariffs/allowances remain explicitly labeled planning assumptions until
verified against the actual account. Unknown usage is not treated as zero; historical
assumptions are not silently rewritten. The console does not implement invoice
reconciliation. New-model cohorts show unmeasured values until matching usage exists.
Browser timing observations are diagnostic, distinct from server and provider time.

No new live latency or cost benchmark was performed, so this work does not establish
a five-second response guarantee. Future paid benchmarks require a separately approved
scope and independent cumulative test cap. The old live checker refuses to run after
Tokenomics migration because it depended on the retired application cap. Demo bypass
never authorizes unbounded paid testing.
