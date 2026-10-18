import { hintClass, inputClass, surveyPromptClass } from "@/lib/design/ui-classes";

type FunctionalImpactFieldProps = {
  subject: "episode" | "background pain";
};

export function FunctionalImpactField({ subject }: FunctionalImpactFieldProps) {
  return (
    <label className="block max-w-md space-y-2">
      <span className={surveyPromptClass}>
        How much did this {subject} affect your usual daily activities?
      </span>
      <select name="functional_impact" defaultValue="" className={inputClass}>
        <option value="">Prefer not to answer</option>
        {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <p className={hintClass}>
        Optional self-report: 1 means no effect on your usual activities; 10 means you could not do
        your usual activities.
      </p>
    </label>
  );
}
