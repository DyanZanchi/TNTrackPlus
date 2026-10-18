import { describe, expect, it } from "vitest";
import { matchesAppPath } from "./middleware";

describe("matchesAppPath", () => {
  it("does not treat the login page as the log page", () => {
    expect(matchesAppPath("/login", "/log")).toBe(false);
    expect(matchesAppPath("/log", "/log")).toBe(true);
    expect(matchesAppPath("/log/episode", "/log")).toBe(true);
  });
});
