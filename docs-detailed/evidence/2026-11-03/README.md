# HabitCoach evidence: 2026-11-03

These files support the [HabitCoach investigation](../../habitcoach-investigation.md).

- [provider-probes.json](provider-probes.json): the two synthetic local bootstrap checks against the configured
  provider. Completion timestamps are cumulative from turn start; parallel calls must not be summed. The
  50-second run's request list is only what had completed when fallback returned.
- [local-eligibility.json](local-eligibility.json): an anonymous read-only local snapshot. Counts reflect one
  child's current plan and catalog eligibility, not the semantic relevance of any particular recommendation.
- [model-shortlist.json](model-shortlist.json): selected public catalog fields used by the
  [model-selection analysis](../../model-selection.md); published rates and metadata, not measured app performance.
- [ai-system-audit.json](ai-system-audit.json): installed package/configuration snapshot, crew call counts, public
  guidance sizes and the synthetic legacy-budget result behind the [AI deep dive](../../ai-system-deep-dive.md).

The provider fixture was a synthetic age-eight child with an empty plan, using public catalog data. No real
conversation was replayed. The local export contains counts and public goal IDs only; credentials, real IDs,
names, exact age, conversation content and custom habit text are excluded. The keyword goal summary classifies
text locally without exporting that text. The files do not establish stage outcomes for historical real turns.
