"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { classifyFaceCoordinate, getUniqueDivisions } from "@/lib/face-map/classify";
import { formatFacePointStatLabel, formatFacePointSummary } from "@/lib/face-map/format";
import { FACE_AREA_LABELS } from "@/lib/constants/episode-options";
import { getApprovedAnatomyAssets, getDefaultAnatomyAsset } from "@/lib/face-map/assets";
import { FACE_DIVISION_COLORS } from "@/lib/face-map/constants";
import { toNormalizedCoordinate } from "@/lib/face-map/geometry";
import { FACE_ZONES } from "@/lib/face-map/regions";
import { btnSecondaryClass, cardClass, inputClass } from "@/lib/design/ui-classes";
import { FACE_COORDINATE_SCALE, type FaceMapPoint } from "@/lib/face-map/types";
import { cn } from "@/lib/utils";

type FaceMapSelectorProps = {
  points: FaceMapPoint[];
  onChange: (points: FaceMapPoint[]) => void;
};

function zoneCentroid(polygon: Array<[number, number]>) {
  const total = polygon.reduce(
    (sum, [x, y]) => ({ x: sum.x + x, y: sum.y + y }),
    { x: 0, y: 0 },
  );

  return {
    x: total.x / polygon.length,
    y: total.y / polygon.length,
  };
}

export function FaceMapSelector({ points, onChange }: FaceMapSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const approvedAssets = useMemo(() => getApprovedAnatomyAssets(), []);
  const [selectedView, setSelectedView] = useState(getDefaultAnatomyAsset().view);
  const selectedAsset =
    approvedAssets.find((asset) => asset.view === selectedView) ?? getDefaultAnatomyAsset();
  const locationOptions = useMemo(() => {
    const unique = new Map<string, (typeof FACE_ZONES)[number]>();

    for (const zone of FACE_ZONES) {
      if (!unique.has(zone.location)) {
        unique.set(zone.location, zone);
      }
    }

    return [...unique.values()].sort((left, right) => left.label.localeCompare(right.label));
  }, []);

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

  function addLocationFromList(location: string) {
    const zone = FACE_ZONES.find((entry) => entry.location === location);

    if (!zone) {
      return;
    }

    const { x, y } = zoneCentroid(zone.polygon);
    const result = classifyFaceCoordinate(x, y);

    if (!result.ok) {
      setError("That listed location could not be added. Tap the approved diagram instead.");
      return;
    }

    setError(null);
    onChange([...points, result.point]);
  }

  const divisions = getUniqueDivisions(points);

  return (
    <div className="space-y-3">
      {approvedAssets.length > 1 ? (
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Approved face diagram</legend>
          {approvedAssets.map((asset) => (
            <label key={asset.view} className="text-sm">
              <input
                type="radio"
                name="anatomy_view"
                value={asset.view}
                checked={selectedAsset.view === asset.view}
                onChange={() => setSelectedView(asset.view)}
                className="mr-2"
              />
              {asset.view}
            </label>
          ))}
        </fieldset>
      ) : null}

      <div
        ref={containerRef}
        className={cn(
          cardClass,
          "relative mx-auto max-w-md cursor-crosshair overflow-hidden rounded-3xl transition-shadow hover:shadow-[0_8px_32px_rgba(123,82,171,0.1)]",
        )}
        onClick={handleImageClick}
        role="application"
        aria-label={selectedAsset.accessibleDescription}
      >
        <Image
          src={selectedAsset.src}
          alt={selectedAsset.accessibleDescription}
          width={selectedAsset.width}
          height={selectedAsset.height}
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

      {error ? (
        <p role="alert" className="text-sm text-[color:var(--danger)]">
          {error}
        </p>
      ) : null}

      <label className="block max-w-md space-y-2">
        <span className="text-sm font-semibold">Or choose a location from the list</span>
        <select
          className={inputClass}
          defaultValue=""
          aria-label="Add a pain location from the list"
          onChange={(event) => {
            if (event.target.value) {
              addLocationFromList(event.target.value);
              event.target.value = "";
            }
          }}
        >
          <option value="">Select a facial region</option>
          {locationOptions.map((zone) => (
            <option key={`${zone.location}-${zone.label}`} value={zone.location}>
              {zone.label} ({FACE_AREA_LABELS[zone.division]})
            </option>
          ))}
        </select>
      </label>

      <p aria-live="polite" className="text-sm text-[color:var(--foreground)]">
        {points.length
          ? `Selected locations: ${formatFacePointSummary(points)}`
          : "No locations selected yet."}
      </p>

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
        {selectedAsset.accessibleDescription} Each tap or list selection saves coordinates and maps
        to a trigeminal division (V1, V2, or V3). Additional approved side and dental diagrams will
        appear here when they are available. Unapproved views are omitted.
      </p>
    </div>
  );
}
