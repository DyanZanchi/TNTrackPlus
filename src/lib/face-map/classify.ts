import { FACE_MIDLINE_X } from "@/lib/face-map/constants";
import { getTrigeminalDivision } from "@/lib/face-map/divisions";
import { isPointInEllipse, isPointInPolygon, polygonArea } from "@/lib/face-map/geometry";
import { FACE_BOUNDS, FACE_BOUNDARY, FACE_ZONES } from "@/lib/face-map/regions";
import type { FaceAreaOption } from "@/lib/types/episodes";
import type { FaceLocationKey, FaceMapPoint } from "@/lib/face-map/types";

type ClassifyResult =
  | { ok: true; point: FaceMapPoint }
  | { ok: false; reason: "outside_face" };

const CENTER_BAND = 12;

const PATIENT_PERSPECTIVE_MIRROR: Partial<
  Record<FaceLocationKey, { location: FaceLocationKey; label: string }>
> = {
  left_forehead: { location: "right_forehead", label: "Right forehead" },
  right_forehead: { location: "left_forehead", label: "Left forehead" },
  left_eye: { location: "right_eye", label: "Right eye area" },
  right_eye: { location: "left_eye", label: "Left eye area" },
  left_under_eye: { location: "right_under_eye", label: "Under right eye" },
  right_under_eye: { location: "left_under_eye", label: "Under left eye" },
  left_nose: { location: "right_nose", label: "Right side of nose" },
  right_nose: { location: "left_nose", label: "Left side of nose" },
  left_cheek: { location: "right_cheek", label: "Right cheek" },
  right_cheek: { location: "left_cheek", label: "Left cheek" },
  left_jaw: { location: "right_jaw", label: "Right jaw" },
  right_jaw: { location: "left_jaw", label: "Left jaw" },
  left_ear: { location: "right_ear", label: "Right ear area" },
  right_ear: { location: "left_ear", label: "Left ear area" },
};

function toPatientPerspective(
  location: FaceLocationKey,
  label: string,
): { location: FaceLocationKey; label: string } {
  return PATIENT_PERSPECTIVE_MIRROR[location] ?? { location, label };
}

function buildFaceMapPoint(
  x: number,
  y: number,
  location: FaceLocationKey,
  label: string,
  division: FaceAreaOption,
): FaceMapPoint {
  const patientLocation = toPatientPerspective(location, label);

  return {
    x,
    y,
    division,
    location: patientLocation.location,
    label: patientLocation.label,
  };
}

/** Outer nose column (bridge flank + philtrum gap); stops before cheek territory. */
function isNoseSideColumn(x: number, y: number) {
  const dist = Math.abs(x - FACE_MIDLINE_X);

  if (dist < 40 || dist > 59) {
    return false;
  }

  return (y >= 288 && y <= 345) || (y >= 346 && y <= 452);
}

function getSide(x: number): "left" | "right" | "center" {
  if (x < FACE_MIDLINE_X - CENTER_BAND) {
    return "left";
  }

  if (x > FACE_MIDLINE_X + CENTER_BAND) {
    return "right";
  }

  return "center";
}

const ZONE_MATCH_PRIORITY: Partial<Record<FaceLocationKey, number>> = {
  nose_bridge: 0,
  left_nose: 0,
  right_nose: 0,
  left_eye: 2,
  right_eye: 2,
  left_under_eye: 2,
  right_under_eye: 2,
  left_cheek: 3,
  right_cheek: 3,
};

function findMatchingZone(x: number, y: number) {
  const matches = FACE_ZONES.filter((zone) => isPointInPolygon([x, y], zone.polygon));

  if (!matches.length) {
    return null;
  }

  const distFromMidline = Math.abs(x - FACE_MIDLINE_X);

  return matches.sort((left, right) => {
    const leftIsNose = left.location.includes("nose");
    const rightIsNose = right.location.includes("nose");
    const leftIsCheek = left.location.includes("cheek");
    const rightIsCheek = right.location.includes("cheek");

    if (distFromMidline > 59 && leftIsNose !== rightIsNose) {
      if (leftIsCheek) {
        return -1;
      }

      if (rightIsCheek) {
        return 1;
      }
    }

    if (distFromMidline > 54 && distFromMidline <= 59 && leftIsNose !== rightIsNose) {
      if (leftIsNose) {
        return -1;
      }

      if (rightIsNose) {
        return 1;
      }
    }

    const priorityLeft = ZONE_MATCH_PRIORITY[left.location] ?? 1;
    const priorityRight = ZONE_MATCH_PRIORITY[right.location] ?? 1;

    if (priorityLeft !== priorityRight) {
      return priorityLeft - priorityRight;
    }

    return polygonArea(left.polygon) - polygonArea(right.polygon);
  })[0]!;
}

