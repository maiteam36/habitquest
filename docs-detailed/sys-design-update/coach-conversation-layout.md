# Habit Coach conversation and recommendation layout

Updated November 5, 2026.

The Coach's message field and location controls previously appeared below the goal grid. Saved goals were rendered first, which buried fresh recommendations and sent an already-saved goal back into the saved list even when the latest response recommended it again.

## Page order

1. **Conversation:** child selector, New chat, model feedback and generation status, refinement buttons, compact location choices, and the message field share one panel at the top.
2. **New recommendations:** goals from the latest successful recommendation response retain the model's order. A saved goal recommended again appears here once, with its saved badge and linked habits.
3. **Earlier recommendations:** other unsaved suggestions remain available when present. On a loaded chat without a new response in this view, this section is called “Coach recommendations.”
4. **Existing plan:** a horizontal divider introduces the saved-plan heading, expandable habit summary, and the remaining saved goal cards.

Location icons in the conversation are 18px, inside labeled radio controls. Controls wrap on small screens; keyboard selection, automatic suggestions and parent overrides remain available. Habit-generation dialogs retain their larger setting picker.

## State and behavior

The latest-response goal IDs are separate from the habit-preparation queue. Starting or failing a follow-up request does not move the previous response's cards into another section. Child changes and New chat clear the latest-response marker.

Every goal card keeps the same child/goal key under one grid parent while moving between visual groups. This preserves generated choices, in-flight work and schedule edits. Adding a newly recommended goal to the plan keeps it in the current response section and updates its saved badge. It is not rendered twice.

This is a frontend layout and grouping change. Backend contracts, generation limits, paid provider routing, goal-to-habit links and persisted family data are unchanged.

## Verification

- `npm test`: **126 tests passed**. Added coverage for conversation/plan order, a saved goal recommended again, same-category goals, model order, single-card rendering, preserved schedule edits, saving without moving the current recommendation, and failed follow-ups retaining the current group.
- `npm run build`: passed TypeScript and production build.
- Chrome with synthetic intercepted APIs: **2 browser tests passed**, at 1280px and 390px. Checked 18px setting icons, compact controls, conversation placement, divider and plan order, research/details, generation/append, habit acceptance, settings and child-facing details. No live model calls or family-data writes were made.
- Screenshots reviewed: [desktop saved-plan layout](../evidence/2026-11-05/coach-layout/linked-saved-recommendations-1280.png), [mobile conversation and goals](../evidence/2026-11-05/coach-layout/linked-goals-390.png).

Implementation: [Coach.tsx](../../frontend/src/components/Coach.tsx), [GoalRecommendations.tsx](../../frontend/src/components/GoalRecommendations.tsx), [Coach styles](../../frontend/src/styles/13-coach-catalog.css).
