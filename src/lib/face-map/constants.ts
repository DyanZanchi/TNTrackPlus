import type { FaceAreaOption } from "@/lib/types/episodes";
import { FACE_COORDINATE_SCALE, FACE_MAP_IMAGE } from "@/lib/face-map/types";

/**
 * Anatomical midline of the illustrated face (nose bridge / philtrum), in the same
 * 0–FACE_COORDINATE_SCALE space as tap coordinates from toNormalizedCoordinate().
 *
 * This is NOT the image canvas center: the face is slightly left of center in
 * face-map.png, so mirroring must use the nose axis (~pixel 488 of 1024), not 512.
 */
export const FACE_MIDLINE_X =
  Math.round((488 / FACE_MAP_IMAGE.width) * FACE_COORDINATE_SCALE * 10) / 10;

export const FACE_DIVISION_COLORS: Record<FaceAreaOption, string> = {
  v1: "#7b52ab",
  v2: "#4a90d9",
  v3: "#5b9a7a",
};
