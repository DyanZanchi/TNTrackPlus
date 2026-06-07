import type { FaceAreaOption } from "@/lib/types/episodes";
import type { FaceMapPoint } from "@/lib/face-map/types";

export function formatDivisionShort(division: FaceAreaOption) {
  return division.toUpperCase();
}

export function formatFacePointStatLabel(point: FaceMapPoint) {
  return `${point.label} (${formatDivisionShort(point.division)})`;
}

export function formatFacePointLabels(points: FaceMapPoint[]) {
  return points.map((point) => formatFacePointStatLabel(point)).join(", ");
}

export function formatFacePointSummary(points: FaceMapPoint[]) {
  if (!points.length) {
    return "";
  }

  const uniqueLabels = Array.from(
    new Map(points.map((point) => [formatFacePointStatLabel(point), point])).keys(),
  );

  return uniqueLabels.join(", ");
}
