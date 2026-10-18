# Clinical review required

These items must be reviewed before the related features are described as clinically standardized or released as medical classifications. TN Track+ records self-reported information and must not diagnose users.

## Source documents

Reviewed on 2026-10-17:

- `Classificationofpainbysymptomsmodule.docx`
- `Abstracttext.docx`
- `PosterFigure1.docx`–`PosterFigure4.docx`
- `TN Track Notes (1).pdf`
- `20260817 Medications Surveys_Facial Pain_Clean.docx`

The medication survey supplies the patient-facing catalog, now/stopped/never and rescue/past-week statuses, dose-unknown handling, compounded-medication questions, nonprescription products, marijuana questions, and emergency-visit history. Dose ranges from that survey are shown as the amount the survey asked about. They are not recommended doses. The emergency item names the ER Protocol by Drs. Linskey and Zakrzewska only as something a patient may have asked staff to use. No protocol steps are stored. Rescue and injectable dose follow-ups from the survey are not on the screen yet.

## Open review items

- [ ] Confirm whether existing profile “facial pain type” values represent clinician-given diagnoses, patient-selected labels, or both.
- [ ] Approve the clinician-evaluation and diagnosis-provenance questions.
- [ ] Review all ICOP, ICHD-3, and ICD-10-CM names, codes, versions, and sources. ICOP/ICHD reviewer boxes from the classification module are stored as hidden mappings only. They must never appear in the patient UI and must not be assigned automatically. ICD-10-CM is still unmapped.
- [ ] Approve a policy that forbids automatic conversion between classification and billing systems.
- [ ] Review TMJ/temporomandibular wording and category placement.
- [ ] Approve plain-language, non-diagnostic patient pattern descriptions.
- [ ] Verify whether the established 1–10 scale should remain and approve its endpoint wording.
- [ ] Approve the separate functional-impact question and ensure it does not mix distress, disruption, and emotional wellbeing.
- [ ] Review numbness branching, onset precision, current/past status, and procedure wording.
- [ ] Review throbbing/migraine-like symptom branching and whether each item is optional.
- [ ] Approve canonical pain descriptor labels and mappings from historical values.
- [ ] Approve trigger none/unknown exclusivity and recall-period wording.
- [ ] Review the medication source catalog, generic/brand aliases, formulations, and category overlap.
- [ ] Approve neutral wording for cannabis/marijuana reporting and “prefer not to answer.”
- [ ] Confirm that the notes phrase “laninski protocol” refers only to the survey’s history question about the ER Protocol by Drs. Linskey and Zakrzewska. Do not encode treatment instructions.
- [ ] Decide whether new episode duration entry supports days or only hours/minutes while preserving historical seconds.
- [ ] Approve wording for background pain, episodes, exacerbations, unknown duration, and ongoing entries.
- [ ] Review the patient-facing non-diagnostic disclaimer.

## Prohibited assumptions

- Symptom answers do not establish a diagnosis.
- Patient-entered diagnoses are not independently confirmed by the app.
- ICOP or ICHD-3 identifiers are not automatically ICD-10-CM billing codes.
- A procedure occurring before symptoms does not establish causation.
- A medication on a patient list was not necessarily taken during an episode.
- Missing logs do not represent zero pain.
- Recorded check-ins do not represent continuous 24-hour measurement.

