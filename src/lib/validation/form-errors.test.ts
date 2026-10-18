import { describe, expect, it } from "vitest";
import { z } from "zod";
import { fieldErrorsFromZod } from "./form-errors";

describe("fieldErrorsFromZod", () => {
  it("keeps the first message for each field", () => {
    const schema = z.object({
      notes: z.string().min(1, "Enter notes."),
      severity: z.number().min(1, "Enter severity."),
    });
    const result = schema.safeParse({ notes: "", severity: 0 });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(fieldErrorsFromZod(result.error)).toEqual({
        notes: "Enter notes.",
        severity: "Enter severity.",
      });
    }
  });
});
