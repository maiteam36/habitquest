# AI configuration and model handoff

Date: November 4, 2026  
Status: Historical implementation-plan supplement. The configuration below has since been implemented
and activated locally; see the [operations guide](refined-ai-operations.md) and
[execution record](implementation-progress.md) for current behavior and live verification.

Execution override: refined Coach now calls only Coach generation and generated-text Safety; ParentRisk
remains a legacy role. Bounded habit generation calls its writer plus local validation, with no separate
remote input-risk or habit Safety call. The model table below records the earlier planning baseline.

Companion to the [integration plan](pinecone-planner-integration-plan.md). The user requested that the planning service's working models and required configuration move into the integrated app, with instructions in the env file itself. “Scotch model” is interpreted here as **Habit Coach model**, not a new provider model identifier.

**Carry over `gpt-6-luna` for the integrated Coach and generated-habit writer, and `text-embedding-3-small` with 512 dimensions for Pinecone queries.** Keep risk/Safety and unrelated existing AI features on their current provider/model routing initially. The model change is explicit: Phase 1 establishes the refined graph on the current provider; Phase 2 activates the carried-over Luna configuration for Coach; Phase 3 uses it for habit generation.

The source of these values is the local planning service's typed settings, model constructors, env example and the allowlisted non-secret fields from its current private configuration. They describe configured behavior, not a new live compatibility or credential test.

## 1. Which model handles each call

| Call | Current implementation/configuration | Integrated target | Provider credentials / API |
|---|---|---|---|
| ParentRisk | Main backend; currently resolves to `deepseek-ai/DeepSeek-V4.1-Flash-1017` because safety/small overrides are empty | Retain that resolved model explicitly through proposed `PARENT_RISK_MODEL` | Existing main `OPENAI_BASE_URL` + `OPENAI_API_KEY`; current OpenAI-compatible chat adapter |
| Habit Coach generation | Main crew's `planner` role currently resolves to the same DeepSeek model; standalone planner uses `gpt-6-luna` | **`COACH_MODEL=gpt-6-luna`**, low reasoning, one generation per pass | New planning OpenAI credential group; Responses API, matching the prototype |
| Full generated-payload Safety | Main crew currently resolves to the same DeepSeek model | Retain explicitly through proposed `OUTPUT_SAFETY_MODEL`; review all new displayed wording, including generated habit batches | Existing main provider group; separate request from generation |
| Query embedding | Standalone retriever uses `text-embedding-3-small`, 512 dimensions | **Same model and dimensions**, including any multi-query embedding | Planning OpenAI credential group; embeddings API, not a chat/completion call |
| Pinecone similarity search | Documents API `2026-07`, dense field `embedding` | Preserve the existing target/schema | `PINECONE_API_KEY` and verified data-plane host; **no generation model** |
| Generated-habit writing | Standalone action writer uses `gpt-6-luna` with low reasoning | **`HABIT_GENERATION_MODEL=gpt-6-luna`**, separate explicit action | Planning OpenAI credential group; Responses API |
| Quest planner, weekly review and onboarding | Main primary model | Preserve current resolved DeepSeek model and existing workflows | Existing main provider group |
| Buddy lines and existing child-text screens | Main small-model fallback currently resolves to DeepSeek | Preserve existing settings/policies | Existing main provider group; do not switch through a shared default |
| Triage, Brief, Patterns and Fit | Separate model roles in current crew | No separate model invocation after refinement | Local code/constraints or work inside central generation |

Three normal Coach logical calls remain: ParentRisk → Coach → Safety. Luna replaces the **central generation model**, not the complete safety pipeline. Changing a model name must not create a preliminary planner agent/tool loop. Generated habit batches use the same explicit Safety boundary without changing existing child-note/buddy policies.

## 2. Credential separation and routing

The main app's current `OPENAI_API_KEY` is used with its configured Nebius-compatible base URL. The planning service's identically named variable is used for direct OpenAI generation and embeddings. **The names match; the configurations are not interchangeable.**

Use two explicit backend provider groups:

| Group | Variables | Consumers |
|---|---|---|
| Existing main AI provider | Existing `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_SMALL_MODEL`, `OPENAI_SAFETY_MODEL` | Retained risk/Safety and unrelated legacy AI features |
| Imported planning OpenAI provider | Proposed `PLANNING_OPENAI_BASE_URL`, `PLANNING_OPENAI_API_KEY` | Luna Coach, Luna habit writer and query embeddings |
| Vector retrieval | `PINECONE_API_KEY`, `PINECONE_HOST` and exact index/release settings | Pinecone Documents search only |

The imported key comes from `hq-ai-services/planning-agent/.env`'s `OPENAI_API_KEY`, copied locally into the **new** variable when implementation is activated. No key values belong in documentation, terminal output, command-line arguments, frontend variables or commits. The embedding client must use the imported OpenAI group explicitly; it must not inherit the legacy chat provider's base URL/key.

