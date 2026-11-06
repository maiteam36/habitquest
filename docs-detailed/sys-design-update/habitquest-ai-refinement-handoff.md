# HabitQuest AI refinement: Codex implementation handoff

Date: November 4, 2026  
Status: Original implementation brief, since executed with the owner's clarifications below.  
Target repository: `/Users/nkaul/Documents/repos/hq/habbit-quest`

## 1. Implementation instruction and decision authority

Implement the agreed refinements in this handoff. Start by reading the repository's applicable `AGENTS.md`, backend guide and status documents. Inspect current source before editing and preserve unrelated or uncommitted changes.

The objective is to remove redundant model calls and repeated data loading while preserving child-specific context, grounded recommendations, contextual fit, risk handling, output-policy review and parent approval.

**Execution clarifications supersede the original requirements below.** The current behavior and evidence
are in [refined AI operations](refined-ai-operations.md) and [implementation progress](implementation-progress.md).
During implementation, the owner directed that:

- Goals are saved locally only after generated recommendations select them; never bulk-import the catalog.
- Pinecone retrieval uses fast privacy masking, an embedding and semantic search, without chat-model Safety or research calls.
- Canonical research provenance replaces legacy G citations in the source-goal flow.
- Remote Safety reviews only newly generated Coach prose/explanations. Refined Coach has no remote ParentRisk call.
- Bounded habit drafts use one writer, local checks and parent approval, with no separate remote Safety review.

Normal refined Coach therefore uses two chat calls, and habit generation one. The original three-call and
whole-payload review language below is preserved as historical rationale, not the current execution contract.

The user has described a separate Pinecone capability containing research-backed goals and habits. LLM generation contextualizes that material for the parent's situation. Pinecone integration was not found in the inspected backend source; locate the actual capability and interface rather than assuming it is already connected.

### Corrections to the spoken recaps

- Safety is row **10** in the full table, not row five.
- Fit is retained as a capability, but its **standalone remote model call is removed** in the proposed flow.
- The user agreed to keep remote Safety review and expand its coverage. A blanket **"no retries" policy was not agreed**. Distinguish a generation revision from an SDK/network retry; see section 8.
- The target contains **one main Habit Coach generation call per pass**, not one total model call. ParentRisk and remote Safety remain.

## 2. Full decision table

"Local" means application code or processing inside the application's trusted environment. It does not mean a background task. Model counts are logical invocations before any revision or transport retry.

