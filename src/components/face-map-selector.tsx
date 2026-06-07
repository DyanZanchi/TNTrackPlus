"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { classifyFaceCoordinate, getUniqueDivisions } from "@/lib/face-map/classify";
import { formatFacePointStatLabel, formatFacePointSummary } from "@/lib/face-map/format";
import { FACE_AREA_LABELS } from "@/lib/constants/episode-options";
import { FACE_DIVISION_COLORS } from "@/lib/face-map/constants";
import { toNormalizedCoordinate } from "@/lib/face-map/geometry";
import { btnSecondaryClass, cardClass } from "@/lib/design/ui-classes";
import { FACE_COORDINATE_SCALE, FACE_MAP_IMAGE, type FaceMapPoint } from "@/lib/face-map/types";
import { cn } from "@/lib/utils";

type FaceMapSelectorProps = {
  points: FaceMapPoint[];
  onChange: (points: FaceMapPoint[]) => void;
};

export function FaceMapSelector({ points, onChange }: FaceMapSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleImageClick(event: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const { x, y } = toNormalizedCoordinate(event.clientX, event.clientY, rect, FACE_COORDINATE_SCALE);
    const result = classifyFaceCoordinate(x, y);

    if (!result.ok) {
      setError("Tap on the face area only.");
      return;
    }

    setError(null);
    onChange([...points, result.point]);
  }

  function removePoint(index: number) {
    onChange(points.filter((_, pointIndex) => pointIndex !== index));
  }

  function clearAllPoints() {
    setError(null);
    onChange([]);
  }

  const divisions = getUniqueDivisions(points);

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className={cn(
          cardClass,
          "relative mx-auto max-w-md cursor-crosshair overflow-hidden rounded-3xl transition-shadow hover:shadow-[0_8px_32px_rgba(123,82,171,0.1)]",
        )}
        onClick={handleImageClick}
        role="application"
        aria-label="Tap anywhere on the face to mark pain locations"
      >
        <Image
          src={FACE_MAP_IMAGE.src}
          alt="Front-facing face diagram for pain location selection"
          width={FACE_MAP_IMAGE.width}
          height={FACE_MAP_IMAGE.height}
          className="h-auto w-full touch-manipulation select-none"
          priority
        />

        <svg
          viewBox={`0 0 ${FACE_COORDINATE_SCALE} ${FACE_COORDINATE_SCALE}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          aria-hidden
        >
          {points.map((point, index) => (
            <g key={`${point.x}-${point.y}-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="16"
                fill={FACE_DIVISION_COLORS[point.division]}
                fillOpacity="0.2"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="7"
                fill={FACE_DIVISION_COLORS[point.division]}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={point.x}
                y={point.y - 18}
                textAnchor="middle"
                className="fill-[color:var(--foreground)] text-[22px] font-semibold"
              >
                {index + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}

      {points.length ? (
        <div className={cn(cardClass, "space-y-3 p-4")}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
            {divisions.map((division) => (
              <span
                key={division}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-3 py-1 text-sm"
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: FACE_DIVISION_COLORS[division] }}
                  aria-hidden
                />
                {FACE_AREA_LABELS[division]}
              </span>
            ))}
            </div>
            <button
              type="button"
              onClick={clearAllPoints}
              className={cn(btnSecondaryClass, "min-h-0 rounded-2xl px-3 py-1.5 text-sm")}
            >
              Clear all
            </button>
          </div>

          <p className="text-sm text-[color:var(--foreground)]">{formatFacePointSummary(points)}</p>

          <ul className="space-y-2 text-sm">
            {points.map((point, index) => (
              <li
                key={`${point.x}-${point.y}-${point.location}-${index}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-[color:var(--accent)] px-3 py-2"
              >
                <span>
                  <span className="font-medium">{index + 1}.</span> {formatFacePointStatLabel(point)}
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removePoint(index);
                  }}
                  className={cn(btnSecondaryClass, "min-h-0 rounded-2xl px-2 py-1 text-xs")}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-[color:var(--muted)]">
          Tap anywhere on the face to mark where pain occurred. You can add multiple points.
        </p>
      )}

      <p className="text-xs text-[color:var(--muted)]">
        Left and right are from your perspective (as if you are the person in the image). Each tap saves
        coordinates and maps to a trigeminal division (V1, V2, or V3) plus a location such as left
        cheek or under the eye.
      </p>
    </div>
  );
}
