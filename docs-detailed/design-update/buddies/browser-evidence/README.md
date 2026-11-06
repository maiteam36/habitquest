# Buddy browser verification

**November 5, 2026: 3/3 integrated Playwright scenarios passed in 30.5 seconds.**
The final run used the frozen application source, installed Google Chrome, a
1280 × 1000 desktop viewport and a 390 × 1000 mobile viewport.
An additional **1/1 reduced-motion mobile scenario passed in 18.3 seconds**
(10.5 seconds for the scenario). It repeated the complete 390px selection,
persistence, wardrobe, image-fallback and keyboard flow with the browser's
`prefers-reduced-motion` preference set to `reduce`. The default configuration
remains `no-preference`. The 390px screenshots were refreshed by this final run.

The [spec](../../../../frontend/e2e/buddy-catalog.spec.ts) runs through actual API
and database writes. Its [configuration](../../../../frontend/playwright.buddies.config.ts)
starts Vite on 5182 with the catalog flag enabled and the
[isolated API helper](../../../../backend/scripts/run_buddy_browser_api.py) on 8002.
The helper applies tracked migrations and the seed only to
`habitquest_buddies_backend_test`, uses synthetic families and credentials, and
sets fake AI with retrieval disabled. No real family data was used or changed.
No AI endpoint requests, paid provider requests or browser JavaScript errors were
observed in the two complete selection flows. The helper also passed Ruff check
and format check.

## Verified behavior

- Setup shows three choices, preselects an age-based default, follows age until a
  manual choice, and preserves that choice across later age changes.
- Choice tiles show names, public characteristics and suggested ages. Ordinary
  dashboard views contain neither suggested-age labels nor the traits panel.
- More buddies contains all 24 catalog characters and four originals. Preview and
  Escape leave the form choice unchanged; focus traps, returns to More buddies,
  and stays keyboard-operable.
- Parent edit keeps the current choice among six options, persists a deliberately
  chosen buddy, and restores it after reload. A kid's later choice appears on the
  parent dashboard and survives another reload.
- Old-client creation with the original Owl identity remains legacy mode at
  revision zero.
- All eight accessory fixtures remain available. Crown overlays render on the
  selected catalog buddy, shades save and survive reload, and No accessory removes
  the outfit while retaining the buddy.
- Failed public image loading shows the local visual fallback while preserving the
  saved catalog ID and selection revision.
- A separate direct-journal cold-boot test holds the real kid-session request open:
  no buddy controls appear before readiness. Releasing the request enables the
  picker, and the subsequent choice persists with the next revision.
- Every captured layout passes the horizontal-overflow check. Evidence waits for
  eager images to decode, including the selected preview, without waiting for
  offscreen lazy catalog images.

## Screenshots

| Surface | Desktop | 390px mobile |
|---|---|---|
| Setup: three choices and selection details | [Setup](setup-1280.png) | [Setup](setup-390.png) |
| Full chooser: names, characteristics and ages | [Chooser](chooser-1280.png) | [Chooser](chooser-390.png) |
| Child details: six choices | [Edit](edit-1280.png) | [Edit](edit-390.png) |
| Kid's saved choice | [Journal](kid-journal-1280.png) | [Journal](kid-journal-390.png) |
| Parent refresh: current avatar without selection metadata | [Dashboard](dashboard-1280.png) | [Dashboard](dashboard-390.png) |
| Wardrobe and all eight accessories | [Wardrobe](wardrobe-1280.png) | [Wardrobe](wardrobe-390.png) |
| Image failure with retained identity | [Fallback](image-fallback-1280.png) | [Fallback](image-fallback-390.png) |

## Scope and known limitation

The existing mobile Developer login panel's Sign in button can be overlapped by
the main auth card heading at 390px. These tests submit that filled form with
Enter; they do not claim that the existing pointer overlap is fixed. All buddy
controls use real browser clicks. The scenarios do not generate habits, spend
points, or exercise chest randomness; the eight owned accessories are synthetic
fixtures in the disposable database. Broader accessory-placement review and the
application/backend suites are recorded separately in the implementation record.

Run from `frontend/` with local database access available:

```bash
npx playwright test --config playwright.buddies.config.ts
```

To repeat only the mobile scenario with reduced motion:

```bash
BUDDY_QA_REDUCED_MOTION=true npx playwright test --config playwright.buddies.config.ts --grep 'at 390px'
```

The database must already exist. The helper reads only the private
`TEST_DATABASE_URL` connection source and pins its database name to the disposable
target; it never prints that URL or other private environment settings.
