import { FACE_MAP_IMAGE, type FaceView } from "@/lib/face-map/types";

export type AnatomyAsset = {
  view: FaceView;
  label: string;
  src: string;
  width: number;
  height: number;
  approved: boolean;
  version: string;
  flipHorizontal?: boolean;
  sourceAttribution?: string;
  accessibleDescription: string;
};

export const ANATOMY_ASSETS: AnatomyAsset[] = [
  {
    view: "front",
    label: "Front",
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
    label: "Left side",
    src: "/images/face-map-side.jpg",
    width: 1024,
    height: 768,
    approved: true,
    version: "side-v1",
    flipHorizontal: true,
    sourceAttribution: "Original generated TN Track+ side-facing diagram",
    accessibleDescription: "Left side of the face.",
  },
  {
    view: "right-profile",
    label: "Right side",
    src: "/images/face-map-side.jpg",
    width: 1024,
    height: 768,
    approved: true,
    version: "side-v1",
    sourceAttribution: "Original generated TN Track+ side-facing diagram",
    accessibleDescription: "Right side of the face.",
  },
  {
    view: "teeth",
    label: "Teeth",
    src: "/images/face-map-teeth-closed.jpg",
    width: 1024,
    height: 768,
    approved: true,
    version: "teeth-v2-closed",
    sourceAttribution: "Original generated TN Track+ dental diagram",
    accessibleDescription: "Front view of the upper and lower teeth.",
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
