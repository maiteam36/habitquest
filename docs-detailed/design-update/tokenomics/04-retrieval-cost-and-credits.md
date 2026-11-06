# Retrieval cost and credit derivation

**Approved for implementation; updated November 5, 2026.** Embedding and similarity
search are included in the operation cost and the reference cost used to recommend
coaching credits. This supplements the original chat-only historical estimates.
No new embedding, search or generation requests were made for this update.

## What a lookup pays for

The current code calls OpenAI `text-embedding-3-small` on the masked query, then sends
the resulting 512-dimensional vector to Pinecone's Documents search endpoint. The
returned cards are verified and hydrated from the local pinned catalog. There is no
second Pinecone-hosted embedding, paid reranker or remote card-hydration request on
this path. One lookup can supply several goals; its cost belongs to the Coach
operation once, not once per goal or subsequent habit batch.

| Component | Current price basis | What must be captured |
|---|---|---|
| OpenAI query embedding | **$0.02 / million input tokens** | Actual embedding input usage; model and tariff version |
| Pinecone similarity search | Standard **$16–$18 / million RUs**; Enterprise **$24–$27 / million RUs**, varying by cloud/region | Actual endpoint, plan/rate match and reported read units |
| Pinecone response egress | Standard/Enterprise **$0.10 / GB beyond the included allowance** | Reported egress bytes; account-period allowance/reconciliation status |

