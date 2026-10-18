# Cognitive think-aloud testing plan

The Facial Pain Association ran six think-aloud interviews in February 2025 on registry surveys. Their findings are used here as pretest guidance, not as completed testing of this app. This plan does not claim that TN Track+ interviews have been conducted.

## Participants

Recruit 5–9 participants, if feasible, with varied:

- Facial-pain patterns, including episodic and continuous/background pain
- Experience using symptom diaries
- Age and comfort with mobile technology
- Medication-history complexity
- Vision, dexterity, and assistive-technology needs

Include clinician review separately from patient usability sessions. Do not ask participants to disclose more health information than the test requires.

## Session setup

- Use a development or staging environment with synthetic accounts.
- Do not record production health data.
- Explain that the application records self-reported information and is not diagnostic.
- Ask participants to think aloud without coaching them toward an answer.
- Note hesitation, rereading, scrolling, missed controls, and unexpected interpretations.

## Tasks

1. Complete onboarding and explain what “facial pain type” means to you.
2. Log an episode using a supplied fictional scenario.
3. Locate pain using the face interface, then remove one location.
4. Record numbness and a throbbing-associated symptom.
5. Record a continuous/background pain check-in once that feature is available.
6. Enter a medication when the dose or frequency is unknown once Medication Management is available.
7. Distinguish a regular medication from medicine taken during an episode.
8. Find and export records for a supplied date range.
9. Explain what each dashboard chart appears to say.
10. On a phone-sized screen, find Dashboard, Log Episode, Export, Profile, Save, and Cancel.

## Neutral probes

- “What does this question mean to you?”
- “How did you choose that answer?”
- “What time period were you thinking about?”
- “What did you expect to happen when you selected that?”
- “Was there an answer you wanted but could not find?”
- “What do you think ‘episode’ means here?”
- “What do you think ‘background pain’ means here?”
- “Does this look like a diagnosis from the app, or something you reported?”
- “What do you think will happen to your unfinished answers?”
- “What information do you expect the export to contain?”
- “What does this chart not tell you?”

## Review checklist

- One concept per question
- Recall period visible at the question
- Unknown/not sure available where exact recall is unreasonable
- No leading or diagnostic wording
- Response scale matches the question
- Conditional follow-ups appear only when relevant
- Mobile users recognize that more questions are below and look at the buttons at the bottom
- Definitions sit with the question they belong to, not only above a block of items
- Don't know / not sure is available for medication use and duration when exact recall is hard
- Keyboard and screen-reader users can complete equivalent tasks
- Save, Submit, Cancel, and Save Progress match actual behavior
- Charts state sample size, range, and missingness
- No absent log is interpreted as zero pain

## Issue log template

For each observed issue, record:

- Task and screen
- Participant interpretation
- Observable difficulty, without inferring intent
- Severity and frequency
- Proposed wording or interaction change
- Clinical review needed: yes/no
- Follow-up test required: yes/no

