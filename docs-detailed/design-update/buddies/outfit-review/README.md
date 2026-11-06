# Buddy outfits: implementation visual review

The [review index](index.html) links all 24 catalog characters wearing each of the
8 existing accessories in both independently fitted PNG representations: **384
character/accessory/view combinations**. Portrait sheets include 128px fitting
views and actual 48px/64px inline sizes. Full sheets show 208px artwork; the
full-preview sheets additionally cover the picker’s actual 144px preview size.

The sheets render the production `Buddy.tsx` component, not a separate imitation.
Their HTML uses the existing public immutable S3 URLs. To keep screenshot rendering
repeatable, Playwright serves the corresponding verified local source PNG bytes
for those requests. The app itself uses the public URLs and loads full artwork
only when a caller requests `representation="full"`.

Run from the repository root:

```sh
node scripts/package-buddy-catalog.mjs --check
node docs-detailed/design-update/buddies/outfit-review/build-review.mjs
npm test -- src/lib/buddyCatalog.test.ts src/components/Buddy.screen.test.tsx
```

Reviewed November 5, 2026: all 384 combinations, including small portraits, were
visually inspected for registration, item visibility, clipping and hardware
conflicts. The independently measured anchors retain each character’s head tilt.
Top-cropped characters use shorter party/wizard hats to limit overflow. The four
robots wear padded SVG headphone variants over their existing ear hardware;
Flux’s shades use a lavender outline against its dark face. Cove’s full-body side
accessories have a separate offset. These are variants of the existing vector
shapes and palette; no PNG was modified or republished.

All four original SVG faces and eight original SVG accessory vectors are retained
exactly. The component test compares all 36 original no-item/item renderings with
pre-change hashes. A failed PNG or unknown catalog ID/version renders the retained
original SVG buddy and equipped accessory while retaining the catalog identity.

The packaged public manifest contains 24 available age-3–13 characters, names,
characteristics, soft age bands, explicit selection attributes, alt text, dimensions
and the 48 pinned URLs. It excludes authoring prompts, research records, native
master paths, optional source-catalog “none” policy and private child data. The
packager validates every consumer PNG’s dimensions, byte size and SHA-256 against
the art manifest, publication map and catalog asset overlay.

Selector fixtures were captured from the canonical `select_buddies.py` via the
existing backend virtual environment. They cover all age-band boundaries, stable
ID ties, group diversity, explicit interests/tones, exclusions/detail preferences,
explicit cross-age selections, unknown IDs and empty results. The app allows
limits through 24 for the full chooser; canonical parity cases use limits 1–6.
