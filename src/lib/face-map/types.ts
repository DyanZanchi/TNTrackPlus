import type { FaceAreaOption } from "@/lib/types/episodes";

export const FACE_MAP_IMAGE = {
  src: "/images/face-map.png",
  width: 1024,
  height: 715,
} as const;

export const FACE_COORDINATE_SCALE = 1000;

export const FACE_VIEWS = ["front", "left-profile", "right-profile", "teeth"] as const;

export type FaceView = (typeof FACE_VIEWS)[number];

export const FACE_LOCATION_KEYS = [
  "forehead",
  "left_forehead",
  "right_forehead",
  "left_temple",
  "right_temple",
  "left_eye",
  "right_eye",
  "left_under_eye",
  "right_under_eye",
  "nose_bridge",
  "left_nose",
  "right_nose",
  "upper_lip",
  "lower_lip",
  "left_cheek",
  "right_cheek",
  "left_jaw",
  "right_jaw",
  "chin",
  "left_ear",
  "right_ear",
  "left_upper_teeth",
  "right_upper_teeth",
  "left_lower_teeth",
  "right_lower_teeth",
] as const;

export type FaceLocationKey = (typeof FACE_LOCATION_KEYS)[number];

export type FaceMapPoint = {
  x: number;
  y: number;
  division: FaceAreaOption;
  location: FaceLocationKey;
  label: string;
  view?: FaceView;
};

export type FaceZone = {
  location: FaceLocationKey;
  label: string;
  division: FaceAreaOption;
  polygon: Array<[number, number]>;
};