| # | Existing capability / implementation name | What it currently does | Agreed outcome | Implementation requirements | Model calls in refined first pass |
|---|---|---|---|---|---:|
| 1 | Child context / `take_snapshot()` | Rebuilds age, tier, current plan, eligible habits, shown IDs, approvals and check-ins from database queries | **Reuse application context** | Inspect existing context. Add missing structures and populate them through existing load/change flows. Fetch only missing, stale or specifically needed history. Retain authoritative access and mutation checks. | 0 |
| 2 | Privacy masking / `swap_names()` | Replaces known child names with labels before model requests | **Keep as code; no model call** | Preserve existing masking, verify coverage, and apply required privacy transformations before external embedding, Pinecone and generation. Do not claim comprehensive PII detection without evidence. | 0 |
| 3 | Risk rules / `parent_at_risk()` and `parent_risk_model()` | Local risk rules run first. A model then checks current text plus up to two prior parent messages for indirect risk | **Retain and refine risk assessment** | Reuse the selected child's loaded history. No additional query specifically for two messages. Keep the remote classifier pending a separately evaluated replacement. Preserve risk guidance routing. | Up to 1 |
| 4 | Triage / `triage()` | Classifies intent, summarizes the problem, creates search phrases, and can generate a clarification question | **Remove the standalone model call** | Route explicit UI actions in code. Use sanitized message and relevant child/topic context for retrieval. Fold conversational interpretation and clarification into Habit Coach generation. | 0 extra |
| 5 | Retrieval / `search_guidance()` and `passages()` | Searches bundled `guidance.json` locally; candidate habits are separately loaded from PostgreSQL | **Keep retrieval preparation; integrate existing Pinecone capability** | Retrieve relevant approved goals, habits and actions. Optional local guidance and Pinecone can run in parallel after masking when they add distinct information. Deduplicate and bound context. | 0 generative calls |
| 6 | Research / Brief | A model summarizes retrieved guidance into referenced practical points | **Remove the Brief model call** | Pass relevant retrieved material directly to Habit Coach. Preserve source references and applicability constraints. | 0 extra |
| 7 | Progress / `progress_facts()` and Patterns | Code prepares facts, then a model describes observations; the response composer receives both | **Remove the Patterns model call; keep facts in context** | Prepare structured counts and supported indicators in code. Reuse/update them through application context. Supply them when relevant. | 0 extra |
| 8 | Habit Coach response / currently `planner()` inside `crew.py` | Generates reply text and selects habit cards or proposed changes | **Keep as the central grounded generation call** | Supply sanitized conversation, child context, eligible retrieved material and relevant structured facts. Preserve bounded structured output and canonical identifiers. Use the product label Habit Coach. | 1 |
| 9 | Fit / `fit()` | A separate model judges whether new cards directly address the parent's problem | **Keep Fit capability; remove separate remote call** | Filter candidates before generation, require contextual fit during generation, and validate permitted IDs/relationships, duplicates and bounds afterward in code. Independently evaluate contextual quality. | 0 extra |
| 10 | Output Safety / `safety()` | A separate model checks only the main generated reply string | **Keep remote review and expand input** | Review every generated field shown to the parent: reply, card explanations, proposed-change explanations, generated clarification questions and any other generated prose. Withhold unchecked/unsafe content. | 1 per reviewed payload |
| 11 | Finalization / `decide()` | Local logic finishes or allows one full regeneration/review | **Keep deterministic finalization; remove Fit-driven regeneration** | Make outcomes explicit. Safety-triggered revision and network retry policy are open decisions with preservation defaults in section 8. Do not introduce extra loops. | 0 itself |
| 12 | Persistence / `send()`, suggestion save and acceptance | Saves conversation and pending proposals; applies changes on separate parent acceptance | **Keep persistence, approval and revalidation** | Update context after confirmed changes. Preserve prior usable pending cards during outages. Revalidate current authorization, eligibility and capacity where required. | 0 |
| Separate | Quest planner / `plan_for()` in `insights.py` | Explicitly requested routine/plan synthesis, including scheduling proposals | **Keep separate from ordinary chat** | Use existing explicit planning entry point. Never launch it automatically from a normal chat message. | Separate workflow budget |
| Separate | Weekly review / `review_for()` in `insights.py` | Explicit period comparison and review generation | **Keep separate** | Do not generate or refresh through inference on chat open or ordinary chat send. | Separate workflow budget |

### Naming

- **Habit Coach** means the conversational response generator. Its current implementation is named `planner()` in `crew.py`.
- **Quest planner** means the separate explicit plan/routine feature implemented through `plan_for()` in `insights.py`.
- A clearer internal name such as `generate_coach_response` may be used to eliminate ambiguity. Do not confuse a rename with creating another model call.

## 3. Target execution sequence and model budget

1. Authorize the request and identify the selected family/child.
2. Reuse the child's current application context and bounded conversation history.
3. Apply code-based privacy masking and recognized-risk rules.
4. Run ParentRisk when local rules have not already stopped coaching.
5. Prepare retrieval results and structured facts without Triage, Brief or Patterns model calls.
6. Apply candidate eligibility and pre-generation Fit constraints.
7. Run Habit Coach generation using the prepared context.
8. Validate the structured result and apply deterministic Fit checks.
9. Review the complete generated parent-facing payload through remote Safety.
10. Finalize the permitted result, save in a short transaction, synchronize context and return.
11. Apply actual plan changes only through a separate parent-acceptance action.

| Normal first-pass call | Logical requests |
|---|---:|
| ParentRisk | 1 |
| Habit Coach generation | 1 |
| Full-payload Safety review | 1 |
| Standalone Triage, Brief, Patterns and Fit | 0 |
| **Normal first-pass total** | **3** |

A local risk stop can use zero model calls. A model risk stop normally ends after its one classification call. Pinecone and embedding requests are additional retrieval/inference operations and must be measured separately from generative model calls.

