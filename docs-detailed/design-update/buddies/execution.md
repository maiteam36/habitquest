# Buddy catalog implementation and rollout

**November 5, 2026.** Owner-approved implementation is enabled locally. The
application database was backed up and migrated, existing rows were preserved,
and API/Vite checks passed. All three final integrated browser scenarios and the
additional reduced-motion mobile check passed.
The [approved plan](implementation-plan.md) records product decisions; the
[frontend API guide](../../../backend/docs/frontend-integration.md#buddy-selection-november-5-2026)
records request/response examples and compatibility rules.

## Delivered behavior

Every child always has a buddy. Existing children retain Fox, Owl, Bear or Bunny;
new-child setup preselects its first deterministic age recommendation, which follows
age edits until someone deliberately picks a buddy. Adding the child confirms that
choice. Empty filters, missing images or unavailable metadata do not clear it.

The pinned `0.1.0` release contains 24 characters and 48 published PNGs: one 128px
portrait and one 768px full-body view per character. All 24 support ages 3–13.
Primary age bands provide a soft ordering hint, and the full chooser allows every
supported character plus an **Original buddies** group. New setup shows three
choices, Child Details up to six, and the kid chooser the saved selection plus two
alternatives. More buddies opens the shared accessible dialog. Preview/filter
changes remain local until an explicit choice; profile changes save on form submit.
The kid chooser saves an explicit choice and shows recoverable failures.

The latest owner direction limits visible character metadata to the chooser:
names, brief character characteristics and suggested ages. Local theme/interest
filters help selection; they do not create or infer a child profile. Other surfaces
retain the saved avatar/name and shared neutral event copy, without extra metadata
panels. Character metadata never drives AI prompts, coaching, habit selection,
points, Sparks or rewards.

The existing eight accessories remain: party hat, crown, shades, bow, wizard hat,
flower, headphones and halo. Catalog art composes worn SVG accessories using
separate character landmarks for portrait and full-body views, plus fitting
adjustments where needed. Earned inventory and equipped values remain unchanged.
**No accessory** removes only the accessory. All 384 character/accessory/view
combinations were reviewed, including small portraits and the actual preview size;
see the [production outfit review](outfit-review/README.md). The earlier
[comparison previews](previews/README.md) are historical review evidence.

## Identity, persistence and authorization

The additive
[`202611050005_buddy_catalog.sql`](../../../backend/db/migrations/202611050005_buddy_catalog.sql)
migration adds a read-only app reference table and four selection fields beside
the existing four-value `children.buddy`:

| Field | Behavior |
|---|---|
| `buddy` | Existing `fox`, `owl`, `bear` or `bunny`; catalog visual/theme fallback |
| `buddy_selection_mode` | `legacy` or `catalog`; existing rows default to `legacy` |
| `catalog_buddy_id` | Canonical catalog ID in catalog mode; null in legacy mode |
| `buddy_catalog_version` | Pinned `0.1.0` in catalog mode; null in legacy mode |
| `buddy_selection_revision` | Existing/old-create rows start at 0; every explicit choice advances it |

Create accepts an explicit original/catalog `buddy_selection` with absent or zero
`expected_revision` and starts at revision 1. Old creates keep their old buddy/Fox
default at revision 0. Later parent/kid explicit choices require `expected_revision`;
stale choices return 409 and save no other changes in that transaction. Catalog mode
requires ID/version and forbids an internal legacy buddy; legacy mode requires its
original buddy and clears catalog fields atomically. Empty selections, invalid IDs,
versions, ages and conflicting/unknown fields are rejected.

Parent profile writes lock the child and validate one merged age/selection update.
`PATCH /v1/kid/extras` derives identity and age from the kid session and calls a
narrow security-definer function that locks the same row. Kids retain no direct
child-table update privilege. The reference seed contains only public ID/version,
supported ages and availability, with no family or preference data.

Unrevisioned compatibility `buddy` writes may update untouched revision-0 legacy
rows. After a deliberate revisioned choice, those old flat fields are ignored while
unrelated profile changes still save. New forms submit `buddy_selection` only after
a deliberate picker edit. Authoritative flat selection fields accompany create,
list, read, edit, kid sessions/login/me, family-code avatars, Today, extras and export.
Today includes current age. Browser reconciliation accepts selection fields only
from a current/newer revision and treats old snapshots without revisions as 0.

## Local catalog and provider behavior

- [`scripts/package-buddy-catalog.mjs`](../../../scripts/package-buddy-catalog.mjs)
  projects canonical public metadata and verifies published asset identity,
  dimensions, bytes and hashes into
  [`buddyCatalog.json`](../../../frontend/src/data/buddyCatalog.json).
- [`scripts/package_buddy_catalog.py`](../../../backend/scripts/package_buddy_catalog.py)
  produces the backend's pinned
  [`buddy_catalog.json`](../../../backend/src/habitquest_backend/data/buddy_catalog.json)
  reference projection from the canonical source. The migration carries the same
  24 ID/version/age records and source SHA. Applied migrations stay immutable.
- The selector uses public attributes locally: three points per explicit interest
  match, two for an explicit tone, one for the primary age band; stable ID ordering
  and group diversity resolve the shortlist. Explicit exclusions stay hard filters.
  Age is the only default input; saved choices take precedence.
- Portraits load inline; the selected preview requests its full-body image. The
  existing immutable HTTPS asset URLs need no bucket listing, upload, presigned
  URL, credentials or S3 policy change. Image failure retains identity and falls
  back locally, including the equipped item.
- Ranking, browsing, preview and selection make no LLM, embedding, Pinecone or
  generation-budget request. Catalog event lines are shared deterministic code;
  submission says the quest was sent to a grown-up to check. Legacy optional AI
  lines retain their established setting/path. Switching to catalog mode hides
  cached/in-flight animal-only lines without starting another model request.

## Confirmed checks

| Check | Confirmed result |
|---|---|
| Frontend suite and build | 202 tests passed after both browser-found timing fixes; TypeScript and production Vite build passed |
| Whole backend suite on the fresh database | 1,051 passed; 100% statement and branch coverage: 5,080 statements, 1,232 branches, none missed |
| Backend scoped compatibility run | 208 tests passed across buddies, accounts, onboarding, journey, extras, insights and Today |
| Follow-up after current-age projection and observed row-lock test | 38 buddy/Today tests passed |
| Final age/availability check | One focused regression passed after separating unavailable-reference validation from unsupported-age validation |
| Scoped statement/branch coverage | New `buddies.py` reached 100%; the 208-test run also reached 100% for accounts, daily and extras. This is not the final whole-backend coverage result |
| Backend static checks | Ruff check, Ruff formatting across 91 files including the browser helper, mypy across 40 source modules, and whitespace checks passed |
| Fresh disposable migration | Root confirmed `habitquest_buddies_fresh_test` migrated successfully and preserved a synthetic Owl, crown, assignments, completion and points |
| Application database | Buddy migration applied after private backup; old-column row counts and SHA-256 fingerprints stayed identical across all 35 existing `hq` tables |
| Browser verification | Three final actual-API scenarios passed in 30.5 seconds: desktop, 390px mobile and deliberately delayed direct-journal boot |
| Reduced motion | Additional complete 390px flow passed with `prefers-reduced-motion: reduce` (18.3-second run) |
| Artwork | All 384 catalog character/accessory/view combinations reviewed; all 36 original SVG render hashes unchanged; 24 records and 48 PNGs verified by dimensions, bytes and SHA-256 |
| Providers | No paid or live provider calls made for this implementation/testing work |

Tests cover explicit mode round trips, old clients, null/unknown/conflicting inputs,
ID/version/availability/age validation, stale save rollback, all read projections,
direct kid-update denial, expired/wrong-role tokens, family/child isolation, feature
rollback and parent/kid races. One race observes PostgreSQL's actual lock wait before
committing a parent age change; the kid then validates the committed final age.

## Final integrated checks and local rollout

The two complete actual-API browser flows passed at 1280px and 390px. They use a
separate disposable database and fake-AI server, with synthetic families. They
verify age defaults, a deliberate cross-band choice, three/six compact options,
24+4 modal choices, keyboard/focus/cancel, explicit parent and kid saves, refresh,
legacy creation, all eight wardrobe items, removal, and image-error fallback with
the saved ID/revision unchanged. They assert no AI request and no page error.

Visual review found and fixed an async preview issue: the previous bitmap could
remain painted beneath the newly selected character's name. The image is now
replaced on source change, while accessory changes retain the loaded image.
Screenshots wait for the selected image to decode. A later fast-navigation check
exposed a kid-session boot race; Journal now waits for authenticated Today before
offering a buddy change and shows a read error/retry if boot fails. The final
202-test frontend run and build passed after this fix. A third browser regression
holds the real session request open, verifies no interactive choices are offered,
then releases it and verifies the chosen buddy saves at the next revision.
The complete mobile flow also passed with reduced motion enabled. See
[browser results and 14 screenshots](browser-evidence/README.md).

The existing mobile Developer login form has a pointer-overlap issue; verification
submits that form with Enter. This work does not claim to fix that existing login
layout. All buddy controls use real clicks. The browser tests equip synthetic
accessories; they do not exercise chest randomness or habit generation.

Local rollout completed against **`habitquest` on localhost:5432**:

1. Stopped only the local application API on port 8000. Saved and validated the
   private 276,087-byte custom-format backup
   `/private/tmp/habitquest-before-buddies-20261106T001237Z.dump` (UTC timestamp).
2. Verified every prior migration checksum and that only the new buddy migration
   was pending. Applied it in one transaction. All existing rows/old columns across
   35 application tables retained the same counts and fingerprints; all existing
   children remain legacy at revision 0. Added 24 public reference records.
   Sanitized preservation evidence is private at
   `/private/tmp/habitquest-buddy-preservation-20261106T001237Z.json`.
3. Restarted the API and enabled `VITE_BUDDY_CATALOG_ENABLED=true` in ignored
   `frontend/.env.local`; Vite reloaded its configuration. Readiness returned
   `{"status":"ready"}`, the frontend returned HTTP 200, and the served module
   contained the enabled public flag. Backend catalog writes use the existing
   default `BUDDY_CATALOG_ENABLED=true`. Private environment files remain ignored.

No source artwork, S3 policy, provider credentials, family budget or rewards rule
was changed. No synthetic family was added to the application database; browser
CRUD uses `habitquest_buddies_backend_test`, separate from the full-suite database.

## Flags and rollback

| Setting | Default and effect |
|---|---|
| Backend `BUDDY_CATALOG_ENABLED` | `true`; `false` rejects new catalog choices with 409 while retaining reads, unrelated edits and explicit original-buddy choices |
| Frontend `VITE_BUDDY_CATALOG_ENABLED` | `false` in the template until rollout; `true` enables expanded catalog choices. Disabling it retains the saved identity and selection-aware reconciliation |

The frontend flag is public and requires a Vite restart/rebuild after a change.
The backend flag requires an API restart. Enable the chooser only after its backend
migration is present. A presentation rollback keeps the additive columns, reference
records, saved catalog IDs/versions/revisions and original fallback. Missing art
uses the local fallback; it does not save another identity. Keep the pre-migration
backup and immutable public assets. Do not delete choices or reset real family data.
