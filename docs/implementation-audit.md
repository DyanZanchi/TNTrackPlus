# TN Track+ implementation audit

Audit date: 2026-10-17

This audit maps the current repository to the TN Track+ master implementation brief. It is the required checkpoint before material product or schema changes.

## Source availability

The following referenced source documents were not present in the repository or Downloads and have not been reviewed:

- `TN Track Notes (1).pdf`
- `20260817 Medications Surveys_Facial Pain_Clean.docx`
- `Classificationofpainbysymptomsmodule.docx`
- `PosterFigure1.docx` through `PosterFigure4.docx`
- `Abstracttext.docx`

Clinical wording, validated scale claims, medication catalogs, classification codes, and source-specific mappings remain review-gated. None will be fabricated.

## Current architecture

- Next.js 16 App Router and React 19
- Supabase authentication, Postgres, and row-level security
- Zod validation and server actions
- Tailwind CSS and Recharts
- Vitest unit tests
- One approved front-facing face-map image with calibrated regions

Primary routes:

- `/`: public landing page
- `/onboarding`: required patient profile
- `/dashboard`: episode analytics and history
- `/episodes/new`: episode entry
- `/settings`: patient profile
- `/dashboard/export`: authenticated CSV response
- `/dev/face-map-editor`: development-only calibration tool; returns 404 in production

## Existing data model

The database has an `episodes` table plus related tables for triggers, medications, facial areas, face points, and pain-type snapshots. Patient profile tables store pain types and treatment history. Migrations 001–018 evolved the model while retaining several legacy episode columns.

Canonical and legacy fields currently coexist:

- `duration_seconds` is canonical; `duration_minutes` is retained for compatibility.
- `episode_pain_types` is canonical; `episodes.pain_type` retains the first selected value.
- `episode_face_points` and `episode_face_areas` are canonical; `episodes.face_area` remains a legacy summary.
- Trigger and medication junction tables are canonical; legacy text columns remain nullable.

Existing records are mapped through compatibility fallbacks in `src/lib/episodes/queries.ts`. Future migrations should remain additive. No existing columns should be dropped during this implementation.

## Requirement status

### A. Home, navigation, and text — partially present

- Patient-facing “attack” wording has already been removed.
- The dashboard has a full-width log action, but metrics currently appear before it.
- Mobile header navigation hides Dashboard, New entry, and Profile without a replacement.
- CSV download is embedded in the dashboard instead of a distinct Export Data screen.
- Historical dates remain in the history table and filters, which is appropriate.
- Questionnaire typography uses shared classes and generally readable controls.
- No explicit short app disclaimer is present.

### B. Continuous, episodic, and combined pain — mostly missing

- Each episode can currently be marked `continuous` or `episodic_pulsing`.
- This is an episode-level pain-shape question, not a patient-level pain-pattern history.
- There is no background pain check-in type.
- There is no combined background-plus-exacerbation flow.
- Analytics treat every record as an episode.
- There are no optional change points or start/peak/end summaries.
- Duration is required and supports minutes, hours, or days. The brief instead requires optional/unknown/ongoing handling and separate hours/minutes without seconds. This needs a compatibility design before changing the form.

### C. Characteristics, intensity, and impact — partially present

- Multi-select pain qualities, Other, numbness, and throbbing-associated symptoms exist.
- Descriptor vocabulary does not yet match the proposed canonical list.
- Severity is 1–10. It must not be described as a validated instrument without source review.
- The current severity prompt mixes pain and feeling; impact/function is not captured separately.
- Numbness follow-ups for location, onset, procedure timing, and current/past status are missing.
- Injury, dental procedure, and treatment history lacks the requested event model.
- Throbbing follow-up is required rather than optional and has a narrower option set.

### D. Diagnosis versus patient-described patterns — partially present

- Profile pain types and episode pain qualities are stored separately.
- Some validation/UI copy still calls a pain quality a “pain type.”
- The app does not ask whether a clinician evaluated or diagnosed the user.
- Existing pain types have no diagnosis source, clinician type, date, confirmation status, or classification metadata.
- There is no separate patient-description model for undiagnosed patterns.
- No automatic diagnosis or code assignment exists, which must remain true.

### E. Anatomical image infrastructure — partially present

- One approved front-facing image works with patient-perspective laterality and stable saved coordinates.
- There is no approved-asset registry or version metadata.
- No left-profile, right-profile, or dental image exists.
- Missing views must remain hidden or text-only until approved assets and region maps are supplied.
- The pointer-based map has no keyboard/text fallback.

### F. Triggers — partially present

- Triggers use reusable built-in and patient-custom taxonomy options.
- “Spontaneous / no clear trigger” can currently coexist with other triggers.
- “Other” and “Not sure” are not modeled with explicit exclusive-choice semantics.
- Historical trigger labels remain readable through relationships and legacy fallback.

### G. Medication history and tracking — mostly missing

- Episodes can record medications taken in the prior 24 hours.
- The profile stores procedures and therapies, not a structured medication inventory.
- Regular, rescue, compounded, and nonprescription uses are not distinguished.
- Dose, unit, frequency, route, current/past/never/unknown status, and stop reasons are absent.
- Episode medication use is not explicitly separated from the prescribed regimen.
- Emergency-care and patient-reported rescue-plan history are absent.
- A full catalog cannot be populated until the source survey is available and reviewed.

### H. Export and data migration — partially present

