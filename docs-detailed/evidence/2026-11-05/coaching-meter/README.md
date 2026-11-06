# Compact Coach and dashboard credit pills

November 5, 2026. Screenshots use synthetic families, usage and model responses.
They do not show real family data or live-provider benchmarks.

- Child selectors keep their original height and padding, with smaller inline `8 yrs` text.
- The credit pill matches the selectors' 36px desktop height, retains a 44px touch
  height, and uses a 120px desktop progress track with a 6px thickness. The dashboard
  pill is right-aligned above the report cards. Narrow screens shrink the track
  and wrap toolbar items as necessary without horizontal overflow.
- White fill, a defined lavender border, a subtle shadow and darker usage text
  distinguish the pill from the page background without enlarging it.
- Used credits remain visible beyond the allowance, with an explicit overage.
  Pending reservations are separate from consumed credits. Mode is always visible.
- Dashboard per-generation credit details follow the existing admin cost-visibility
  switch. The overall daily pill remains visible and refreshes after generation.

Verification: all 156 frontend tests passed; the TypeScript/production build passed
with the existing bundle-size warning. Two synthetic Chrome journeys at 1280px and
390px checked age labels, chip heights, credit updates after Coach/review/planner,
demo overage, enforced mode, visibility changes, and absence of horizontal overflow.
No paid provider calls, database changes or private environment edits were made.

| View | Desktop | Phone |
|---|---|---|
| Coach | [Screenshot](coach-1280.png) | [Screenshot](coach-390.png) |
| Demo overage | [Screenshot](coach-overage-1280.png) | [Screenshot](coach-overage-390.png) |
| Dashboard | [Screenshot](dashboard-1280.png) | [Screenshot](dashboard-390.png) |
