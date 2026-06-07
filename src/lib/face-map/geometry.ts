export type Point = [number, number];

export function isPointInPolygon(point: Point, polygon: Point[]) {
  const [x, y] = point;
  let inside = false;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [xi, yi] = polygon[index]!;
    const [xj, yj] = polygon[previous]!;

    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

export function isPointInEllipse(point: Point, center: Point, radiusX: number, radiusY: number) {
  const [x, y] = point;
  const [centerX, centerY] = center;
  const normalizedX = (x - centerX) / radiusX;
  const normalizedY = (y - centerY) / radiusY;

  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
}

export function polygonArea(polygon: Point[]) {
  let area = 0;

  for (let index = 0; index < polygon.length; index++) {
    const [x1, y1] = polygon[index]!;
    const [x2, y2] = polygon[(index + 1) % polygon.length]!;
    area += x1 * y2 - x2 * y1;
  }

  return Math.abs(area) / 2;
}

export function toNormalizedCoordinate(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
  scale = 1000,
) {
  const x = ((clientX - rect.left) / rect.width) * scale;
  const y = ((clientY - rect.top) / rect.height) * scale;

  return {
    x: Number(x.toFixed(1)),
    y: Number(y.toFixed(1)),
  };
}