If the existing one-time Safety-triggered revision is retained, it adds one Habit Coach pass and one Safety review, giving up to five logical calls on that path. SDK/network retries may add provider HTTP attempts. Track all three quantities separately: logical calls, generation passes and actual provider attempts.

No measured five-second latency guarantee or cost saving has been established for this redesign.

## 4. Context reuse, history and persistence

### Current facts verified in source

- Ordinary parent messages and Coach replies are stored in PostgreSQL in `hq.coach_messages`.
- Each row has a message ID, `child_id`, role, content, sources, shown habit IDs and creation time.
- The original parent text is saved; provider-input masking does not anonymize the stored conversation.
- The table does not identify the individual caregiver who wrote each parent message. `role=parent` is a message type, not an author identity.
- There is no separate chat-session identifier in that table. History is grouped by child.
- Before model work, the current backend loads up to 20 conversation entries for the selected child. ParentRisk takes up to two prior parent messages from that loaded window and appends the current message.
- Risk-guidance responses skip ordinary conversation message inserts.
- There is a 90-day cleanup rule executed on send. New Chat deletes the child's conversation.
- The frontend also currently clears a child's conversation on its first opening after a new sign-in.
- LangGraph does not have a configured checkpointer here. That does not mean conversations are unsaved: the application saves and reloads them explicitly.

### Required reuse behavior

The requirement is to avoid repeated reads of already available data, not to eliminate necessary authorization or fresh-state checks.

Inspect existing frontend and backend state. Reuse appropriately scoped, trusted context rather than rebuilding the full snapshot for every send. Browser-provided context alone cannot establish authorization or final plan eligibility.

During an appropriate initial application load, batch-load bounded recent history for all authorized children in the selected family. Keep a distinct collection keyed by each child's ID. Do not combine siblings' messages or use one family-wide last-X window that can exclude another child's history.

Choose X based on actual consumers. Start with compatible existing windows unless there is a justified change: the backend currently loads 20 entries, the response workflow formats eight recent messages, and ParentRisk selects up to two prior parent messages from loaded history.

Context should include or reference:

- Authorized family and selected child.
- Age, tier, current plan, canonical habit IDs, times/status and available capacity.
- Eligible candidate relationships.
- Previously shown/dismissed suggestions where relevant.
- Bounded conversation with trusted role/provenance.
- Relevant progress facts, period and freshness information.

Shown-habit exclusion currently extends beyond the recent model message window. Do not silently reduce it to only recent messages. Historical assignment/removal information can be fetched selectively when needed.

After saves, acceptance, dismissal and reset, synchronize or invalidate the relevant context. Handle stale state from other caregivers/devices. New Chat must also invalidate cached history and prevent late UI responses from restoring it.

Carry app-note origin as structured metadata. A parent typing `[App]` must remain parent-originated content.

Do not build a new cache service or globally reuse request-bound mutable graphs merely to satisfy this requirement. Use a minimally scoped context strategy and document its freshness/invalidation behavior.

## 5. Generation, retrieval and Fit requirements

### Pinecone and optional guidance retrieval

Discover the user's existing Pinecone capability, its interface, record schema, canonical identifiers and metadata. The inspected backend currently uses bundled BM25 guidance search; the described Pinecone service is additional context, not a verified existing connection.

- Apply privacy controls before any external embedding/search request.
- Use the current sanitized parent message and relevant child/topic context without a preliminary model rewriting call.
- Retrieve goals, habits and actions and preserve their approved relationships and sources.
- Reconcile retrieved records with the application's canonical IDs and current eligibility.
- Run optional local guidance lookup in parallel with Pinecone only when useful; deduplicate overlapping content.
- Bound the context without arbitrarily removing the only suitable candidate.
- Do not equate similarity scores with safety or proof of contextual suitability.
- Do not invent index names, credentials or a record format. Do not create/populate a new index without authorization.

If the external capability cannot be accessed, provide a tested adapter boundary, retain an explicit functioning supported retrieval path, and report the integration gap. A mock is not a completed production integration.

### Structured progress information

Remove model-generated Patterns summaries. Prepare facts and supported indicators in code and retain them in reusable context.

Include reporting periods and meaningful counts. Distinguish completion records from distinct calendar dates. Do not invent streaks, completion percentages, causes or missing schedule history. Supply relevant data directly to Habit Coach rather than launching an automatic separate analysis.

