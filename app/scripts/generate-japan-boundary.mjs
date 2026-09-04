import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_URL = "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/JPN/ADM0/geoBoundaries-JPN-ADM0_simplified.geojson";
const outputPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../assets/geojson/japan.geojson",
);
const SIMPLIFICATION_TOLERANCE = 0.02;
const MINIMUM_POLYGON_AREA = 0.002;

function squaredSegmentDistance(point, start, end) {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;

  if (dx !== 0 || dy !== 0) {
    const position = (
      (point[0] - x) * dx + (point[1] - y) * dy
    ) / (dx * dx + dy * dy);

    if (position > 1) {
      x = end[0];
      y = end[1];
    } else if (position > 0) {
      x += dx * position;
      y += dy * position;
    }
  }

  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
}

function simplifyOpenLine(points, squaredTolerance) {
  if (points.length <= 2) return points;

  let maximumDistance = squaredTolerance;
  let splitIndex = 0;

  for (let index = 1; index < points.length - 1; index += 1) {
    const distance = squaredSegmentDistance(
      points[index],
      points[0],
      points[points.length - 1],
    );
    if (distance > maximumDistance) {
      splitIndex = index;
      maximumDistance = distance;
    }
  }

  if (maximumDistance <= squaredTolerance) {
    return [points[0], points[points.length - 1]];
  }

  return [
    ...simplifyOpenLine(points.slice(0, splitIndex + 1), squaredTolerance).slice(0, -1),
    ...simplifyOpenLine(points.slice(splitIndex), squaredTolerance),
  ];
}

function simplifyRing(ring) {
  const openRing = ring.slice(0, -1);
  const anchorIndex = openRing.reduce(
    (bestIndex, point, index) => point[0] < openRing[bestIndex][0]
      ? index
      : bestIndex,
    0,
  );
  const rotatedRing = [
    ...openRing.slice(anchorIndex),
    ...openRing.slice(0, anchorIndex),
    openRing[anchorIndex],
  ];
  const simplified = simplifyOpenLine(
    rotatedRing,
    SIMPLIFICATION_TOLERANCE ** 2,
  );

  return simplified.length >= 4 ? simplified : null;
}

function ringArea(ring) {
  let area = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    area += ring[index][0] * ring[index + 1][1]
      - ring[index + 1][0] * ring[index][1];
  }
  return Math.abs(area / 2);
}

function simplifyPolygon(polygon) {
  if (ringArea(polygon[0]) < MINIMUM_POLYGON_AREA) return null;

  const rings = polygon
    .map(simplifyRing)
    .filter((ring) => ring !== null);
  return rings.length > 0 ? rings : null;
}

const response = await fetch(SOURCE_URL);
if (!response.ok) {
  throw new Error(`Japan boundary download failed with ${response.status}`);
}

const source = await response.json();
const feature = source.features?.[0];
if (feature?.geometry?.type !== "MultiPolygon") {
  throw new TypeError("Expected a single MultiPolygon Japan boundary feature");
}

const coordinates = feature.geometry.coordinates
  .map(simplifyPolygon)
  .filter((polygon) => polygon !== null);

const result = {
  type: "FeatureCollection",
  features: [{
    type: "Feature",
    properties: feature.properties,
    geometry: { type: "MultiPolygon", coordinates },
  }],
};

await writeFile(outputPath, `${JSON.stringify(result)}\n`);
console.log(`Wrote ${coordinates.length} Japan polygons to ${outputPath}`);
