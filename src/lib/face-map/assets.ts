import { FACE_MAP_IMAGE } from "@/lib/face-map/types";

export const FACE_VIEWS = ["front", "left-profile", "right-profile", "teeth"] as const;

export type FaceView = (typeof FACE_VIEWS)[number];

export type AnatomyAsset = {
  view: FaceView;
  src: string;
  width: number;
  height: number;
  approved: boolean;
  version: string;
  sourceAttribution?: string;
  accessibleDescription: string;
};

export const ANATOMY_ASSETS: AnatomyAsset[] = [
  {
    view: "front",
    src: FACE_MAP_IMAGE.src,
    width: FACE_MAP_IMAGE.width,
    height: FACE_MAP_IMAGE.height,
    approved: true,
    version: "front-v1",
    sourceAttribution: "Existing TN Track+ approved front-facing diagram",
    accessibleDescription:
      "Front-facing face diagram. Left and right are from your perspective, as if you are the person in the image.",
  },
  {
    view: "left-profile",
    src: "",
    width: 0,
    height: 0,
    approved: false,
    version: "unapproved",
    accessibleDescription: "Left-profile face diagram is not available yet.",
  },
  {
    view: "right-profile",
    src: "",
    width: 0,
    height: 0,
    approved: false,
    version: "unapproved",
    accessibleDescription: "Right-profile face diagram is not available yet.",
  },
  {
    view: "teeth",
    src: "",
    width: 0,
    height: 0,
    approved: false,
    version: "unapproved",
    accessibleDescription: "Dental chart is not available yet.",
  },
];

export function getApprovedAnatomyAssets() {
  return ANATOMY_ASSETS.filter((asset) => asset.approved && Boolean(asset.src));
}

export function getDefaultAnatomyAsset() {
  const [asset] = getApprovedAnatomyAssets();

  if (!asset) {
    throw new Error("No approved anatomy asset is registered.");
  }

  return asset;
}
