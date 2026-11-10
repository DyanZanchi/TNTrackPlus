# Reviewer classification mapping

Source: `Classificationofpainbysymptomsmodule.docx`.

The source says ICOP and ICHD boxes are for reviewers and must not appear for respondents. TN Track+ stores those codes only as hidden reviewer metadata. The app does not diagnose users and does not convert ICOP or ICHD-3 into ICD-10-CM.

Patient-facing profile questions now cover:

- Q1–Q2 shock-like pain and background pain between shocks
- Q3 clinician-attributed causes when shock-like pain is present
- Q4 postherpetic neuropathic pain
- Q5–Q7 neuropathic causes after injury/dental/pain procedures, other disease, and learned/unknown cause
- Q8–Q10 neuralgia and neuropathic variants, including Raeder’s and ophthalmoplegic descriptions
- Headache-like questions 11–23

Codes stay off those screens. The source also lists classifications it left out and asks whether they should be added. Those omitted items have no patient question text, so they are not in the app.

See:

- `src/lib/classification/patient-described-patterns.ts`
- `src/lib/classification/classification-followups.ts`
- `src/lib/classification/headache-patterns.ts`
