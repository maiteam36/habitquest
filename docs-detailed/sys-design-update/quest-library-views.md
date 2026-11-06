# Quest Library: Quests and By goal

The owner approved the [screenshot proposal](../design-update/quest-library-view-preview/README.md)
before implementation on November 5, 2026.

## Behavior

- **Quests** remains the default view for each child. It keeps the existing flat
  quest list, schedules, goal links, habit details and pause/resume/remove controls.
- **By goal** groups the same assignments by exact `goal_id`. Each goal shows its
  existing catalog illustration, category, title, brief description, age range and
  assigned quest count. Goal and habit details open in the existing dialogs.
- Both views share the same quest controls and current plan state. A schedule
  change, addition, pause or removal is reflected when switching views.
- Independently saved active goals remain visible with an empty state when they
  have no assigned quests. Suggested goals without assignments are not included.
- Older goals without catalog artwork use a neutral fallback and their saved
  title. Assignments with missing goal metadata stay visible under their own saved
  goal ID and show a clear unavailable-details message; titles are never used to
  merge groups.
- Child switching opens that child's default Quests view. Existing goal-specific
  links remain filtered in both views, with a link back to all quests.
- The Add quests section remains below the plan. The view tabs support arrow keys,
  Home and End, and expose the selected tab and its panel to assistive technology.

## Scope

This is a frontend presentation change in `QuestLibrary.tsx`, with a shared row
renderer, styles in `14-quest-library.css`, and a small saved-goal artwork wrapper
in `CatalogVisual.tsx`. It uses existing plan and goal-source APIs. Switching views
does not import goals, generate habits or call an AI provider. No database, model,
budget or environment changes are required.

The fake server now applies schedule edits as well as status edits, allowing the
screen tests to verify that changes persist across the two views.

## Verification

The frontend screen tests cover default selection, keyboard navigation, same-title
goals with different IDs, missing goal metadata, empty goals, source and habit
details, child isolation, goal-focused routes, schedule edits, add/remove and
pause/resume. Browser verification uses synthetic children and intercepted API
responses; it never modifies the real family's plan or invokes a paid provider.

Completed checks:

- `npm test`: 132 tests passed across 23 files.
- `npm run build`: TypeScript and Vite build passed. Vite retains its bundle-size warning.
- `PLAYWRIGHT_CHANNEL=chrome npm run e2e -- quest-library-views.spec.ts`: two
  browser tests passed at 1280px and 390px. Both verified no horizontal overflow,
  loaded goal artwork, exact grouping, source details, saved time/day edits,
  pause/resume, removal and child switching. All writes stayed in the synthetic fixtures.
- `git diff --check`: passed.

Delivered screenshots:

- [Default Quests view](../evidence/2026-11-05/quest-library-views/quests-desktop.png)
- [By goal, desktop](../evidence/2026-11-05/quest-library-views/by-goal-1280.png)
- [By goal, mobile](../evidence/2026-11-05/quest-library-views/by-goal-390.png)

The existing Vite server on port 5180 serves the updated page. No backend restart
is needed.
