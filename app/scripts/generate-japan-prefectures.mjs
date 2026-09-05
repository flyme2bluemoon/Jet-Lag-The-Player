import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_URL =
  "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/JPN/ADM1/geoBoundaries-JPN-ADM1_simplified.geojson";
const outputPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../assets/geojson/japan-prefectures.geojson",
);
/** Finer than the ADM0 national mask so adjacent prefecture borders stay usable. */
const SIMPLIFICATION_TOLERANCE = 0.005;
const MINIMUM_POLYGON_AREA = 0.0005;
const EXPECTED_PREFECTURE_COUNT = 47;

function squaredSegmentDistance(point, start, end) {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;

  if (dx !== 0 || dy !== 0) {
    const position =
      ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);

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
    ...simplifyOpenLine(points.slice(0, splitIndex + 1), squaredTolerance).slice(
      0,
      -1,
    ),
    ...simplifyOpenLine(points.slice(splitIndex), squaredTolerance),
  ];
}

function simplifyRing(ring) {
  const openRing = ring.slice(0, -1);
  if (openRing.length < 3) return null;

  const anchorIndex = openRing.reduce(
    (bestIndex, point, index) =>
      point[0] < openRing[bestIndex][0] ? index : bestIndex,
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
    area +=
      ring[index][0] * ring[index + 1][1] - ring[index + 1][0] * ring[index][1];
  }
  return Math.abs(area / 2);
}

function simplifyPolygon(polygon) {
  if (ringArea(polygon[0]) < MINIMUM_POLYGON_AREA) return null;

  const rings = polygon.map(simplifyRing).filter((ring) => ring !== null);
  return rings.length > 0 ? rings : null;
}

function prefectureName(shapeName) {
  return shapeName.replace(/ Prefecture$/, "");
}

function simplifyFeature(feature) {
  const { geometry, properties } = feature;
  if (!properties?.shapeName || !properties?.shapeISO) {
    throw new TypeError("Prefecture feature is missing shapeName or shapeISO");
  }

  const nextProperties = {
    name: prefectureName(properties.shapeName),
    shapeName: properties.shapeName,
    shapeISO: properties.shapeISO,
    shapeID: properties.shapeID,
    shapeGroup: properties.shapeGroup,
    shapeType: properties.shapeType,
  };

  if (geometry?.type === "Polygon") {
    const coordinates = simplifyPolygon(geometry.coordinates);
    if (!coordinates) {
      throw new RangeError(
        `Prefecture ${properties.shapeName} simplified to empty geometry`,
      );
    }
    return {
      type: "Feature",
      id: properties.shapeISO,
      properties: nextProperties,
      geometry: { type: "Polygon", coordinates },
    };
  }

  if (geometry?.type === "MultiPolygon") {
    const coordinates = geometry.coordinates
      .map(simplifyPolygon)
      .filter((polygon) => polygon !== null);
    if (coordinates.length === 0) {
      throw new RangeError(
        `Prefecture ${properties.shapeName} simplified to empty geometry`,
      );
    }
    if (coordinates.length === 1) {
      return {
        type: "Feature",
        id: properties.shapeISO,
        properties: nextProperties,
        geometry: { type: "Polygon", coordinates: coordinates[0] },
      };
    }
    return {
      type: "Feature",
      id: properties.shapeISO,
      properties: nextProperties,
      geometry: { type: "MultiPolygon", coordinates },
    };
  }

  throw new TypeError(
    `Unexpected prefecture geometry type: ${geometry?.type ?? "missing"}`,
  );
}

const response = await fetch(SOURCE_URL);
if (!response.ok) {
  throw new Error(
    `Japan prefecture boundary download failed with ${response.status}`,
  );
}

const source = await response.json();
if (!Array.isArray(source.features)) {
  throw new TypeError("Expected a FeatureCollection of Japan prefectures");
}

const features = source.features.map(simplifyFeature);
if (features.length !== EXPECTED_PREFECTURE_COUNT) {
  throw new RangeError(
    `Expected ${EXPECTED_PREFECTURE_COUNT} prefectures, got ${features.length}`,
  );
}

features.sort((left, right) =>
  left.properties.name.localeCompare(right.properties.name, "en"),
);

const result = {
  type: "FeatureCollection",
  features,
};

await writeFile(outputPath, `${JSON.stringify(result)}\n`);
console.log(
  `Wrote ${features.length} Japan prefectures to ${outputPath}`,
);
