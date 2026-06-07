import { describe, expect, it } from "vitest";
import { FACE_MIDLINE_X } from "@/lib/face-map/constants";
import { getTrigeminalDivision } from "@/lib/face-map/divisions";

describe("getTrigeminalDivision", () => {
  it("assigns forehead and eyes to V1", () => {
    expect(getTrigeminalDivision(FACE_MIDLINE_X, 120)).toBe("v1");
    expect(getTrigeminalDivision(380, 285)).toBe("v1");
  });

  it("keeps the nose bridge and tip in V1", () => {
    expect(getTrigeminalDivision(FACE_MIDLINE_X, 320)).toBe("v1");
    expect(getTrigeminalDivision(FACE_MIDLINE_X, 420)).toBe("v1");
  });

  it("assigns cheeks and mouth to V2", () => {
    expect(getTrigeminalDivision(280, 420)).toBe("v2");
    expect(getTrigeminalDivision(FACE_MIDLINE_X, 465)).toBe("v2");
    expect(getTrigeminalDivision(FACE_MIDLINE_X, 505)).toBe("v2");
    expect(getTrigeminalDivision(170, 390)).toBe("v2");
  });

  it("assigns chin and jaw below the mouth to V3", () => {
    expect(getTrigeminalDivision(FACE_MIDLINE_X, 530)).toBe("v3");
    expect(getTrigeminalDivision(FACE_MIDLINE_X, 600)).toBe("v3");
    expect(getTrigeminalDivision(220, 545)).toBe("v3");
  });

  it("extends V3 up to the bottom of the ear on the sides", () => {
    expect(getTrigeminalDivision(165, 460)).toBe("v3");
    expect(getTrigeminalDivision(165, 385)).toBe("v2");
  });
});
