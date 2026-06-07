"use client";

import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { classifyFaceCoordinate } from "@/lib/face-map/classify";
import { FACE_DIVISION_COLORS, FACE_MIDLINE_X } from "@/lib/face-map/constants";
import { getTrigeminalDivision } from "@/lib/face-map/divisions";
import { isPointInPolygon, polygonArea } from "@/lib/face-map/geometry";
import { FACE_ZONES } from "@/lib/face-map/regions";
import { FACE_COORDINATE_SCALE, FACE_MAP_IMAGE, type FaceZone } from "@/lib/face-map/types";

type EditableZone = FaceZone & { id: string };

const SCALE = FACE_COORDINATE_SCALE;

function toEditableZones(zones: FaceZone[]): EditableZone[] {
  const counts = new Map<string, number>();

  return zones.map((zone) => {
    const count = (counts.get(zone.location) ?? 0) + 1;
    counts.set(zone.location, count);

    return {
      ...zone,
      id: `${zone.location}_${count}`,
      polygon: zone.polygon.map(([x, y]) => [x, y] as [number, number]),
    };
  });
}

function clientToSvg(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): [number, number] {
  const x = ((clientX - rect.left) / rect.width) * SCALE;
  const y = ((clientY - rect.top) / rect.height) * SCALE;

  return [Number(x.toFixed(1)), Number(y.toFixed(1))];
}

function formatPolygon(polygon: Array<[number, number]>) {
  return polygon.map(([x, y]) => `[${x}, ${y}]`).join(",\n      ");
}

function exportZonesTs(zones: EditableZone[]) {
  const blocks = zones.map(
    (zone) => `  {
    location: "${zone.location}",
    label: "${zone.label}",
    division: "${zone.division}",
    polygon: [
      ${formatPolygon(zone.polygon)},
    ],
  }`,
  );

  return `// Paste into ZONE_TEMPLATES or use polygons directly in regions.ts\n[\n${blocks.join(",\n")}\n]`;
}

function findZoneAtPoint(zones: EditableZone[], x: number, y: number) {
  const matches = zones.filter((zone) => isPointInPolygon([x, y], zone.polygon));

  if (!matches.length) {
    return null;
  }

  return matches.sort((left, right) => polygonArea(left.polygon) - polygonArea(right.polygon))[0]!;
}

