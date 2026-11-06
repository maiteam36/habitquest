# Admin entry and generation token counts

Owner-approved follow-up, November 5, 2026. Two subagents implemented the login
entry and backend aggregation; the root agent integrated the admin presentation
and verification. The screenshots use synthetic data and make no provider calls.

- **Admin login** sits below Developer login and navigates to the literal `/admin`
  route. It remains available when developer login is disabled. The open developer
  form does not cover the new link. Operator authentication remains separate.
- Generation history places **Input tokens**, **Output tokens** and **Token counts**
  after activity/status. Integers have thousands separators; actual zeros stay zero.
  Missing counters show **Not measured**, with partial/unavailable/not-applicable
  coverage distinguished explicitly.
- Totals include each operation's own reported attempts, retries, failures with
  usage and embedding input. They exclude Pinecone units, conservative bounds,
  duplicate cache/reasoning counts and separately listed child operations.

Verification completed during implementation:

- 63 focused backend accounting tests passed, including nine new token cases.
- The complete backend suite passed: 1,024 tests, with 100% statement and branch
  coverage. Ruff check/format and mypy passed.
- 157 frontend tests and the production build passed (existing bundle-size warning).
- Six synthetic browser journeys passed at 1280px and 390px: operator/token history,
  admin entry placement/navigation, and existing Coach/dashboard accounting flows.
  No horizontal page overflow occurred; wide admin tables scroll within their panel.
- The local API was restarted and returned healthy probes. Authenticated history
  returned the new fields for all 13 existing records, each with measured counters;
  anonymous history access returned 401. No generation was requested.

No model/provider, budget, authentication policy, schema or environment changes were
needed. See [Tokenomics operations](../../../design-update/tokenomics/06-operations.md)
for the API's counting and completeness rules.

| View | Desktop | Phone |
|---|---|---|
| Sign-in bar | [Screenshot](login-1280.png) | [Screenshot](login-390.png) |
| Generation history | [Screenshot](history-1280.png) | [Screenshot](history-390.png) |
