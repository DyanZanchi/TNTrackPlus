# Phase 4–5 report: anatomy registry, optional follow-ups, and diary rules

Date: 2026-10-17

## After

- Anatomy views are registered in code. Only the approved front-facing diagram is rendered.
- Unapproved side and dental views stay hidden and have no image sources.
- Pain location can be added from a text list as well as the approved diagram.
- Episode duration can be known, unknown, or ongoing. Unknown and ongoing entries store no duration and are excluded from averages.
- “Spontaneous / no clear trigger” cannot be combined with other triggers.
- Numbness follow-ups appear only after Yes and remain optional.
- Combined-pattern patients can optionally record background intensity just before an episode.
- Optional “did the pain change” notes stay out of the required daily path.
- Profile can record clinician evaluation, diagnosis status, additional undiagnosed pain, and relevant history events. Existing pain types remain source-unspecified.
- Relevant history events do not claim causation.

## Database migration

### `021_episode_followups_and_history.sql`

Adds nullable episode follow-up columns, makes duration seconds/minutes nullable, adds profile clinician/diagnosis columns, and creates `relevant_history_events` with owner-only RLS.

Existing episode rows default to `duration_status = 'known'` and keep their current duration values.

## Still blocked

- Medication catalog, aliases, and classification/ICD mappings remain blocked until source documents arrive.
- No new anatomical artwork was created or mirrored.

## Verification

Apply migration 021 before saving new follow-up fields in a live database.
