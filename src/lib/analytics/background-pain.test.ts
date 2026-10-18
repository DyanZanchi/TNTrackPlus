import { describe, expect, it } from "vitest";
import { DEMO_BACKGROUND_CHECK_INS } from "@/lib/demo/background-check-ins";
import { summarizeBackgroundPain } from "./background-pain";

describe("summarizeBackgroundPain", () => {
  it("does not invent zero severity when there are no check-ins", () => {
    expect(summarizeBackgroundPain([])).toEqual({
      recordedCheckIns: 0,
      averageSeverity: null,
      medianSeverity: null,
      peakSeverity: null,
    });
  });

  it("summarizes recorded check-ins separately", () => {
    expect(summarizeBackgroundPain(DEMO_BACKGROUND_CHECK_INS)).toEqual({
      recordedCheckIns: 3,
      averageSeverity: 4.3,
      medianSeverity: 4,
      peakSeverity: 6,
    });
  });
});