- Authenticated, user-scoped CSV export exists and respects dashboard filters.
- CSV rows currently contain three treatment-history cells missing from the header.
- Export is not versioned and lacks documented units/timezone/missing-value semantics.
- The existing model cannot distinguish episodes from background check-ins.
- Multi-table episode creation is sequential rather than transactional.

### I. Accessibility, security, and pretesting — partially present

- Supabase RLS limits core health records to their owner.
- Server actions verify the authenticated user and validate selected taxonomy ownership.
- No service-role key is used by application code.
- Mobile primary navigation is incomplete.
- The face map is pointer-only; charts lack complete text alternatives.
- Forms return the first validation error globally rather than field-level errors.
- No skip link, explicit draft model, or cognitive-testing plan exists.
- `BYPASS_AUTH=true` must never be enabled in production.
- There are no automated RLS tests.

### J. Clinical safety — partially present

- The app does not infer diagnoses or recommend treatments.
- No app-level disclaimer currently explains that entries are self-reported and non-diagnostic.
- Clinical review items are not tracked in a dedicated file.
- There is no external FPA integration or unapproved analytics transmission.

### K. Tests and manual QA — partially present

- Baseline: 54 Vitest tests pass.
- Face-map classification and episode validation have strong unit coverage.
- Analytics coverage is limited.
- There are no CSV contract, route authorization, RLS, component accessibility, migration, or end-to-end tests.
- There is no CI workflow.

### L. Delivery artifacts — missing

- No migration/compatibility report, rollout checklist, anatomy handoff, cognitive-testing script, or deployment-readiness report exists yet.

## Highest-risk findings

1. A background-pain model cannot be safely represented by the current all-episodes table semantics.
2. Diagnosis provenance is missing; existing “pain type” selections cannot be retrospectively asserted to be clinician-given.
3. Multi-table episode creation can leave partial records if a later insert fails.
4. The export header does not match its row shape.
5. Mobile navigation and face-map keyboard access are incomplete.
6. Migrations 014 and 015 included destructive column changes and have no down migrations. Future work must remain additive.
7. Demo-mode records use fixed dates and can disappear from the default current range.

## Compatibility strategy

- Add an observation discriminator rather than replacing `episodes`.
- Treat existing records as episodic observations unless a migration can establish otherwise; never infer background pain.
- Add nullable fields first, backfill only facts that can be derived without guessing, then add constraints for new writes.
- Preserve legacy duration seconds and all old labels.
- Add diagnosis provenance without retroactively labeling existing entries as clinician-confirmed.
- Store “unknown,” “not asked,” “not applicable,” and “prefer not to answer” distinctly where required.
- Keep the current face image and mappings unchanged; register only explicitly approved future assets.
- Keep the existing export endpoint available while adding a versioned export screen/schema.
- Add transaction-safe database operations before expanding multi-table writes.

## Phased implementation plan

### Phase 1: low-risk UX and correctness

1. Put “Log New Episode” before dashboard metrics.
2. Restore usable mobile navigation.
3. Add an authenticated Export Data screen while preserving the current CSV endpoint.
4. Fix CSV header/row parity and add contract tests.
5. Clarify diagnosis-versus-description copy.
6. Add a concise non-diagnostic disclaimer.
7. Add text alternatives for key chart summaries and selected face locations.

### Phase 2: pain observation model

1. Add an additive observation-kind migration (`episode` or `background_check_in`).
2. Add patient pain-pattern history with effective dates.
3. Add background check-in and combined flows with progressive disclosure.
4. Make episode duration optional with explicit unknown/ongoing semantics.
5. Preserve legacy seconds while using hours/minutes for new episode-duration entry.
6. Add optional impact and episode-change summaries.
7. Split background and episodic analytics with sample sizes and missingness.

### Phase 3: history, diagnosis provenance, and medication management

1. Add clinician-evaluation and diagnosis-provenance models.
2. Add patient-described patterns separately from diagnoses.
3. Add optional injury/dental/procedure history without causal claims.
4. Add normalized medication catalog/use records only after source review.
5. Distinguish prescribed regimen, rescue use, and episode administration.
6. Add neutral emergency-care and patient-reported rescue-plan history.

### Phase 4: approved anatomy infrastructure

1. Add an approved-asset registry with version and attribution metadata.
2. Render selectors only for approved assets with approved region maps.
3. Keep front-view coordinates and patient laterality unchanged.
4. Add a textual location fallback.
5. Do not create, mirror, or synthesize anatomical images.

### Phase 5: integrity, accessibility, and release review

1. Add transaction-safe writes and RLS integration tests.
2. Add export versioning and schema documentation.
3. Add component accessibility and end-to-end workflow tests.
4. Add migration recovery guidance and a manual acceptance checklist.
5. Complete clinical review, anatomy handoff, cognitive-testing plan, and deployment-readiness assessment.

## Decisions requiring review before later phases

- Existing profile “pain types” will retain an unspecified legacy source. Provenance will be asked for new or edited diagnoses; existing values will not be relabeled as clinician-reported.
- Approved wording and scale anchors for pain intensity and functional impact.
- Days remain a supported episode-duration unit alongside hours and minutes. Historical seconds remain unchanged.
- Exact optionality and response choices for numbness and migraine-like symptoms.
- Canonical trigger none/unknown behavior.
- Medication source catalog, aliases, categories, and clinical review ownership.
- Approved classification systems/codes and versioned crosswalk policy.
- Approved anatomy assets, ownership, alt text, and region maps.
- Meaning and spelling of the referenced emergency protocol.

The referenced PDF/DOCX source documents will be supplied before medication-catalog or classification work begins.

