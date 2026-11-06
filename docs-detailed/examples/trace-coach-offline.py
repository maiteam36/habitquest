"""Capture real coach request bodies using scripted replies, with no network or database access.

From the repository root:
    backend/.venv/bin/python docs-detailed/examples/trace-coach-offline.py

This demonstrates serialization and data flow, not model quality or latency. It ignores .env files,
uses a dummy credential and replaces the model HTTP client with an in-memory MockTransport.
"""

import json
from pathlib import Path
from threading import Lock
from unittest.mock import patch

import httpx
from habitquest_backend import crew, llm
from habitquest_backend.ai import Candidate
from habitquest_backend.coach import run_turn
from habitquest_backend.coach_tools import Snapshot
from habitquest_backend.config import Settings
from pydantic import SecretStr


def main() -> None:
    """Run the installed coach code against public catalog examples and a scripted model transport."""
    settings = Settings(
        _env_file=None,
        ai_mode="openai",
        coach_engine="crew",
        openai_base_url="https://offline.invalid/v1/",
        openai_model="deepseek-ai/DeepSeek-V4.1-Flash-1017",
        openai_small_model="",
        openai_safety_model="",
        openai_api_key=SecretStr("offline-dummy-not-a-real-key"),
        crew_roles="",
        trace_coach=False,
        dev_login=False,
        coach_timeout_seconds=10,
    )
    text = "Alex keeps asking for one more thing and getting out of bed at bedtime."
    problem = "Child A stalls at bedtime with repeated requests and getting out of bed."
    queries = ["bedtime stalling", "predictable bedtime routine"]
    passages = crew.passages([*queries, problem], 8)
    reference = next(chunk.ref for chunk in passages if chunk.ref == "G3")
    snapshot = Snapshot(
        age=8,
        goals=[
            Candidate(
                "bedtime",
                "Calmer bedtimes",
                "Getting to bed on time without stalling, so everyone sleeps better.",
                ["bedtime", "stall", "sleep"],
                [
                    {"id": "bedtime", "title": "Get to bed early", "tier": 1},
                    {"id": "brush-teeth", "title": "Brush teeth morning and night", "tier": 1},
                    {"id": "story-time", "title": "Share a book every day", "tier": 1},
                ],
            )
        ],
        plan={
            "brush-teeth": {
                "title": "Brush teeth morning and night",
                "cue_time": "19:30",
                "status": "active",
            }
        },
        approved_days={"brush-teeth": 3},
        checkins=[
            {"mood": "hard", "hardest": "brush-teeth", "favorite": "brush-teeth"},
            {"mood": "okay", "hardest": "brush-teeth", "favorite": "brush-teeth"},
        ],
    )
    responses = {
        "ParentRisk": {"risk": False, "reason": ""},
        "Triage": {"intent": "new_problem", "problem": problem, "queries": queries, "question": ""},
        "Brief": {
            "points": [{"ref": reference, "point": "Use a predictable routine and one agreed last request."}]
        },
        "Patterns": {
            "patterns": [
                "Brush teeth has three approved days in the last fourteen.",
                "Both check-ins named brush teeth as the trickiest habit.",
            ]
        },
        "Plan": {
            "reply": f"Try a predictable routine and one agreed last request. [{reference}] "
            "The suggested quest gives the routine a clear finish. Tell me if it feels too hard.",
            "cards": [
                {"habit_id": "bedtime", "reason": "A clear finish to bedtime directly targets stalling."}
            ],
            "changes": [],
        },
        "Fit": {"poor_fit": []},
        "SafetyVerdict": {"safe": True, "problems": []},
    }
    captured = []
    lock = Lock()

    def respond(request: httpx.Request) -> httpx.Response:
        """Return scripted JSON and retain request bodies, never authorization headers."""
        body = json.loads(request.content)
        schema = body["response_format"]["json_schema"]["name"]
        answer = responses[schema]
        with lock:
            captured.append(
                {
                    "method": request.method,
                    "url": str(request.url),
                    "schema": schema,
                    "request_body": body,
                    "scripted_response": answer,
                }
            )
        return httpx.Response(
            200,
            json={
                "id": "offline-example",
                "object": "chat.completion",
                "created": 0,
                "model": body["model"],
                "choices": [
                    {
                        "index": 0,
                        "finish_reason": "stop",
                        "message": {"role": "assistant", "content": json.dumps(answer)},
                    }
                ],
            },
        )

    with httpx.Client(transport=httpx.MockTransport(respond)) as client:
        with patch.object(llm, "http_client", return_value=client):
            reply = run_turn(settings, snapshot, [], text, ["Alex"])

    assert sorted(call["schema"] for call in captured) == sorted(responses)
    assert reply.mapped_by == "ai" and list(reply.turn.recommendations) == ["bedtime"]
    assert all("Alex" not in json.dumps(call["request_body"]) for call in captured)
    evidence = {
        "recorded_on": "2026-11-04",
        "kind": "offline synthetic teaching example with scripted model replies",
        "live_model_requests": 0,
        "database_queries": 0,
        "latency_measurement": False,
        "scope": "A reduced public bedtime catalog, synthetic plan/counts, actual run_turn and crew code.",
        "warning": "These are scripted outputs, not real model judgments or the November 3 timed conversation. "
        "Parallel research/progress and fit/safety capture order is scheduling-dependent. "
        "Settings use a dummy credential; request headers are not exported.",
        "parent_message": text,
        "local_progress_facts": crew.progress_facts(snapshot),
        "retrieved_passages": [
            {"ref": chunk.ref, "title": chunk.title, "text": chunk.text} for chunk in passages
        ],
        "requests": captured,
        "final_reply": {
            "text": reply.text,
            "mapped_by": reply.mapped_by,
            "recommendations": reply.turn.recommendations,
            "sources": reply.turn.sources,
            "no_habit_match": reply.no_habit_match,
        },
    }
    out = Path(__file__).resolve().parents[1] / "evidence/2026-11-04/coach-offline-example.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
    print(f"Captured {len(captured)} scripted requests; no live inference or database queries.\n{out}")


if __name__ == "__main__":
    main()
