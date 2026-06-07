import { FACE_MIDLINE_X } from "@/lib/face-map/constants";
import type { FaceLocationKey, FaceZone } from "@/lib/face-map/types";

/**
 * Regions calibrated to public/images/face-map.png (1024×715).
 * Division boundaries follow the front-view TN diagram (V1/V2/V3 red lines).
 * Symmetry mirrors across FACE_MIDLINE_X (anatomical nose axis), not image center.
 * Left/right in polygons = image left/right; classify.ts mirrors to patient perspective.
 */
const MIDLINE_X = FACE_MIDLINE_X;
const FACE_HALF_WIDTH = 375;

export const FACE_BOUNDS = {
  minX: MIDLINE_X - FACE_HALF_WIDTH,
  maxX: MIDLINE_X + FACE_HALF_WIDTH,
  minY: 52,
  maxY: 652,
};

export const FACE_BOUNDARY = {
  center: [MIDLINE_X, 345] as [number, number],
  radiusX: 395,
  radiusY: 355,
};

function mirrorX(x: number) {
  return MIDLINE_X - (x - MIDLINE_X);
}

function mirrorPolygon(polygon: Array<[number, number]>) {
  return [...polygon].reverse().map(([x, y]) => [mirrorX(x), y] as [number, number]);
}

const LOCATION_MIRROR: Partial<Record<FaceLocationKey, FaceLocationKey>> = {
  left_forehead: "right_forehead",
  right_forehead: "left_forehead",
  left_eye: "right_eye",
  right_eye: "left_eye",
  left_under_eye: "right_under_eye",
  right_under_eye: "left_under_eye",
  left_nose: "right_nose",
  right_nose: "left_nose",
  left_cheek: "right_cheek",
  right_cheek: "left_cheek",
  left_jaw: "right_jaw",
  right_jaw: "left_jaw",
  left_ear: "right_ear",
  right_ear: "left_ear",
};

const LABEL_MIRROR: Record<string, string> = {
  "Left forehead": "Right forehead",
  "Right forehead": "Left forehead",
  "Left eye area": "Right eye area",
  "Right eye area": "Left eye area",
  "Under left eye": "Under right eye",
  "Under right eye": "Under left eye",
  "Left side of nose": "Right side of nose",
  "Right side of nose": "Left side of nose",
  "Left cheek": "Right cheek",
  "Right cheek": "Left cheek",
  "Left jaw": "Right jaw",
  "Right jaw": "Left jaw",
  "Left ear area": "Right ear area",
  "Right ear area": "Left ear area",
};

type ZoneTemplate = {
  location: FaceLocationKey;
  label: string;
  division: FaceZone["division"];
  polygon: Array<[number, number]>;
  symmetric?: boolean;
};

