# More goals and habit choices

November 5, 2026.

The Coach conversation toolbar now includes **Get more goals**. Each click asks for
up to four additional relevant goals for the same concern. Existing cards stay
available; newly returned goals appear with the latest response. The button is
disabled during a Coach request and does not discard an unfinished message.

Each goal with habit choices now has a matching **More habit choices** button in
place of the slider. It requests up to three additional choices, keeps the earlier
ones and shows generation progress. The generation-options dialog uses the same
batch size. A failure keeps existing choices and requires another explicit click.

## Retrieval and persistence

`POST /v1/children/{child_id}/coach/messages` accepts optional `more_goals: true`.
The default remains false, preserving ordinary conversation/refinement behavior.
More-goals requests require refined source-goal mode and an explicit setting.

The UI sends a recognized follow-up: “Show me other goals for the same concern.”
The existing deterministic query resolver retains the original concern and masks
names before retrieval. Additional searches exclude previously shown goals and
active saved goals; Pinecone and local retrieval exclude their source concepts.
Pending cards are not injected back into the additional-candidate list.

Successful additional recommendations append to the pending cards with stable
selection order. The final child lock also prevents an overlapping response from
duplicating or reordering a card already present. Empty and failed results retain
the earlier cards. `response_goal_ids` identifies only this response's goals;
`goal_recommendations` still contains the complete pending set. Thread reads and
context preload preserve the accumulated cards.

The browser prepares habits only for the new response IDs, reuses usable batches
and preserves its existing queue when more goals arrive. At most two automatic
habit requests run concurrently. No habit is assigned without the parent's action.

No model, safety policy, schema, environment variable or spending cap changed.
Each click is an explicit generation action using the existing provider budget
and review bounds. Fewer results may be returned when fewer suitable choices exist.

## Verification

Frontend tests and build, backend regression/coverage and static checks, and
synthetic desktop/mobile browser checks verify these flows. Backend validation
uses the existing disposable `habitquest_refinement_fresh_test` database with
provider HTTP blocked. The default `habitquest_test` database lacked earlier
budget tables; it was not used for the completed verification.

Completed checks:

- **839 backend tests passed**, with **100% statement and branch coverage**.
- Ruff lint/format and mypy passed.
- **128 frontend tests passed**, with a successful TypeScript/production build.
- **Two Chrome browser tests passed**, at 1280px and 390px. They exercise the new
  goal button, habit append button, retained accepted habits and all four timing
  records (one Coach call plus three habit-generation calls). The initial browser
  run had a stale expected history count; that assertion was corrected and both
  complete flows passed on rerun.
- Screenshots reviewed: [new goals and retained choices](../evidence/2026-11-05/more-choices/more-goals-1280.png)
  and [mobile flow](../evidence/2026-11-05/more-choices/more-goals-390.png).

No paid provider checks were made. Mocked checks establish behavior, not live
model latency or recommendation quality.

The local API was restarted on port 8000. Readiness and the frontend both returned
HTTP 200, and the running OpenAPI schema exposes `more_goals` with default `false`.
