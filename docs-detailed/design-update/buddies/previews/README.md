# Buddy outfit alignment — review only

These browser screenshots clarify how existing accessories might fit the generated
catalog artwork. They are isolated document previews, not an app implementation.
No child selection, inventory, database, S3 object or production component changed.

## Screenshots

- [Original versus catalog portrait/full-body alignment](alignment.png): actual
  Bear/crown, Fox/shades and Owl/headphones rendering from the existing component;
  manual draft placements on Pippin, Ember and Dot's existing PNGs.
- [Equipped-item badge versus worn accessory](badge-versus-overlay.png): a crown
  badge beside Pippin compared with a crown placed on Pippin's head. Includes
  original/new avatar examples at 48px and 64px.

The badge preserves equipped-item information, but does not preserve the visible
dress-up effect. The overlay is the proposed direction for keeping that capability.
It uses the original PNG as a base and a separate SVG accessory layer; the PNG does
not need to be regenerated for these sample compositions.

Portrait and full-body fits use different coordinates, rotations and scales. The
robot example is deliberately marked unresolved: Dot already has ear hardware and
an antenna, so the old headphones duplicate or intersect those details. Additional
character-specific geometry, masking or accessory vectors may be needed. These
three examples do not establish support for all 24 × 8 × 2 combinations.

The plan now requires an always-present buddy/default and removes the earlier
No buddy option. No accessory means only removing the equipped item.

## Historical preview source

These files preserve the preimplementation comparison that the owner approved.
The builder below targets the original standalone `Buddy.tsx`; the integrated
component now imports the catalog and anchor modules. Use the
[production outfit review](../outfit-review/README.md) to reproduce current artwork
and all supported accessory combinations. Do not overwrite these historical
screenshots with the implemented renderer.

Original command, before integration, with existing dependencies and local Chrome:

```bash
node docs-detailed/design-update/buddies/previews/build-preview.mjs
```

The preview script reads `Buddy.tsx`, compiles it in memory and renders its actual
SVG faces and accessory vectors. It reads the existing local catalog PNGs, embeds
them into two standalone HTML review pages, and screenshots those pages. It uses
no application API, image-generation service or cloud write. Draft placement
coordinates belong only to this preview, not the runtime catalog or application.

- [Alignment HTML](alignment.html)
- [Badge/overlay HTML](badge-versus-overlay.html)
- [Updated integration plan](../implementation-plan.md)