### Habit Coach generation

Use one central generation pass with:

- Sanitized current request and bounded child-specific conversation.
- Current child/plan context and eligible canonical IDs.
- Relevant retrieved research-backed material and source references.
- Relevant structured progress facts.
- Explicit contextual-fit and coaching-policy instructions.

Preserve structured output, allowed-ID restrictions and permitted action types. The model may return advice without new cards. Do not force weak cards to fill available slots.

The generator should interpret ordinary intent and handle clarification as part of this call. Explicit UI actions route through code. Generated clarification text must pass output Safety before display.

A model-reported `safe=true` or `fit=true` is not sufficient approval. The independent remote Safety reviewer remains required in this iteration.

### Fit stays as a distributed capability

| Location | Required checks |
|---|---|
| Before generation | Retrieve relevant candidates and enforce approval, age, tier, plan membership/capacity and shown-history rules |
| During generation | Select options that directly address the current problem, preferences and feedback; abstain or clarify when appropriate |
| After generation | Validate canonical IDs, permitted candidate sets, goal/habit/action relationships, duplicates, times and bounds |

Use stable IDs so differently worded descriptions of the same habit cannot bypass duplicate prevention. Do not permit arbitrary new catalog entries or persistent plan changes through free text.

Do not retain a separate Fit model invocation as middleware, a hidden tool or an agent sub-call. Code checks enforce hard boundaries; independently graded evaluations assess contextual relevance.

## 6. Safety and risk boundaries

### Privacy masking

This remains pure code. Verify the actual coverage of known names and required common personal-information patterns. Provider-input masking and trace redaction are separate controls. Neither should be described as comprehensive de-identification without evidence.

### ParentRisk

Keep local recognized-risk rules and the remote ParentRisk classifier for now. Its question is whether normal coaching should stop because the parent describes possible harm, abuse, neglect, unsafe circumstances or a caregiver close to harming the child.

Reuse the selected child's loaded history for the current message plus up to two prior parent messages. Do not issue a query specifically to obtain those messages.

Track risk, no-risk and unavailable separately. No local classifier replacement has been selected or approved. BM25 is retrieval ranking, not a replacement semantic risk/safety classifier.

### Remote output Safety: retained and expanded

The current `safety()` function reviews only `state['draft']`. Expand the single review request to include every generated parent-facing field:

- Main reply.
- Card explanations.
- Proposed-change explanations.
- Generated clarification questions.
- Other newly generated prose/labels introduced by the change.

Apply ordinary normalization and deterministic validation before constructing the review payload. Display generated wording corresponding to the reviewed payload. Preserve safe masking/restoration and UI escaping.

Retain policy checks for diagnoses, medical advice, punishment, threats, shaming, deprivation of food/sleep, taking earned rewards away, false applied-change claims and internal-detail exposure.

Do not show generated content before review completes. Do not preserve unreviewed generated explanations while withholding only the main reply.

Recommended default for an unchecked/rejected payload: withhold affected new generated content/proposals and use approved fallback wording. Preserve prior usable pending suggestions. This is an implementation of expanded review coverage, not removal of review.

## 7. Persistence, workflow separation and scope

- Keep AI suggestions as proposals. Parent acceptance remains the action that changes a plan.
- Recheck authorization, active goal/catalog flags, age, tier, capacity and pending state where required before accepting changes.
- Keep database transactions short; never hold them across provider inference.
- Preserve prior pending cards during transient provider/validation/Safety failures.
- Do not label an outage, invalid selection or intentional abstention as proof that no appropriate catalog habit exists.
- Keep Quest planning and weekly review behind their existing explicit user actions. Opening chat or sending a normal message must not automatically generate either report.
- Preserve other AI features, especially child-written risk-note handling and child-facing text screening. Do not change their models or policies through shared settings as an accidental side effect.
- Keep LangChain/LangGraph. Model calls are chosen by application code; ordinary-code graph nodes do not need remote inference.
- Do not globally cache compiled graphs whose closures capture mutable request/family/child state. Any reusable graph must receive isolated context explicitly.

## 8. Open decisions: preserve defaults and report them