Model constructors must accept an explicit role/provider configuration. Test routing with injected fake clients: two identical model labels must not accidentally imply shared credentials, and empty required values must not silently redirect a call to another provider.

## 3. Source-to-target environment inventory

“Proposed” means the main backend must add and validate that setting. Its current `Settings(extra="ignore")` would silently ignore many of these variables; copying them now is not an integration.

| Existing planning-service setting | Current resolved value / behavior | Target/disposition |
|---|---|---|
| `OPENAI_API_KEY` | Populated secret, not displayed | Copy privately to proposed `PLANNING_OPENAI_API_KEY`; do not overwrite main `OPENAI_API_KEY`. |
| OpenAI base URL | Direct provider default in the prototype's constructors | Make explicit as proposed `PLANNING_OPENAI_BASE_URL=https://api.openai.com/v1`. |
| `OPENAI_CHAT_MODEL` | `gpt-6-luna` | Proposed `COACH_MODEL` and `HABIT_GENERATION_MODEL`, independently editable. |
| Responses API / reasoning / store | Code sets Responses API, low reasoning, `store=False` | Explicit proposed role API-mode/reasoning settings; retain `store=False` for these calls. |
| `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` | Carry name/value into main retrieval settings. |
| `OPENAI_EMBEDDING_DIMENSIONS` | `512` | Carry exactly; reject mismatched index/snapshot settings. |
| `PINECONE_API_KEY` | Populated secret | Carry privately, backend only. |
| `PINECONE_HOST` | Populated private endpoint | Carry the exact verified data-plane host; do not invent/reconstruct it. |
| `PINECONE_INDEX_NAME` | `hq-habits-v1` | Carry exactly. |
| `PINECONE_NAMESPACE` | `habits-0-1-0` | Carry exactly. |
| `PINECONE_API_VERSION` | `2026-07` | Preserve Documents API wire contract. |
| `PINECONE_METRIC` | `cosine` | Carry and verify against index schema. |
| `PINECONE_VECTOR_FIELD` | `embedding` | Carry and verify field name. |
| `PINECONE_CLOUD`, `PINECONE_REGION` | Example/setup metadata: `aws`, `us-east-1`; not consumed by current retriever settings | Retain as documented setup expectations, not as settings that create or move an index. The verified host remains the query target. |
| `CATALOG_VERSION` | `0.1.0` | Carry exactly and filter retrieval by release. |
| `CATALOG_SNAPSHOT_POINTER` | Existing pointer under `hq-infra-setup/pinecone-data-updates/datasets/current.json` | Configure an explicit main-app path to the pinned packaged release. Do not copy a sibling-relative path without resolving it. |
| `SSL_CERT_FILE` | `/etc/ssl/cert.pem` in the existing local setup | Carry where valid; use a valid deployment CA bundle/system trust on other hosts. Never disable verification. |
| `PLANNER_MODE` | Private config `live`; template `fixture` | Map deliberately to main `AI_MODE` plus proposed `RETRIEVAL_MODE`; do not introduce a second independent live/fixture controller for the same request. |
| `PLANNER_REQUEST_TIMEOUT_SECONDS` | `45` outer prototype deadline | Initial proposed generated-habit operation deadline `45`; do not overwrite main Coach's existing overall deadline. |
| `PLANNER_MAX_OUTPUT_TOKENS` | `1600` for standalone planner generation | Initial proposed `COACH_MAX_OUTPUT_TOKENS=1600`; evaluate completion/quality after integration. |
| `PLANNER_ACTION_MAX_OUTPUT_TOKENS` | Base floor `2800`; actual writer ceiling is `max(base, 800 + 1100 × requested_count)` | Proposed `HABIT_GENERATION_TOKEN_FLOOR=2800` plus explicit count-aware ceiling. Three drafts currently imply 4100, not 2800 tokens. Account for the actual limit. |
| Provider timeouts/retries in code | Planner model 30s/0 retries; action model `min(60, outer deadline)`/0; embeddings 15s/0; Pinecone HTTP 15s | Expose/document role-specific values. Preserve main Coach's one SDK retry initially, new habit writer's zero retries, and retrieval's existing behavior. |
| `PLANNER_MAX_MODEL_CALLS` | `5`, includes prototype harness repair | **Do not transfer the five-call agent loop.** Main graph has one generation per pass and one bounded Safety revision; new habit writing has a separate bounded correction allowance. |
| `PLANNER_SESSION_TTL_SECONDS`, `PLANNER_MAX_SESSIONS` | `3600`, `50` prototype in-memory sessions | Inventory only; main auth/history/context replaces prototype sessions. Do not apply these values to family authentication or chat retention. |
| `PLANNER_LIVE_BUDGET_USD` | Private local testing cap `1.00`; public example defaults to `0.10` | Preserve its role as a development spending guard. Proposed `PLANNING_TEST_BUDGET_USD`; no implicit fresh budget or ledger reset during migration. |
| `OPENAI_CHAT_INPUT_RATE_PER_MILLION`, `OPENAI_CHAT_OUTPUT_RATE_PER_MILLION` | Existing accounting estimates `0.10`, `0.50` | Proposed planning-rate fields, explicitly labeled estimates from source config; verify before relying on them. They are not a new verified pricing claim. |
| `PLANNER_ACTION_EVAL_CAPTURE` | `false` | Proposed `HABIT_GENERATION_EVAL_CAPTURE=false`; ordinary parent text is not captured. |
| `LANGSMITH_TRACING`, tracing code | Disabled; factory also disables `LANGCHAIN_TRACING_V2` | Preserve disabled tracing; retain main `TRACE_COACH=false` default and its separate redaction policy. |