export function FaceMapPolygonEditor() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zones, setZones] = useState<EditableZone[]>(() => toEditableZones(FACE_ZONES));
  const [selectedId, setSelectedId] = useState<string | null>(zones[0]?.id ?? null);
  const [selectedVertex, setSelectedVertex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(true);
  const [showMidline, setShowMidline] = useState(true);
  const [showProduction, setShowProduction] = useState(true);
  const [testPoint, setTestPoint] = useState<[number, number] | null>(null);
  const [dragging, setDragging] = useState<{ zoneId: string; vertexIndex: number } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const selectedZone = zones.find((zone) => zone.id === selectedId) ?? null;
  const selectedVertexPoint =
    selectedZone && selectedVertex !== null
      ? selectedZone.polygon[selectedVertex]
      : undefined;

  function selectZone(zoneId: string) {
    setSelectedId(zoneId);
    setSelectedVertex(null);
  }

  const visibleZones = useMemo(() => {
    if (showAll) {
      return zones;
    }

    return selectedZone ? [selectedZone] : [];
  }, [showAll, selectedZone, zones]);

  const updateVertex = useCallback((zoneId: string, vertexIndex: number, point: [number, number]) => {
    setZones((current) =>
      current.map((zone) => {
        if (zone.id !== zoneId) {
          return zone;
        }

        const polygon = zone.polygon.map((vertex, index) =>
          index === vertexIndex ? point : vertex,
        );

        return { ...zone, polygon };
      }),
    );
  }, []);

  function handlePointerDown(
    event: React.PointerEvent,
    zoneId: string,
    vertexIndex: number,
  ) {
    event.stopPropagation();
    setSelectedId(zoneId);
    setSelectedVertex(vertexIndex);
    setDragging({ zoneId, vertexIndex });
    (event.target as Element).setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!dragging || !svgRef.current) {
      return;
    }

    const rect = svgRef.current.getBoundingClientRect();
    const [x, y] = clientToSvg(event.clientX, event.clientY, rect);
    updateVertex(dragging.zoneId, dragging.vertexIndex, [x, y]);
  }

  function handlePointerUp() {
    setDragging(null);
  }

  function handleCanvasClick(event: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) {
      return;
    }

    const rect = svgRef.current.getBoundingClientRect();
    const [x, y] = clientToSvg(event.clientX, event.clientY, rect);
    setTestPoint([x, y]);

    const hit = findZoneAtPoint(zones, x, y);
    if (hit) {
      selectZone(hit.id);
    }
  }

  const editorPreview = testPoint
    ? findZoneAtPoint(zones, testPoint[0], testPoint[1])
    : null;

  const productionPreview = testPoint
    ? classifyFaceCoordinate(testPoint[0], testPoint[1])
    : null;

  async function copyText(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 2000);
  }

  function resetZones() {
    const fresh = toEditableZones(FACE_ZONES);
    setZones(fresh);
    setSelectedId(fresh[0]?.id ?? null);
    setSelectedVertex(null);
    setTestPoint(null);
  }

  return (
    <div className="min-h-screen bg-[#1a1225] text-white">
      <header className="border-b border-white/10 px-4 py-3">
        <h1 className="text-lg font-semibold">Face map polygon editor (dev only)</h1>
        <p className="text-sm text-white/60">
          Drag vertices, click the face to test taps. Export JSON/TS and paste into{" "}
          <code className="text-white/80">regions.ts</code>. Reload after saving file changes.
        </p>
      </header>

      <div className="grid gap-4 p-4 lg:grid-cols-[240px_1fr_280px]">
        <aside className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <label className="flex items-center gap-1.5">
              <input checked={showAll} onChange={(e) => setShowAll(e.target.checked)} type="checkbox" />
              All zones
            </label>
            <label className="flex items-center gap-1.5">
              <input
                checked={showMidline}
                onChange={(e) => setShowMidline(e.target.checked)}
                type="checkbox"
              />
              Midline
            </label>
            <label className="flex items-center gap-1.5">
              <input
                checked={showProduction}
                onChange={(e) => setShowProduction(e.target.checked)}
                type="checkbox"
              />
              Prod classify
            </label>
          </div>

          <button
            className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
            onClick={resetZones}
            type="button"
          >
            Reset from regions.ts
          </button>

          <ul className="max-h-[70vh] space-y-1 overflow-y-auto text-sm">
            {zones.map((zone) => (
              <li key={zone.id}>
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/10 data-[active=true]:bg-white/15"
                  data-active={selectedId === zone.id}
                  onClick={() => selectZone(zone.id)}
                  type="button"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: FACE_DIVISION_COLORS[zone.division] }}
                  />
                  <span className="truncate">{zone.id}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            <Image
              alt="Face map"
              className="h-auto w-full select-none"
              height={FACE_MAP_IMAGE.height}
              priority
              src={FACE_MAP_IMAGE.src}
              width={FACE_MAP_IMAGE.width}
            />
            <svg
              ref={svgRef}
              className="absolute inset-0 h-full w-full touch-none"
              onClick={handleCanvasClick}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              viewBox={`0 0 ${SCALE} ${SCALE}`}
              preserveAspectRatio="none"
            >
              {showMidline ? (
                <line
                  x1={FACE_MIDLINE_X}
                  x2={FACE_MIDLINE_X}
                  y1={40}
                  y2={680}
                  stroke="#ff6b6b"
                  strokeDasharray="8 6"
                  strokeWidth="2"
                />
              ) : null}

              {visibleZones.map((zone) => {
                const isSelected = zone.id === selectedId;
                const color = FACE_DIVISION_COLORS[zone.division];
                const points = zone.polygon.map(([x, y]) => `${x},${y}`).join(" ");

                return (
                  <g key={zone.id}>
                    <polygon
                      fill={color}
                      fillOpacity={isSelected ? 0.28 : 0.12}
                      points={points}
                      stroke={color}
                      strokeWidth={isSelected ? 2.5 : 1}
                    />
                    {isSelected
                      ? zone.polygon.map(([x, y], index) => (
                          <circle
                            key={`${zone.id}-${index}`}
                            cx={x}
                            cy={y}
                            fill={selectedVertex === index ? "#fff" : color}
                            onPointerDown={(event) => handlePointerDown(event, zone.id, index)}
                            r={selectedVertex === index ? 9 : 7}
                            stroke="#fff"
                            strokeWidth="2"
                            style={{ cursor: "grab" }}
                          />
                        ))
                      : null}
                  </g>
                );
              })}

              {testPoint ? (
                <g>
                  <circle cx={testPoint[0]} cy={testPoint[1]} fill="#fff" r="6" stroke="#111" strokeWidth="2" />
                  <line
                    x1={testPoint[0]}
                    x2={FACE_MIDLINE_X}
                    y1={testPoint[1]}
                    y2={testPoint[1]}
                    stroke="#ffffff55"
                    strokeDasharray="4 4"
                  />
                </g>
              ) : null}
            </svg>
          </div>
        </div>

        <aside className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
          {selectedZone ? (
            <div>
              <h2 className="font-medium">{selectedZone.id}</h2>
              <p className="text-white/60">{selectedZone.label}</p>
              <p className="text-white/60">{selectedZone.division.toUpperCase()}</p>
            </div>
          ) : null}

          {selectedVertexPoint ? (
            <div className="rounded-lg bg-black/30 p-2 font-mono text-xs">
              vertex {selectedVertex}: [{selectedVertexPoint[0]}, {selectedVertexPoint[1]}]
            </div>
          ) : null}

          {testPoint ? (
            <div className="space-y-2 rounded-lg bg-black/30 p-2 text-xs">
              <p className="font-medium">Test tap</p>
              <p className="font-mono">
                x={testPoint[0]}, y={testPoint[1]}
              </p>
              <p>dist midline: {Math.abs(testPoint[0] - FACE_MIDLINE_X).toFixed(1)}</p>
              <p>division: {getTrigeminalDivision(testPoint[0], testPoint[1]).toUpperCase()}</p>
              <p>
                editor zone:{" "}
                {editorPreview ? `${editorPreview.id} (${editorPreview.label})` : "none"}
              </p>
              {showProduction ? (
                <p>
                  production:{" "}
                  {productionPreview?.ok
                    ? `${productionPreview.point.label} [${productionPreview.point.location}]`
                    : "outside face"}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-white/50">Click the face to place a test tap.</p>
          )}

          <div className="space-y-2">
            <button
              className="w-full rounded-lg bg-[#7b52ab] px-3 py-2 text-sm font-medium hover:opacity-90"
              onClick={() =>
                selectedZone
                  ? copyText(
                      `polygon: [\n      ${formatPolygon(selectedZone.polygon)},\n    ]`,
                      "selected polygon",
                    )
                  : undefined
              }
              type="button"
            >
              Copy selected polygon
            </button>
            <button
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
              onClick={() => copyText(JSON.stringify(zones, null, 2), "all zones JSON")}
              type="button"
            >
              Copy all zones (JSON)
            </button>
            <button
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
              onClick={() => copyText(exportZonesTs(zones), "TypeScript export")}
              type="button"
            >
              Copy all zones (TS)
            </button>
          </div>

          {copied ? <p className="text-xs text-green-300">Copied {copied}</p> : null}

          <details className="text-xs text-white/70">
            <summary className="cursor-pointer">Import JSON</summary>
            <textarea
              className="mt-2 h-32 w-full rounded-lg border border-white/10 bg-black/40 p-2 font-mono text-[11px]"
              onBlur={(event) => {
                const value = event.target.value.trim();
                if (!value) {
                  return;
                }

                try {
                  const parsed = JSON.parse(value) as EditableZone[];
                  const valid = parsed.every(
                    (zone) =>
                      zone.id &&
                      zone.location &&
                      zone.label &&
                      zone.division &&
                      Array.isArray(zone.polygon),
                  );

                  if (!valid) {
                    window.alert("JSON must include id, location, label, division, and polygon[]");
                    return;
                  }

                  setZones(parsed);
                  selectZone(parsed[0]!.id);
                } catch {
                  window.alert("Invalid JSON");
                }
              }}
              placeholder="Paste exported JSON here, then click away to load"
            />
          </details>
        </aside>
      </div>
    </div>
  );
}