| Item not finalized | Default for this implementation |
|---|---|
| History retention across sign-ins | Preserve current retention/reset behavior initially. Invalidate context on reset. Report the conflict between preloading older history and automatically deleting it at first chat open. Removing automatic reset requires a separate product decision. |
| Safety-triggered generation revision | Remove Fit-triggered revision. Preserve the current bounded Safety-triggered revision initially unless explicitly changed. Make its extra generation/review calls and latency visible. Do not introduce additional loops. |
| SDK/network retries | No blanket zero-retry change was approved. Preserve settings initially, count actual provider attempts, and distinguish retries from generation revisions. Avoid changing other AI features via a shared adapter setting. |
| ParentRisk unavailable | Current behavior continues after local checks. Preserve and document it until another policy is selected. Do not record unavailable as a confirmed no-risk result. |
| Local semantic classifier | Evaluation option only; no model or deployment has been approved. Do not silently replace remote review. |
| Exact X, context ownership and freshness | Inspect actual state structures. Choose compatible bounded windows and a minimally scoped reuse strategy. Document which reads remain necessary. |
| Pinecone interface/configuration | Discover the existing capability. Report missing access/interface details rather than inventing them or claiming a mock is production integration. |
| Scheduling requests inside Coach | Preserve currently supported proposed changes unless a dedicated-planner-only policy is selected. Never automatically launch the separate Quest planner from chat. |
| Model/provider changes and latency targets | Separate tuning work. Do not switch models or promise a five-second result without compatibility, quality and timing evidence. |

Do not stop independent work because an open item exists. Apply the preservation default, document it and report outstanding choices. Do not treat earlier document wording such as "confirmed direction" as approval for unresolved changes here.

## 9. Suggested implementation sequence

1. Inspect current state, request boundaries, source configuration and applicable repository instructions. Map reusable context and missing fields.
2. Add focused regression tests for the agreed call budget, context reuse/isolation and complete Safety coverage.
3. Implement context structures, initial/batched history loading, synchronization and targeted refresh behavior.
4. Refactor retrieval preparation; discover and connect the existing Pinecone capability where accessible.
5. Remove standalone Triage, Brief, Patterns and Fit calls. Refactor Habit Coach to consume direct retrieval and structured facts.
6. Add deterministic Fit validation and expand remote Safety to the complete generated payload.
7. Verify persistence, approval, reset, failure and separate-workflow behavior. Preserve unresolved defaults explicitly.
8. Run appropriate repository checks, update API/docs where changed, and report results and remaining gaps.

This sequence does not authorize deployments, paid live inference, new cloud resources, replacement of shared models, or changes to child-safety policies.

## 10. Acceptance checks

Use deterministic tests with synthetic fixtures and mocked provider/retrieval transports. Use the dedicated test database only for persistence/authorization checks. Do not replay real family conversations or run paid evaluations without authorization.

| Area | Evidence required |
|---|---|
| Context reuse | Warm sends reuse available information. Missing/stale fields trigger targeted refresh, not an unconditional reconstruction of every snapshot query. Necessary authoritative reads are documented. |
| Family/child isolation | Batched history, facts and retrieval constraints stay separated by authorized family/child. Parent text cannot forge app-note provenance. |
| Lifecycle | Confirmed saves update context. Acceptance/dismissal/reset invalidates or updates relevant fields. Late UI results do not restore cleared context. |
| Risk | ParentRisk receives the selected child's applicable loaded history after masking. Local risk stops bypass ordinary generation. |
| Call budget | No standalone Triage, Brief, Patterns or Fit call remains. Normal path has ParentRisk, Habit Coach and Safety. Remaining bounded revisions/HTTP attempts are counted separately. |
| Retrieval | Sanitized queries, canonical source/goal/habit/action mapping, non-duplicated context, and explicit integration status. |
| Fit | Correct direct matches and abstention; full/paused plans; shown IDs; custom habits; age/tier; unsupported IDs/actions; changed current state. |
| Progress | Honest reporting windows, sparse-data handling and record-versus-date distinctions. No invented rates/streaks. |
| Full-payload Safety | Unsafe card/change explanations or generated questions are caught even when the main reply is acceptable. Unchecked fields are not displayed. |
| Failures | Provider and validation failures preserve prior cards and do not produce misleading catalog-absence claims. No new hidden fallback model chains. |
| Separate workflows | Ordinary chat does not invoke plan/review generation or alter unrelated child-facing moderation behavior. |
| Quality | Independently labeled examples cover contextual relevance, indirect risk, benign frustration, topic changes, follow-ups and injection. Valid JSON or model self-assessment is not the grade. |
| Performance | Separate timings for context loading, masking, risk, embedding/retrieval, generation, validation, Safety and persistence; logical calls and actual attempts recorded without raw family text. |