function fallbackLocation(
  x: number,
  y: number,
  division: FaceAreaOption,
): { location: FaceLocationKey; label: string; division: FaceAreaOption } {
  const side = getSide(x);

  if (isNoseSideColumn(x, y)) {
    return side === "left"
      ? { location: "left_nose", label: "Left side of nose", division }
      : { location: "right_nose", label: "Right side of nose", division };
  }

  if (division === "v1") {
    if (y < 242) {
      if (side === "center") {
        return { location: "forehead", label: "Forehead", division: "v1" };
      }

      return side === "left"
        ? { location: "left_forehead", label: "Left forehead", division: "v1" }
        : { location: "right_forehead", label: "Right forehead", division: "v1" };
    }

    if (side === "center") {
      return { location: "nose_bridge", label: "Bridge of nose", division: "v1" };
    }

    if (y < 302) {
      return side === "left"
        ? { location: "left_eye", label: "Left eye area", division: "v1" }
        : { location: "right_eye", label: "Right eye area", division: "v1" };
    }

    return side === "left"
      ? { location: "left_under_eye", label: "Under left eye", division: "v1" }
      : { location: "right_under_eye", label: "Under right eye", division: "v1" };
  }

  if (division === "v2") {
    if (side === "center") {
      if (y >= 473) {
        return { location: "upper_lip", label: "Upper lip", division: "v2" };
      }

      return { location: "nose_bridge", label: "Bridge of nose", division: "v2" };
    }

    if (y < 368) {
      return side === "left"
        ? { location: "left_under_eye", label: "Under left eye", division: "v2" }
        : { location: "right_under_eye", label: "Under right eye", division: "v2" };
    }

    if (y < 448) {
      return side === "left"
        ? { location: "left_cheek", label: "Left cheek", division: "v2" }
        : { location: "right_cheek", label: "Right cheek", division: "v2" };
    }

    return side === "left"
      ? { location: "left_cheek", label: "Left cheek", division: "v2" }
      : { location: "right_cheek", label: "Right cheek", division: "v2" };
  }

  if (side === "center") {
    return y < 545
      ? { location: "lower_lip", label: "Lower lip", division: "v3" }
      : { location: "chin", label: "Chin", division: "v3" };
  }

  if (y < 455 && Math.abs(x - FACE_MIDLINE_X) > 280) {
    return side === "left"
      ? { location: "left_ear", label: "Left ear area", division: "v3" }
      : { location: "right_ear", label: "Right ear area", division: "v3" };
  }

  return side === "left"
    ? { location: "left_jaw", label: "Left jaw", division: "v3" }
    : { location: "right_jaw", label: "Right jaw", division: "v3" };
}

function isInsideFace(x: number, y: number) {
  if (
    x < FACE_BOUNDS.minX ||
    x > FACE_BOUNDS.maxX ||
    y < FACE_BOUNDS.minY ||
    y > FACE_BOUNDS.maxY
  ) {
    return false;
  }

  if (y > 585 && Math.abs(x - FACE_MIDLINE_X) > 295) {
    return false;
  }

  return isPointInEllipse(
    [x, y],
    FACE_BOUNDARY.center,
    FACE_BOUNDARY.radiusX,
    FACE_BOUNDARY.radiusY,
  );
}

export function classifyFaceCoordinate(x: number, y: number): ClassifyResult {
  if (!isInsideFace(x, y)) {
    return { ok: false, reason: "outside_face" };
  }

  const division = getTrigeminalDivision(x, y);
  const matchedZone = findMatchingZone(x, y);

  if (matchedZone) {
    return {
      ok: true,
      point: buildFaceMapPoint(x, y, matchedZone.location, matchedZone.label, division),
    };
  }

  const fallback = fallbackLocation(x, y, division);

  return {
    ok: true,
    point: buildFaceMapPoint(x, y, fallback.location, fallback.label, division),
  };
}

export function getUniqueDivisions(points: FaceMapPoint[] | undefined | null): FaceAreaOption[] {
  if (!points?.length) {
    return [];
  }

  return Array.from(new Set(points.map((point) => point.division)));
}
