# Phase 1 report: low-risk UX and terminology

Date: 2026-10-17

## Before

- Dashboard metrics appeared before the primary logging action.
- Mobile header navigation hid Dashboard, New entry, and Profile.
- CSV download was embedded directly in the dashboard.
- CSV rows had three treatment-history values without matching headers.
- Pain-quality validation referred to descriptions as “pain types.”
- There was no skip link or concise non-diagnostic disclaimer.

## After

- “Log New Episode” is placed before dashboard metrics.
- Mobile users have Dashboard, Log Episode, Export, and Profile navigation.
- `/export` provides a dedicated, protected Export Data screen while preserving the existing download endpoint.
- CSV generation lives in a testable helper and all treatment columns have headers.
- Pain-quality copy consistently asks for a pain description.
- The app shell includes a skip link and a short self-report/non-diagnostic disclaimer.
- No schema, stored record, anatomical image, classification, or medication catalog changed.

## Changed files

- `src/app/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/export/route.ts`
- `src/app/export/page.tsx`
- `src/components/dashboard/export-button.tsx`
- `src/components/episode-form.tsx`
- `src/lib/export/episodes-csv.ts`
- `src/lib/export/episodes-csv.test.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/validation/episode.ts`
- `src/lib/validation/episode.test.ts`
- `src/lib/profile/queries.ts`
- `docs/implementation-audit.md`
- `docs/anatomy-assets-needed.md`
- `docs/cognitive-testing-plan.md`
- `CLINICAL_REVIEW_REQUIRED.md`

## Verification

- `npm test`: 57/57 passing across 8 files
- `npm run lint`: clean after removal of two unused type imports
- `npm run build`: successful
- Local HTTP smoke checks: `/dashboard` and `/export` returned 200 in demo mode

## Manual decisions remaining

- Duration-entry behavior is deferred because the existing days/minutes/hours UI conflicts with the new hours/minutes-only brief and must preserve old seconds.
- Clinical diagnosis provenance, scale wording, migraine-like symptom wording, and medication taxonomy remain review-gated.
- No new anatomy views were added.