Run repository-required formatting, linting, typing, unit/integration and relevant frontend checks. Tests should prove the changed behavior, not merely mirror implementation. Update API contract/status documents when response shapes change.

## 11. Implementation reference map

| Area | Source |
|---|---|
| Coach entry point, snapshots, history, save and acceptance | `/Users/nkaul/Documents/repos/hq/habbit-quest/backend/src/habitquest_backend/coach.py` |
| Current model roles, graph, generation, Fit, Safety and revision | `/Users/nkaul/Documents/repos/hq/habbit-quest/backend/src/habitquest_backend/crew.py` |
| Snapshot/Turn structures and legacy tools | `/Users/nkaul/Documents/repos/hq/habbit-quest/backend/src/habitquest_backend/coach_tools.py` |
| Risk and child-text screening | `/Users/nkaul/Documents/repos/hq/habbit-quest/backend/src/habitquest_backend/safety.py` |
| Local guidance retrieval | `/Users/nkaul/Documents/repos/hq/habbit-quest/backend/src/habitquest_backend/guidance.py` |
| Separate planner/review and other AI helpers | `/Users/nkaul/Documents/repos/hq/habbit-quest/backend/src/habitquest_backend/insights.py` |
| Provider adapter and settings | `/Users/nkaul/Documents/repos/hq/habbit-quest/backend/src/habitquest_backend/llm.py` and `/Users/nkaul/Documents/repos/hq/habbit-quest/backend/src/habitquest_backend/config.py` |
| Coach UI and automatic first-open reset | `/Users/nkaul/Documents/repos/hq/habbit-quest/frontend/src/components/Coach.tsx` |
| Application state | `/Users/nkaul/Documents/repos/hq/habbit-quest/frontend/src/lib/store.tsx` |
| Sign-in/fresh-chat tracking | `/Users/nkaul/Documents/repos/hq/habbit-quest/frontend/src/lib/storage.ts` |
| AI API calls and shared client behavior | `/Users/nkaul/Documents/repos/hq/habbit-quest/frontend/src/lib/api/ai.ts` and `/Users/nkaul/Documents/repos/hq/habbit-quest/frontend/src/lib/api/client.ts` |
| Conversation table | `/Users/nkaul/Documents/repos/hq/habbit-quest/backend/db/migrations/202611010001_coach.sql` |
| Existing backend tests | `/Users/nkaul/Documents/repos/hq/habbit-quest/backend/tests/test_coach.py`, `/Users/nkaul/Documents/repos/hq/habbit-quest/backend/tests/test_crew.py`, `/Users/nkaul/Documents/repos/hq/habbit-quest/backend/tests/test_safety.py` |

Do not edit applied migrations. If a schema addition proves necessary, follow repository migration conventions. A request-receipt service, new vector database or local classifier is not automatically in scope.

## 12. Required completion report from the coding agent

Report:

1. Implemented changes mapped to the full decision table.
2. Retained/removed logical calls, generation-revision behavior and actual HTTP retry behavior.
3. Reused context, reads eliminated and authoritative/refresh reads still required.
4. Pinecone integration status, including any inaccessible service or unresolved identifier mapping.
5. Test/check results and contextual quality evaluation performed.
6. Measured timings and costs, clearly separated from expectations or untested targets.
7. Defaults preserved and product decisions still open.
8. Any intentionally incomplete integration or blocked work; do not call a mocked adapter a completed implementation.

Definition of completion: the agreed context reuse and call removals are implemented, Fit remains enforced across the main flow, full-payload remote Safety remains active, separate workflows and parent approval are preserved, and required verification passes with remaining decisions explicitly reported.
