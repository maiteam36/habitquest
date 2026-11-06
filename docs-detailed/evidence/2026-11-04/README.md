# Offline coach request example: November 4, 2026

[coach-offline-example.json](coach-offline-example.json) captures request bodies produced by the installed coach
code, with a synthetic age-eight child, a reduced public bedtime catalog, a synthetic plan and scripted model
replies. It supports the [plain-language walkthrough](../../coach-request-walkthrough.md).

This is **not live model output, a latency measurement or a reconstruction of the November 3 timing probe**.
The seven requests include Patterns because this fixture has an existing plan. Parallel-call order depends on
scheduling. No real family data, API key or authorization header is captured.

The [script](../../examples/trace-coach-offline.py) runs `run_turn()` and `build_crew()` with the HTTP client replaced
by an in-memory `MockTransport`. It does not exercise endpoint authorization, database snapshotting or persistence.
It uses dummy settings and does not load `.env` files. Run it with the backend virtual environment from the
repository root to refresh the artifact after relevant code changes.
