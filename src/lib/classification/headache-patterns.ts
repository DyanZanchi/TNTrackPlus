export const HEADACHE_PATTERN_STATUSES = [
  "now_under_one_year",
  "now_and_past",
  "past_only",
  "never",
] as const;

export type HeadachePatternStatus = (typeof HEADACHE_PATTERN_STATUSES)[number];

export const HEADACHE_PATTERN_STATUS_LABELS: Record<HeadachePatternStatus, string> = {
  now_under_one_year: "I have this now, and have had it for less than one year",
  now_and_past: "I have this now, and have had it before",
  past_only: "I had this in the past, but not now",
  never: "I have never had this",
};

export type HeadachePattern = {
  key: string;
  sourceQuestion: string;
  prompt: string;
  followUpPrompt: string;
  autonomicPrompt?: string;
};

export const HEADACHE_PATTERNS: HeadachePattern[] = [
  {
    key: "cluster_attacks",
    sourceQuestion: "Q11",
    prompt:
      "Bouts or clusters of one to eight headache attacks per day, on one side of the head, with watering eyes, nasal congestion, or swelling around the eye, all on the same side as the headache.",
    followUpPrompt:
      "When you have or had this, did a cluster period last for one year or more without let-up, or were the breaks between cluster periods shorter than three months?",
  },
  {
    key: "hemifacial_spasm",
    sourceQuestion: "Q13",
    prompt:
      "Jerking or twitching of muscles on one side of the face that is painless and uncontrollable. These spasms often start in the eyelid and may move to the cheek and mouth on the same side.",
    followUpPrompt:
      "When you have or had these spasms, did they last for one year or more without let-up, or were the breaks between spasms shorter than three months?",
  },
  {
    key: "sunfa_face",
    sourceQuestion: "Q15",
    prompt:
      "One-sided moderate or severe pain in the face and head that lasts seconds to minutes and repeats at least once a day. The eye on the side of the pain tears and gets red.",
    followUpPrompt:
      "When you have or had these attacks, did they last for one year or more without let-up, or were the breaks between attacks shorter than three months?",
  },
  {
    key: "sunct_head",
    sourceQuestion: "Q17",
    prompt:
      "One-sided moderate or severe pain in the head but not the face that lasts seconds to minutes and repeats at least once a day. The eye on the side of the pain tears and gets red.",
    followUpPrompt:
      "When you have or had these attacks, did they last for one year or more without let-up, or were the breaks between attacks shorter than three months?",
  },
  {
    key: "suna_head",
    sourceQuestion: "Q19",
    prompt:
      "One-sided moderate or severe pain in the head but not the face that lasts seconds to minutes and repeats at least once a day. The eye on that side tears or gets red, or may not. There may also be a drooping upper eyelid, eye swelling, nasal congestion, or a runny nose.",
    followUpPrompt:
      "When you have or had these attacks, did they last for one year or more without let-up, or were the breaks between attacks shorter than three months?",
  },
  {
    key: "hemicrania_continua",
    sourceQuestion: "Q21",
    prompt: "Constant pain on only one side of the face and head.",
    followUpPrompt: "When you have or had this pain, did you have daily headaches for at least a year?",
    autonomicPrompt:
      "When you had the constant face and head pain, did you also have a droopy, teary, or swollen eye, nasal congestion, or a runny nose?",
  },
];

export const HEADACHE_PATTERN_KEYS = [
  "cluster_attacks",
  "hemifacial_spasm",
  "sunfa_face",
  "sunct_head",
  "suna_head",
  "hemicrania_continua",
] as const;

export function headacheFollowUpApplies(status: string) {
  return status === "now_and_past" || status === "past_only";
}

export function isHeadachePatternKey(value: string): value is (typeof HEADACHE_PATTERN_KEYS)[number] {
  return (HEADACHE_PATTERN_KEYS as readonly string[]).includes(value);
}

export function isHeadachePatternStatus(value: string): value is HeadachePatternStatus {
  return (HEADACHE_PATTERN_STATUSES as readonly string[]).includes(value);
}