/** Calibrated in dev/face-map-editor — left and right polygons stored explicitly. */
const ZONE_TEMPLATES: ZoneTemplate[] = [
  // ── V1 ──
  {
    location: "forehead",
    label: "Forehead",
    division: "v1",
    polygon: [
      [456.6, 58],
      [496.6, 58],
      [496.6, 242],
      [456.6, 242],
    ],
  },
  {
    location: "nose_bridge",
    label: "Bridge of nose",
    division: "v1",
    polygon: [
      [466.6, 252.1],
      [484.1, 256.3],
      [486.9, 468.2],
      [467.8, 468.4],
    ],
  },
  {
    location: "left_forehead",
    label: "Left forehead",
    division: "v1",
    polygon: [
      [391.8, 77.9],
      [456.6, 58],
      [457.6, 280.1],
      [357.2, 301.8],
      [334.8, 271.9],
      [338.6, 200.9],
      [367.4, 121.5],
    ],
  },
  {
    location: "right_forehead",
    label: "Right forehead",
    division: "v1",
    polygon: [
      [603.6, 139.5],
      [618.6, 201.1],
      [624.3, 265.1],
      [607.5, 284],
      [492.8, 283.8],
      [496.6, 58],
      [574.8, 104.9],
    ],
  },
  {
    location: "left_eye",
    label: "Left eye area",
    division: "v1",
    polygon: [
      [368.7, 287.6],
      [451.5, 287.9],
      [461.2, 351.4],
      [386.1, 349.4],
    ],
  },
  {
    location: "right_eye",
    label: "Right eye area",
    division: "v1",
    polygon: [
      [585.1, 339.7],
      [498.8, 355.9],
      [507.1, 297.4],
      [577.5, 292.4],
    ],
  },

  // ── V2 ──
  {
    location: "upper_lip",
    label: "Upper lip",
    division: "v2",
    polygon: [
      [463.6, 473],
      [489.6, 473],
      [483.6, 480],
      [469.6, 480],
    ],
  },
  {
    location: "left_under_eye",
    label: "Under left eye",
    division: "v2",
    polygon: [
      [359.2, 341.5],
      [429.6, 367.3],
      [439.7, 366.2],
      [357.7, 366.7],
    ],
  },
  {
    location: "right_under_eye",
    label: "Under right eye",
    division: "v2",
    polygon: [
      [574.3, 361.2],
      [513, 362.1],
      [510.2, 359.1],
      [580.1, 341.9],
    ],
  },
  {
    location: "left_nose",
    label: "Left side of nose",
    division: "v2",
    polygon: [
      [446, 364.8],
      [462.4, 344.4],
      [461.4, 452.2],
      [445.5, 446.6],
    ],
  },
  {
    location: "right_nose",
    label: "Right side of nose",
    division: "v2",
    polygon: [
      [509.6, 458.4],
      [493.2, 460.3],
      [491.1, 391],
      [501.2, 383.8],
    ],
  },
  {
    location: "left_nose",
    label: "Left side of nose",
    division: "v2",
    polygon: [
      [445.6, 379.7],
      [465.1, 372.3],
      [461.6, 450],
      [448.6, 448.6],
    ],
  },
  {
    location: "right_nose",
    label: "Right side of nose",
    division: "v2",
    polygon: [
      [508.9, 458.1],
      [495.4, 451.6],
      [494.8, 355.2],
      [513.4, 358.2],
    ],
  },
  {
    location: "left_nose",
    label: "Left side of nose",
    division: "v2",
    polygon: [
      [456.6, 453],
      [461.6, 456],
      [461.6, 469],
      [456.6, 471],
    ],
  },
  {
    location: "right_nose",
    label: "Right side of nose",
    division: "v2",
    polygon: [
      [496.6, 471],
      [491.6, 469],
      [491.6, 456],
      [496.6, 453],
    ],
  },
  {
    location: "left_cheek",
    label: "Left cheek",
    division: "v2",
    polygon: [
      [348.3, 373.9],
      [436.8, 376.5],
      [442.3, 460.9],
      [446.3, 496.3],
      [408.2, 527.7],
      [381.9, 473.9],
      [354, 470],
    ],
  },
  {
    location: "right_cheek",
    label: "Right cheek",
    division: "v2",
    polygon: [
      [599, 489.7],
      [565.6, 466.9],
      [544.1, 540.1],
      [507.5, 503.5],
      [513.3, 403.9],
      [511.7, 370.1],
      [607.5, 362.1],
    ],
  },

  // ── V3 ──
  {
    location: "lower_lip",
    label: "Lower lip",
    division: "v3",
    polygon: [
      [422.6, 518],
      [530.6, 518],
      [526.6, 538],
      [426.6, 538],
    ],
  },
  {
    location: "chin",
    label: "Chin",
    division: "v3",
    polygon: [
      [404.6, 538],
      [548.6, 538],
      [534.6, 648],
      [418.6, 648],
    ],
  },
  {
    location: "left_jaw",
    label: "Left jaw",
    division: "v3",
    polygon: [
      [349.9, 486],
      [376.3, 468.4],
      [404.6, 538],
      [405.6, 650.9],
      [375, 571.3],
      [351.5, 562.5],
    ],
  },
  {
    location: "right_jaw",
    label: "Right jaw",
    division: "v3",
    polygon: [
      [603, 528.8],
      [588.4, 573.4],
      [557.3, 645.8],
      [548.6, 538],
      [564, 475.9],
      [603.5, 491.6],
    ],
  },
  {
    location: "left_ear",
    label: "Left ear area",
    division: "v3",
    polygon: [
      [326, 304.1],
      [341.3, 316.1],
      [349.6, 466.3],
      [338.7, 452.4],
      [309.9, 380.8],
      [310.9, 326.6],
    ],
  },
  {
    location: "right_ear",
    label: "Right ear area",
    division: "v3",
    polygon: [
      [649.1, 331],
      [646, 374.8],
      [618.5, 463],
      [606.2, 458.2],
      [613.1, 328.3],
      [627.3, 305.1],
    ],
  },
];

function expandSymmetricZones(templates: ZoneTemplate[]): FaceZone[] {
  const zones: FaceZone[] = [];

  for (const template of templates) {
    zones.push({
      location: template.location,
      label: template.label,
      division: template.division,
      polygon: template.polygon,
    });

    if (!template.symmetric) {
      continue;
    }

    const mirroredLocation = LOCATION_MIRROR[template.location];

    if (!mirroredLocation) {
      continue;
    }

    zones.push({
      location: mirroredLocation,
      label: LABEL_MIRROR[template.label] ?? template.label,
      division: template.division,
      polygon: mirrorPolygon(template.polygon),
    });
  }

  return zones;
}

export const FACE_ZONES: FaceZone[] = expandSymmetricZones(ZONE_TEMPLATES);