The source usage ledger is single-process local test accounting. Keep it intact. Before activating the imported spending guard, define one owning writer and carry forward accounted/reserved usage; never let the demo and main app concurrently write the same unsupported file. Do not manufacture a new allowance by pointing to an empty file. This is rollout/accounting work, not permission to spend on live testing or a new production billing service. Pinecone charges are not included in the prototype guard.

## 4. Commented env instructions to deliver

The proposed [backend AI env template](backend-ai.env.example) contains role-by-role comments, key-placement instructions, exact non-secret source values, and labels for settings that do not yet exist. It is a **planning artifact**, not a currently runnable replacement for `backend/.env`.

During implementation:

1. Add typed settings and explicit role routing before adding active values. Validate model/base URL/key/API-mode combinations; avoid silent ignore/fallback.
2. Merge these commented sections into `backend/.env.example` and document them in backend setup/API guides. Keep all actual secret fields empty in the example. Prefer one maintained template after implementation, linking this planning artifact as historical context.
3. Merge the same explanatory comments and selected values into the existing ignored `backend/.env`, preserving database, JWT, Google auth, PIN/dev-login, CORS and legacy AI settings. Read dotenv as data; do not shell-source it. Preserve restrictive file permissions.
4. Copy only the required provider secrets/private host from the existing planning service locally. Do not place server secrets in `frontend/.env*` or `VITE_` variables.
5. Resolve and verify the catalog artifact path from the actual backend working directory, then test a clean build outside the sibling-checkout layout.
6. Verify `.env` remains ignored and untracked; check the intended patch for accidental secret inclusion. Never show full env-file contents in a completion report.
7. Restart only when the phase is implemented and being activated. Report the effective non-secret model/role matrix and which provider groups are configured.

## 5. Configuration acceptance checks

- Mocked tests assert **each role's exact model, API mode and credential group**, including embeddings. Validate Responses/strict structured output support using the imported configuration rather than assuming the existing Nebius client is interchangeable.
- ParentRisk and output Safety resolve explicitly; changing `COACH_MODEL` or `HABIT_GENERATION_MODEL` does not alter child moderation, reports or other calls.
- Wrong/missing OpenAI planning credentials fail the enabled feature's configuration check, without falling back to the main provider key. A disabled Pinecone feature does not prevent login/daily quests from starting.
- Wrong model/dimension/index/namespace/release combinations fail clearly; a no-network local snapshot check is distinct from remote target readiness.
- Fake/fixture modes make zero provider/embedding/Pinecone calls. Production/live configuration cannot silently return fixture data.
- Logging may show role, model, provider hostname, logical call/attempt counts and token/time metrics. It must not show keys, authentication headers, raw settings objects or family prompts.
- Retry and generation-revision counts remain separate. Token reservations use actual output ceilings; latency reports include risk, embedding/search, Coach, Safety and persistence.
- A separately authorized synthetic live check is required before claiming the imported credentials/models work in the integrated app. Configured values and mocked success alone do not prove this.

## Sources

- [Planning settings](../../../hq-ai-services/planning-agent/src/hq_planner/config.py), [env example](../../../hq-ai-services/planning-agent/.env.example), [configuration guide](../../../hq-ai-services/planning-agent/CONFIGURATION.md).
- [Planner model construction](../../../hq-ai-services/planning-agent/src/hq_planner/agent/factory.py), [habit/action writer](../../../hq-ai-services/planning-agent/src/hq_planner/generation/action_generator.py), [token-count policy](../../../hq-ai-services/planning-agent/src/hq_planner/generation/action_count.py), [retriever](../../../hq-ai-services/planning-agent/src/hq_planner/retrieval/pipeline.py).
- [Main settings](../../backend/src/habitquest_backend/config.py), [main adapter](../../backend/src/habitquest_backend/llm.py), [risk/child screening](../../backend/src/habitquest_backend/safety.py), [crew role resolution](../../backend/src/habitquest_backend/crew.py), [other AI calls](../../backend/src/habitquest_backend/insights.py).
