# HabitQuest detailed records and investigations

This folder was renamed from `docs` on November 6, 2026. It preserves the detailed
investigations, proposals, implementation records and evidence from the build.
For the consolidated current design, start with [docs-design](../docs-design/README.md).
Treat dates and approval statuses below as historical records; later implementation
and deployment evidence may supersede them. `backend/docs` was not renamed.

Current implementation and verification are recorded in the November 4 operations/progress documents below,
on the local `nkaul` branch. Older investigations describe the November 3 snapshot at commit
`831f4617acd5b36e67b1e431089a5f381f9dfd7e`.

| Document | What it covers |
|---|---|
| [Tokenomics analysis and execution plan](design-update/tokenomics/README.md) | Proposed model/task cost and latency baseline, separate `/admin`, family coaching credits and tracking-only demo mode; awaiting approval |
| [Goal linking and saved recommendations](sys-design-update/goal-linking-and-saved-recommendations.md) | Audit of existing goal links, habits before Goals, focused plans, saved/new Coach separation, larger cards and aligned dialogs |
| [Compact cards and dashboard plans](sys-design-update/compact-cards-dashboard.md) | Four desktop goal cards per row, small habit previews, popup details, original artwork, and two-child dashboard verification |
| [Refined AI operations](sys-design-update/refined-ai-operations.md) | Implemented Coach and generated-habit workflows, model routing, source mapping, configuration and operational limits |
| [Implementation progress](sys-design-update/implementation-progress.md) | Current execution milestones, test evidence, activation and live measurement status |
| [AI refinement handoff](sys-design-update/habitquest-ai-refinement-handoff.md) | Original design baseline; later owner clarifications narrow remote Safety to new Coach text, remove refined ParentRisk, and require on-demand goal persistence |
| [Pinecone and planning integration plan](sys-design-update/pinecone-planner-integration-plan.md) | Detailed sequence: Coach refinements first, Pinecone cards as goals, generated actions as habits, APIs/storage/tests and three workflow diagrams; existing points behavior retained |
| [AI configuration handoff](sys-design-update/ai-configuration-handoff.md) | Model per call, Pinecone/OpenAI env migration, credential separation and a commented proposed env template |
| [Earlier streamlined AI proposal](streamlined-ai-implementation-plan.md) | Historical one-total-call option; superseded by the refinement handoff's retained remote Safety design |
| [Current system design](system-design.md) | Frontend, API, database, identity, daily quest loop, AI workflow and local configuration, with diagrams |
| [Coach request walkthrough](coach-request-walkthrough.md) | Plain-language stages, SQL lookups, exact request examples and the nine-call timing breakdown; added November 4 |
| [AI system deep dive](ai-system-deep-dive.md) | LangChain/LangGraph roles, full workflows, guardrails, measured bottlenecks, overkill and optimization designs |
| [HabitCoach investigation](habitcoach-investigation.md) | Slow responses, missing recommendation cards, measured evidence, confirmed defects and proposed fixes |
| [Model selection](model-selection.md) | Nebius shortlist, current prices, role assignments, compatibility limits and evaluation plan |
| [Sanitized evidence](evidence/2026-11-03/README.md) | Synthetic provider timing and anonymous local eligibility counts used in the investigation |

The November 3 investigations describe the earlier crew implementation. The November 4 operations and progress
documents track its replacement and planning integration. Historical timing evidence and model recommendations
remain dated observations; they are not measurements of the refined implementation.

The review combined separate frontend and backend surveys, a read-only inspection of local database counts,
mocked coach checks and the synthetic provider probes from the local bootstrap. It did not send the family's
conversation to a model, reset the chat or change the running service's settings. Evidence omits credentials,
family and child identifiers, names and message content.

More focused references live in [backend/docs/](../backend/docs/):
[API contract](../backend/docs/frontend-integration.md), [schema](../backend/docs/schema.md),
[coach crew](../backend/docs/coach-crew.md) and [local setup](../backend/docs/localsetup.md).
The [frontend guide](../frontend/README.md) describes screens and developer commands.

Keep these pages in step when changing the coach graph, outcome contract, plan eligibility, storage behavior or
timeouts. The evidence is a dated snapshot, not a statement about a later database or provider response.

The [November 4 offline example](evidence/2026-11-04/README.md) captures actual request serialization with scripted
answers. It is separate from the November 3 live synthetic timing evidence.