Prices: [OpenAI embedding model](https://developers.openai.com/api/docs/models/text-embedding-3-small)
and [Pinecone pricing](https://www.pinecone.io/pricing/), including the public page's
comparison table. These are verified list rates, not verification of this account's
plan, region, discounts, remaining allowance or invoice.

Pinecone documents a 0.25-RU minimum for a small namespace search. Its per-request
responses round RUs upward to whole numbers; preserve that distinction from precise
billed units. REST responses also expose egress bytes. Sources:
[cost rules](https://docs.pinecone.io/guides/cost/understand-cost) and
[request usage](https://docs.pinecone.io/guides/cost/check-usage-per-request).

Use response metadata for estimates, never the number of matched goals as a proxy for
RUs. The saved runs did not retain embedding tokens, RUs or egress; their exact historical
retrieval cost cannot be recovered from latency alone. Account-level precise usage can
reconcile aggregates later; it cannot prove an exact per-family split retrospectively.

## Small-cost examples

```text
embedding_cost = embedding_input_tokens × embedding_rate / 1,000,000
search_cost = reported_RUs × RU_rate / 1,000,000
egress_list_equivalent = reported_egress_bytes / 1,000,000,000 × egress_rate
retrieval_reference_cost = embedding_cost + search_cost + egress_list_equivalent
operation_reference_cost = writer + review + retrieval_reference_cost
```

The egress term above deliberately prices all bytes for planning. It is not a claim
that included bytes generate an extra invoice charge. Use the provider's billing unit
and allowance rules for reconciliation; label the distinction in admin metrics.

| Assumed lookup | Embedding | Search | Egress planning equivalent | Total |
|---|---:|---:|---:|---:|
| 100 tokens, 0.25 precise RUs, Standard $16–$18/M; before egress | $0.000002 | $0.000004–$0.0000045 | Excluded | **$0.000006–$0.0000065**, partial |
| Planning example: 100 tokens, 1 reported RU, Standard $18/M, 20,000 response bytes | $0.000002 | $0.000018 | $0.000002 | **$0.000022** |
| Larger query/namespace example: 500 tokens, 10 RUs, Standard $18/M, 20,000 bytes | $0.000010 | $0.000180 | $0.000002 | **$0.000192** |
| Enterprise sensitivity: 100 tokens, 1 RU, $27/M, 20,000 bytes | $0.000002 | $0.000027 | $0.000002 | **$0.000031** |

All quantities in this table are assumptions, not measured usage or request ceilings.
The 1-RU example is a useful conservative small-namespace planning case, not an upper
bound for every search. Index growth, larger inputs and retries can raise cost.

Using **$0.000022 per lookup** with the historical chat shapes gives:

| Scenario | Lookup count | Chat + retrieval estimate |
|---|---:|---:|
| Coach response | 1 | **$0.0008048–$0.0021877** |
| Coach + three goals' nine choices | 1 | $0.00316715–$0.00455005 |
| Coach + four goals' twelve choices | 1 | $0.00395460–$0.00533750 |
| Five Coach turns + four habit batches | 5 | **$0.0071738–$0.0140883** |

These combine observed chat-token shapes with assumed retrieval usage. They are not
complete observed bills. They exclude corrections/failures, other helpers and shared
infrastructure. Seven example sessions/day give $0.0502–$0.0986/day, or approximately
$1.51–$2.96 over 30 equally active days. Keep the provisional $0.03/session and
$0.25/family/day planning envelopes until measured usage can replace the assumptions.

## How retrieval affects coaching credits

Keep predictable activity quotes, but derive recommendations from **all direct costs**.
Add a configurable **reference cost per credit**, initially **$0.0015**. This is a
planning conversion, not a redeemable dollar value, billing tariff or spending guarantee.

```text
reference_total = writer + review + embedding + search + attributable egress
recommended_activity_credits = max(1, ceil(reference_total / reference_usd_per_credit))
```

Round once after summing the operation. Never round each component to a whole credit,
or round a tiny component's dollar value to cents before adding it. Retain at least
12 decimal places in stored dollar calculations. The minimum applies only to useful
parent activities that carry credits; zero-credit child helpers and failed operations
remain explicit policy exceptions.

For the initial Coach reference, use the upper mixed-model chat bound, clearly labeled
provisional, plus the planning lookup example:

| Component | Reference cost | Unrounded credit equivalent |
|---|---:|---:|
| Coach writer + review | $0.0021657 | 1.4438 |
| Embedding | $0.000002 | 0.001333… |
| Pinecone search | $0.000018 | 0.012 |
| Egress equivalent | $0.000002 | 0.001333… |
| **Combined Coach reference** | **$0.0021877** | **1.458466… → 2 credits** |
| Three-habit batch reference | $0.00078745; no fresh retrieval | 0.524966… → **1 credit** |

Retrieval is included even though it does not push this example into the next whole
credit. For sensitivity, 100 RUs at $18/M plus 100 embedding tokens and 20,000 egress
bytes would bring the same Coach reference to $0.0039697 and recommend **3 credits**.
This demonstrates that search cost can change the recommended allowance weight.

Admin shows **configured credits**, **recommended credits**, the conversion, component
costs and evidence quality. Current model/rate changes update the recommendation; an
admin accepts an audited policy revision to change the quote. Display the accepted
quote before dispatch and snapshot it for the operation and its automatic batch slots.
There is no silent mid-request reprice or extra retrieval debit after a quoted Coach turn.
Planner/review/onboarding remain manual provisional 2-credit quotes until benchmarked.

Once sufficient measurements exist, derive reference profiles from total direct spend
per useful operation, including a disclosed share of failed/corrected work. Do not add
that reliability allowance twice. Actual failed work is always recorded as operator
cost, while its family credits are released. Saved result reads and idempotent replay
make no new calls and consume no additional credits.

## Included usage and shared costs

Track three distinct figures: request list-price equivalent, estimated payable usage
after verified allowances, and shared allocated overhead. Starter/Builder included
usage does not imply that search consumes no resources. Until the account plan is
verified, show payable cost as unknown and use the explicit Standard planning assumption
only for credit recommendations. Never present it as this account's bill.

Storage, initial catalog embedding/import, flat subscriptions and unused minimum
commitments belong in operator overhead. Do not add a whole monthly minimum to usage
again or charge catalog ingestion on every family lookup. Those costs can inform future
allowance calibration through a disclosed allocation; no hidden family surcharge is
proposed. Strict operator caps need verified tariffs or explicit conservative bounds;
the illustrative lookup is not sufficient as a hard reservation ceiling.
