# Phase 2 report: pain pattern and background check-ins

Date: 2026-10-17

## Before

- Every saved observation was an episode.
- “Continuous” described pain inside an episode record but did not support background-pain check-ins.
- Dashboard counts and averages could not distinguish persistent background pain from episodes.
- Empty episode ranges displayed zero duration and zero intensity.
- Profile pain pattern had no dated history.

## After

- Profile asks which broad pain pattern best describes the patient, with non-diagnostic definitions.
- Pattern changes are preserved in a dated history table.
- A context-aware `/log` screen offers episode logging, background check-ins, or both.
- Background check-ins have their own table, form, optional descriptions and locations, and transaction-safe write function.
- Episode and background summaries are separate.
- Background metrics explicitly summarize recorded check-ins only.
- Missing observations display as “Not recorded” or “not available,” never zero pain.
- Optional daily-activity impact is stored separately from pain intensity.
- Episode and background exports are separate CSV files.
- Throbbing-associated symptom follow-up is optional.
- Days remain available for episode duration, per product decision.

## Database migrations

### `019_background_pain_check_ins.sql`

Adds:

- `patient_pain_pattern_history`
- `background_pain_check_ins`
- `background_pain_check_in_face_points`
- Owner-only RLS policies
- `set_current_pain_pattern(...)`, an atomic history-update function
- `create_background_pain_check_in(...)`, an atomic check-in and face-point write function

No existing rows or columns are changed. Existing patients begin with no recorded patient-level pattern and keep episode logging until they choose one.

### `020_add_functional_impact.sql`

Adds nullable `episodes.functional_impact` with a 1–10 constraint. Existing episodes remain `null`, meaning the question was not answered.

## Compatibility and rollback

- Existing episodes remain untouched and are never relabeled as background pain.
- Existing diagnosis/pain-type values remain source-unspecified.
- Historical duration seconds are preserved.
- Application deployment requires migrations 019 and 020 first.
- Safe application rollback: old code ignores the new tables/column.
- Database recovery: stop new writes, export the new tables, then drop the new functions/tables and nullable column only if a reviewed rollback is required. Do not drop them while the new application is active.

## Verification

- `npm test`: 65/65 passing across 10 files
- `npm run lint`: clean
- `npm run build`: successful
- Local demo smoke checks:
  - `/dashboard`: episode and background summaries rendered separately
  - `/log`: context-aware choices rendered
  - `/check-ins/new`: short background check-in rendered
- Accessibility snapshot confirms missing monthly intensity reads “not available,” not zero.

## Deferred

- Background day/week/month charting beyond the current recorded-check-in summary
- Unknown/ongoing episode duration and optional start/peak/end changes
- Detailed numbness history
- Canonical descriptor expansion pending source review
- Diagnosis provenance UI beyond the decision to preserve legacy source as unspecified
- Medication and classification work pending source documents

