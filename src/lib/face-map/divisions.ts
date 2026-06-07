import { FACE_MIDLINE_X } from "@/lib/face-map/constants";
import type { FaceAreaOption } from "@/lib/types/episodes";

/**
 * Division boundaries from the front-view TN diagram (red lines).
 * Coordinates are tap space on the 0–1000 face-map grid, mirrored on FACE_MIDLINE_X.
 *
 * V1 — forehead, eyes, nose bridge through tip
 * V2 — cheeks, nose sides, mouth (through lower lip)
 * V3 — chin, jaw, and preauricular area up to the bottom of the ear
 */
function noseColumnHalfWidth(x: number) {
  const ax = Math.abs(x - FACE_MIDLINE_X);
  if (ax < 28) {
    return true;
  }

  return false;
}

/** Y below which a point is still V1 along the curved V1/V2 line. */
export function v1v2BoundaryY(x: number) {
  const ax = Math.abs(x - FACE_MIDLINE_X);

  if (ax < 28) {
    return 438;
  }

  if (ax < 70) {
    return 395;
  }

  if (ax < 140) {
    return 332;
  }

  if (ax < 230) {
    return 308;
  }

  if (ax < 310) {
    return 278;
  }

  return 248;
}

/**
 * Y below which a point is still V2 along the V2/V3 line.
 * Below the mouth at center; curves up toward the ear so V3 reaches the earlobe.
 */
export function v2v3BoundaryY(x: number) {
  const ax = Math.abs(x - FACE_MIDLINE_X);
  const mouthY = 518;
  const earBottomY = 432;
  const earAx = 345;

  if (ax <= 35) {
    return mouthY;
  }

  if (ax >= earAx) {
    return earBottomY;
  }

  const t = (ax - 35) / (earAx - 35);
  return mouthY - t * (mouthY - earBottomY);
}

export function getTrigeminalDivision(x: number, y: number): FaceAreaOption {
  if (noseColumnHalfWidth(x) && y >= 242 && y <= 438) {
    return "v1";
  }

  if (y < v1v2BoundaryY(x)) {
    return "v1";
  }

  if (y < v2v3BoundaryY(x)) {
    return "v2";
  }

  return "v3";
}
