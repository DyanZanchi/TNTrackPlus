# Reviewer classification mapping

Source: `Classificationofpainbysymptomsmodule.docx`.

The source says ICOP and ICHD boxes are for reviewers and must not appear for respondents. TN Track+ stores those codes only as hidden reviewer metadata. The app does not diagnose users and does not convert ICOP or ICHD-3 into ICD-10-CM.

Patient-facing now/past/never descriptions, and the headache-like questions 11–23, live in profile settings. Codes stay off those screens. The source also lists classifications it left out and asks whether they should be added. Those omitted items have no patient question text, so they are not in the app.

See `src/lib/classification/patient-described-patterns.ts`.
