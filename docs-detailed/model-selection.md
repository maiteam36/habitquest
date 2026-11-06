# Model selection for HabitQuest

Reviewed **2026-11-03** using the live Nebius Token Factory catalog, provider documentation, official model cards
and the current application calls. This is a selection analysis, not a live model benchmark. It builds on the
[system design](system-design.md) and [HabitCoach investigation](habitcoach-investigation.md).

## Recommendation

Evaluate **`Qwen/Qwen3-30B-A3B-Instruct-2507` for small roles** and **`openai/gpt-oss-120b` for planning, fit and
policy review**. This is the best documented compatibility starting point in the shortlist, not a proven latency
winner. Keep **`deepseek-ai/DeepSeek-V4.1-Flash-1017`** as the current reference primary model during comparison.

HabitQuest mostly routes short parent descriptions, extracts supplied guidance, summarizes exact progress facts,
selects from a constrained catalog and writes brief replies. These tasks favor dependable structured output,
direct relevance and short completion time. A large reasoning model at every stage is unnecessary. Model size,
coding benchmark rank and million-token context windows do not establish performance on these tasks.

Qwen's official card identifies this Instruct version as **non-thinking**, which makes it a sensible first
candidate for short routine stages. GPT-OSS supports configurable reasoning and structured outputs, and Nebius
uses it in its schema-output examples. Those capabilities fit the current integration; parenting quality and
safety still need application-specific evaluation. Sources: [Qwen model card](https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507),
[OpenAI GPT-OSS documentation](https://developers.openai.com/api/docs/models/gpt-oss-120b),
[Nebius structured-output guide](https://docs.tokenfactory.nebius.com/ai-models-inference/json).

## What the application actually asks models to do

| Call | Current model selector | Requirement for a replacement |
|---|---|---|
| Parent risk screen | Safety model, falling back to small/primary | Short policy classification; strict `ParentRisk` schema; high risk recall and acceptable benign false positives |
| Crew triage | Small, low effort | Classify intent and extract problem/search queries; strict schema |
| Crew research | Small, low effort | Extract relevant points from supplied passages with valid citation references; strict dynamic schema |
| Crew progress | Small, low effort | Interpret supplied counts without inventing statistics; strict schema |
| Crew planner | Primary, medium effort by default | Brief useful advice, relevant catalog selections, dynamic enum/nested schema; may run twice |
| Crew fit reviewer | Primary, low effort | Reject indirect habit/problem matches without rejecting useful direct matches; strict enum schema |
| Crew reply safety | Safety, low effort | Apply the app's policy to draft advice; strict verdict schema |
| Onboarding goal mapping | Primary | JSON-object mode, allowed catalog IDs and safe goal mapping |
| Quest planner / weekly review | Primary | LangChain structured output; reasoning effort not explicitly selected at these call sites |
| Buddy lines | Small | Brief, age-appropriate plain text, followed by child-facing safety screening |
| Child-text screening | **Small**, not the dedicated safety setting | LangChain structured verdict for text children write/read; sensitive to false negatives and overblocking |
| Optional legacy coach engine | Primary | Agent tool calling and structured fit review; tool support matters if this engine is selected |

Sources: [crew roles and requests](../backend/src/habitquest_backend/crew.py#L58),
[risk and child screening](../backend/src/habitquest_backend/safety.py#L203),
[onboarding](../backend/src/habitquest_backend/ai.py#L93),
[reports](../backend/src/habitquest_backend/insights.py#L212),
[buddy lines](../backend/src/habitquest_backend/insights.py#L263),
[model adapter](../backend/src/habitquest_backend/llm.py#L26).

Changing `OPENAI_SMALL_MODEL` therefore changes child-text moderation as well as inexpensive helper calls.
Changing `OPENAI_MODEL` affects onboarding and reports as well as the coach. `CREW_ROLES` only changes crew role
assignments/effort; it is not a global effort setting for every AI feature. There is no embedding-model requirement:
the current guidance retrieval uses local BM25.

## Shortlist and published prices

Prices below are standard **USD per million input/output tokens**, checked November 3, 2026. They are token
prices, not measured cost per successful coach turn. See the [public catalog metadata](https://tokenfactory.nebius.com/api/public/models_info)
and the dated [shortlist evidence](evidence/2026-11-03/model-shortlist.json).

| Exact API model ID | Input | Output | Proposed place in the comparison |
|---|---:|---:|---|
| `Qwen/Qwen3-30B-A3B-Instruct-2507` | $0.10 | $0.30 | First small-role candidate; optional all-primary budget experiment after quality checks |
| `openai/gpt-oss-120b` | $0.15 | $0.60 | First documented planner, fit and policy-review baseline |
| `deepseek-ai/DeepSeek-V4.1-Flash-1017` | $0.30 | $1.20 | Current primary reference; keep fixed in the first role-split experiment |
| `MiniMaxAI/MiniMax-M3.1-Flash` | $0.15 | $0.60 | Alternative primary challenger with upstream effort values matching the crew's vocabulary |
| `zai-org/GLM-5.3-Flash` | $0.15 | $0.50 | Primary challenger after reasoning-control and schema verification |
| `nvidia/Nemotron-3_5-Lightning` | $0.06 | $0.24 | Lower-cost small-role challenger after thinking-control and schema verification |

The catalog's JSON-mode tags support starting with Qwen30/GPT-OSS. Some newer models have sparse/empty tags;
absence of the tag is **uncertainty**, not proof of incompatibility. Nebius recommends comparing actual schema
behavior between models. The app's current DeepSeek model has already completed its synthetic schema workflow,
even though the catalog's tags are sparse. [Nebius JSON guide](https://docs.tokenfactory.nebius.com/ai-models-inference/json).

Do not extrapolate response time from the catalog's `tokens_per_second` field: its metadata does not establish a
comparable benchmark method for HabitQuest's short, structured, multi-stage requests. Price per token also omits
the effects of reasoning length, retries, revisions, cache hits and successful-card rate.

For scale only: an assumed 10,000 uncached input tokens plus 1,000 output tokens costs $0.0042 on the current
DeepSeek rate, $0.0021 on GPT-OSS, or $0.0013 on Qwen30. These are arithmetic examples at fixed token counts,
**not observed per-turn bills**. Actual paid output/reasoning usage must be captured from the provider.

## Profiles to compare

| Profile | Primary / planner / fit | Small | Parent risk / crew safety | Purpose |
|---|---|---|---|---|
| A: current reference | DeepSeek1017 | DeepSeek1017 | DeepSeek1017 | Preserve the existing behavior for comparison |
| B: first routine-role split | DeepSeek1017 | Qwen30 Instruct | DeepSeek1017 | Isolate the small-model change first; includes child-screening evaluation |
| C: documented baseline | GPT-OSS120 | Qwen30 Instruct | GPT-OSS120 | Test the best documented schema/reasoning integration in this shortlist |
| D: primary challenger | MiniMax3.1 Flash, then GLM5.3 Flash separately | Qwen30 Instruct | Same validated reviewer as comparison baseline | Evaluate one primary change at a time |
| E: small-role challenger | Best validated primary | Nemotron3.5 Lightning | Same validated reviewer as comparison baseline | Test cost/latency after adding effective thinking control |

These are trial configurations, not rankings established by experiments. Retaining the current safety model in
profile B does not certify its safety; it simply controls another variable. Profile C changes two model channels,
so test its primary and safety replacements separately before attributing any improvement to one of them.

Proposed settings for profile C, **after compatibility/safety checks**:

```dotenv
AI_MODE=openai
COACH_ENGINE=crew
OPENAI_BASE_URL=https://api.tokenfactory.nebius.com/v1/
OPENAI_MODEL=openai/gpt-oss-120b
OPENAI_SMALL_MODEL=Qwen/Qwen3-30B-A3B-Instruct-2507
OPENAI_SAFETY_MODEL=openai/gpt-oss-120b
CREW_ROLES=planner:large:low
```

Keep the existing key in the backend environment. This document does not change `.env`. The planner's low-effort
setting is a trial against its current medium effort: compare relevance and revision rates before keeping it.
The current adapter still needs to prove that Nebius accepts the parameters it sends to each model; the settings
above are not a guarantee that every feature works without an adapter adjustment.

## Compatibility details that can reverse a speed gain

| Candidate | Documented upstream behavior | What HabitQuest must verify |
|---|---|---|
| Qwen30 Instruct2507 | Non-thinking only | Omit inapplicable reasoning parameters if Nebius rejects them. Crew currently supplies `low`; do not assume a successful parse means a reasoning control was effective. [Model card](https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507). |
| GPT-OSS120 | Configurable low/medium/high reasoning and structured output | Exact Nebius schema/refusal handling, effort behavior and temperature combinations for all call sites. The OpenAI model card describes the model; Nebius determines hosted API behavior. [OpenAI documentation](https://developers.openai.com/api/docs/models/gpt-oss-120b). |
| GLM5.3 Flash | Upstream accepts low/high/max; omitted or unrecognized effort defaults to max | The current planner sends `medium`, and report/onboarding calls omit effort. A naive primary swap can request maximum thinking upstream. Check Nebius mapping and set appropriate controls across all call sites, not just `CREW_ROLES`. [Official note](https://huggingface.co/zai-org/GLM-5.3-Flash#note). |
| Nemotron3.5 Lightning | Thinking enabled by default; disabling it uses `chat_template_kwargs.enable_thinking=false` | The current adapter cannot express that template option. Verify Nebius support before treating it as a fast direct-answer model. [NVIDIA model card](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4#api-client). |
| MiniMax3.1 Flash | Upstream documents low/medium/high/xhigh/max effort | Current low/medium values align with that vocabulary, but strict schemas, refusals, output budgets and Nebius parameter handling remain untested. [Inference settings](https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash#inference-settings). |

For each candidate, exercise **the real dynamic enum/nested schemas**, `strict=true`, onboarding JSON-object mode,
the unspecified LangChain structured-output mode used by reports/screening and any applicable agent tools.
Successful ordinary chat is insufficient. The shared adapter currently applies a 4,000-token output allowance,
one SDK retry and common temperature/effort conventions; use per-model controls only where supported.

## Availability and routing

The active catalog alone is insufficient for selection. Nebius's **November 9, 2026** serverless retirement notice
includes Qwen235 Instruct2507, older DeepSeek aliases/releases, Nemotron3 Nano/Super and other IDs that still appear
in the November 3 catalog. Avoid those for a new serverless integration. The notice does not list the six models
shortlisted above; that is not a guarantee against later retirement. `gpt-oss-20b` and safeguard variants are absent
from the inspected public catalog, so they are not assumed selectable.
[Official deprecation notice](https://docs.tokenfactory.nebius.com/november-2026-deprecation-notice.md).

Use the documented global base URL when testing mixed serverless models. The workstation currently uses
`api.tokenfactory.us-north1.nebius.com`; catalog entries span several locations, and a shared regional URL should
not be assumed to reach every model. Nebius says public processing locations can change and regional URLs can
stop working. A global URL does not guarantee regional residency or production capacity; dedicated endpoints
provide a different operational option if those become requirements.
[Public-serverless guidance](https://docs.tokenfactory.nebius.com/public-serverless).

## How to choose the winner

1. **Compatibility first:** use synthetic requests through the installed adapter and exact schemas. Record
   provider status, parse failures, refusal/incomplete handling, token usage and effective controls. Check account
   access with the chosen base URL; public catalog presence does not establish account access.
2. **Fixed task cases:** use the same prompts/snapshots across profiles, including empty, five-entry, full, paused,
   shown-history and custom plans. Include direct matches, valid no-match cases, vague messages, topic switches
   and requests to adjust existing habits. Extend [coach_cases.json](../backend/evals/coach_cases.json) rather than
   replaying real family conversations.
3. **Separate quality metrics:** measure direct card relevance, useful-card rate where a valid match exists,
   correct abstention, citation fidelity, invented facts, tone and schema validity. A schema-valid empty result is
   not automatically a correct recommendation result.
4. **Policy and child-text cases:** evaluate dangerous advice, diagnoses, coercion, prompt injection, risk false
   negatives and benign false positives. Include children aged 3-5, 6-8 and 9-13. Assess reviewers and small-model
   child screening independently; a model agreeing with itself is not a reliable safety grade.
5. **Latency and total cost:** repeat fixed cases, keeping concurrency and controls comparable; interleave profile
   order to reduce time-of-day bias. Report stage and full-turn median/tail latency, retries, revisions, fallback
   rate and cost per successful useful response. Include failures in the report, not just fast successes. Use
   paired results and uncertainty intervals once enough samples exist; do not present a tiny smoke test as a
   statistically settled winner.

The existing [evaluation runner](../backend/scripts/eval_coach.py) records elapsed time and basic card checks, but
its keyword safety grading is not a comprehensive safety evaluation. It needs expanded grading, usage metadata
and repeated/profile-aware runs for this decision. The browser timer measures user-visible response time; separate
server-stage instrumentation remains necessary to distinguish network, risk, research, planning and review.

The only model with measured local live evidence remains the current DeepSeek1017: its successful synthetic turn
took **45.08 seconds across nine calls**, and a separate probe with the original 50-second graph budget fell back
at **51.68 seconds**. No new model inference requests were made for this analysis. No reviewed source establishes
a HabitQuest-specific safety validation or an alternative model's response time.

Model changes also cannot repair the [misleading no-match flag and card-dismissal behavior](habitcoach-investigation.md#confirmed-misleading-outcome-and-card-removal).
Fix/measure those outcomes alongside the comparison so that a reviewer outage is not scored as a catalog gap.
