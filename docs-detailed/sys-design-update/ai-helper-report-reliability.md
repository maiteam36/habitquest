# Weekly Review and Quest Planner failure fix

November 5, 2026. Focused repair of the existing one-call report helpers.

## What failed

The message “The AI helpers are busy right now” covered an output-limit failure,
not just temporary provider unavailability. Sanitized local logs show three
`LengthFinishReasonError` failures. Stored attempt metadata explains why:

| Activity/outcome | Provider time | Output tokens | Reasoning tokens |
|---|---:|---:|---:|
| Planner, failed | 39.02s | 4,000 | 4,000 |
| Review, failed | 29.96s | 4,000 | 3,581 |
| Planner, completed | 16.27s | 3,239 | 2,800 |
| Review, failed | 19.51s | 4,000 | 4,000 |

Both helpers use the configured Nebius `deepseek-ai/DeepSeek-V4.1-Flash-1017`.
Their shared legacy adapter omitted reasoning effort, allowing the model's default
thinking behavior to consume the 4,000-token completion limit. The structured
parser then rejected the unfinished report. HTTP attempts can therefore be marked
completed while their enclosing generation operation fails. Budget enforcement was
off, so a family credit limit or operator cap was not the cause.

A second problem made retries ineffective: the dashboard retained a request ID after
an explicit failed-generation event. The server correctly refused to regenerate the
same completed/failed operation, but the next button click kept using that ID.

## Repair

- `AI_HELPER_REASONING_EFFORT=auto` now resolves to `none` for planner/review roles
  using the Nebius DeepSeek V4/V4.1 family. Other models keep their provider default.
  An explicit supported `none`, `low`, `medium` or `high` setting is available.
- Invocation and the admin effective-model display use the same resolver. The model,
  provider, 4,000-token limit and single-call workflow remain unchanged. Coach,
  generated-habit writing, Buddy and safety roles keep their existing settings.
- An output-limit failure now returns a specific “report was cut short” message
  with status 502. Temporary provider failures retain their existing message.
  Logs retain only exception class/status, never partial reports or reasoning text.
- A confirmed stream failure lets the next explicit button click use a new request
  ID. An interrupted connection or still-running response retains the original ID
  to prevent duplicate work. The server's failed-result replay also permits a new
  explicit request. There is no automatic new generation or retry loop.
- Truncated reports/suggestions are not saved. Failed operations do not settle
  family credits; incurred provider usage remains in Tokenomics.

The parameter choices follow the provider's [chat-completion reference](https://docs.tokenfactory.nebius.com/api-reference/inference/create-chat-completion)
and DeepSeek's [thinking controls](https://api-docs.deepseek.com/api/create-chat-completion/).
The first lists `reasoning_effort=none` and explains that completion limits include
reasoning; the second documents `none` as the thinking-mode off switch.

## Verification

Regression checks reproduce real SDK truncation with synthetic responses for both
helpers, verify no partial persistence/debit, exercise failed-key replay and successful
fresh requests, and inspect the actual outgoing reasoning/model/token-limit fields.
Frontend screen tests cover both buttons across explicit 502/503 failures, failed
replay, still-running status, and interrupted streams.

Completed verification:

- 1,015 backend tests passed against the disposable test database, with 100%
  statement and branch coverage. Ruff check/format and mypy passed.
- 154 frontend tests passed, including ten report-button retry scenarios. The
  production build passed; its existing large-chunk warning remains.
- Restarted the local API on port 8000. Readiness and liveness both returned 200.
  The authenticated effective-model endpoint confirms `reasoning_effort=none`
  for both helpers, with the same configured model and 4,000-token limit.
  The frontend on port 5180 also returned 200.
- No schema migration, family-data repair or private environment-file edit was
  needed. No budget, provider or model change was made.

No paid live generation was included in this repair. The timings above are evidence
from earlier user requests, not a new benchmark or a promised response time.
