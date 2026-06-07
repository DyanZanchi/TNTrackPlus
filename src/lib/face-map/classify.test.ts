import { describe, expect, it } from "vitest";
import { classifyFaceCoordinate } from "@/lib/face-map/classify";
import { FACE_MIDLINE_X } from "@/lib/face-map/constants";

describe("classifyFaceCoordinate", () => {
  it("classifies center forehead taps", () => {
    const result = classifyFaceCoordinate(FACE_MIDLINE_X, 120);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.point.division).toBe("v1");
      expect(result.point.label).toBe("Forehead");
    }
  });

  it("classifies upper forehead taps without matching the nose bridge", () => {
    const result = classifyFaceCoordinate(FACE_MIDLINE_X, 220);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.point.label).toBe("Forehead");
      expect(result.point.location).toBe("forehead");
    }
  });

  it("classifies bridge of nose taps below the forehead", () => {
    const result = classifyFaceCoordinate(FACE_MIDLINE_X, 320);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.point.label).toBe("Bridge of nose");
    }
  });

  it("classifies taps above the eye as eye area, not under-eye", () => {
    const result = classifyFaceCoordinate(410, 320);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.point.label).toBe("Right eye area");
      expect(result.point.location).toBe("right_eye");
    }
  });

  it("classifies under-eye taps below the eye and above the cheek", () => {
    const result = classifyFaceCoordinate(380, 340);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.point.label).toBe("Under right eye");
    }
  });

  it("classifies under-eye and cheek border taps without crossing into nose", () => {
    const underEyeBorder = classifyFaceCoordinate(375, 340);
    const cheekBorder = classifyFaceCoordinate(360, 420);

    expect(underEyeBorder.ok && cheekBorder.ok).toBe(true);
    if (underEyeBorder.ok && cheekBorder.ok) {
      expect(underEyeBorder.point.location).toBe("right_under_eye");
      expect(cheekBorder.point.location).toBe("right_cheek");
    }
  });

  it("classifies philtrum-gap flank taps as nose, not cheek", () => {
    const result = classifyFaceCoordinate(452, 400);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.point.location).toBe("right_nose");
      expect(result.point.label).toBe("Right side of nose");
    }
  });

  it("classifies cheek taps beside the nose flank, not as nose", () => {
    const cheekBesideNose = classifyFaceCoordinate(405, 400);
    const lowerCheek = classifyFaceCoordinate(410, 440);

    expect(cheekBesideNose.ok && lowerCheek.ok).toBe(true);
    if (cheekBesideNose.ok && lowerCheek.ok) {
      expect(cheekBesideNose.point.location).toBe("right_cheek");
      expect(lowerCheek.point.location).toBe("right_cheek");
    }
  });

  it("classifies outer nose flank taps as nose, not under-eye or cheek", () => {
    const upperFlank = classifyFaceCoordinate(450, 370);
    const midFlank = classifyFaceCoordinate(452, 410);
    const lowerFlank = classifyFaceCoordinate(452, 440);

    expect(upperFlank.ok && midFlank.ok && lowerFlank.ok).toBe(true);
    if (upperFlank.ok && midFlank.ok && lowerFlank.ok) {
      for (const result of [upperFlank, midFlank, lowerFlank]) {
        expect(result.point.location).toBe("right_nose");
        expect(result.point.label).toBe("Right side of nose");
      }
    }
  });

  it("keeps eye area above the under-eye and cheek bands", () => {
    const eye = classifyFaceCoordinate(410, 320);
    const belowEye = classifyFaceCoordinate(340, 315);

    expect(eye.ok && belowEye.ok).toBe(true);
    if (eye.ok && belowEye.ok) {
      expect(eye.point.location).toBe("right_eye");
      expect(belowEye.point.location).not.toBe("right_eye");
    }
  });

  it("classifies lower-bridge nose-side taps, not under-eye or cheek", () => {
    const result = classifyFaceCoordinate(450, 370);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.point.label).toBe("Right side of nose");
      expect(result.point.location).toBe("right_nose");
    }
  });

  it("classifies nostril-wing taps on the side of the nose, not upper lip", () => {
    const nostrilWing = classifyFaceCoordinate(458, 460);
    const nostrilCrease = classifyFaceCoordinate(462, 468);

    expect(nostrilWing.ok && nostrilCrease.ok).toBe(true);
    if (nostrilWing.ok && nostrilCrease.ok) {
      expect(nostrilWing.point.label).toBe("Right side of nose");
      expect(nostrilWing.point.location).toBe("right_nose");
      expect(nostrilCrease.point.label).not.toBe("Upper lip");
      expect(nostrilCrease.point.location).not.toBe("upper_lip");
    }
  });

  it("classifies philtrum taps as nose bridge, not upper lip", () => {
    const result = classifyFaceCoordinate(FACE_MIDLINE_X, 455);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.point.label).toBe("Bridge of nose");
      expect(result.point.location).toBe("nose_bridge");
    }
  });

  it("classifies upper-lip taps on the drawn lip line, not the whole mouth area", () => {
    const result = classifyFaceCoordinate(FACE_MIDLINE_X, 476);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.point.label).toBe("Upper lip");
      expect(result.point.location).toBe("upper_lip");
      expect(result.point.division).toBe("v2");
    }
  });

  it("classifies patient-right cheek taps below the under-eye region", () => {
    const result = classifyFaceCoordinate(280, 430);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.point.division).toBe("v2");
      expect(result.point.location).toBe("right_cheek");
      expect(result.point.label).toBe("Right cheek");
    }
  });

  it("classifies patient-left cheek taps on the image right", () => {
    const result = classifyFaceCoordinate(720, 430);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.point.division).toBe("v2");
      expect(result.point.location).toBe("left_cheek");
      expect(result.point.label).toBe("Left cheek");
    }
  });

  it("classifies chin taps", () => {
    const result = classifyFaceCoordinate(FACE_MIDLINE_X, 600);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.point.division).toBe("v3");
      expect(result.point.label).toBe("Chin");
    }
  });

  it("rejects taps outside the face boundary", () => {
    const result = classifyFaceCoordinate(120, 700);

    expect(result).toEqual({ ok: false, reason: "outside_face" });
  });
});
