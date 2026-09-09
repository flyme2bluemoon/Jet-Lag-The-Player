import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { featureCollection } from "@turf/helpers";
import { union } from "@turf/union";

/**
 * National outline is the dissolve of the application prefecture set — not a
 * separately simplified ADM0 download. That keeps the outside-Japan mask from
 * cutting through prefecture fills when coastlines are detailed.
 *
 * Run `generate-japan-prefectures.mjs` first.
 */
const assetsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../assets/geojson",
);
const prefecturesPath = path.join(assetsDir, "japan-prefectures.geojson");
const outputPath = path.join(assetsDir, "japan.geojson");
/** Drop dissolve crumbs smaller than the prefecture generator's minimum part. */
const MINIMUM_POLYGON_AREA = 0.00008;

function ringArea(ring) {
  let area = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    area +=
      ring[index][0] * ring[index + 1][1] - ring[index + 1][0] * ring[index][1];
  }
  return Math.abs(area / 2);
}

function filterPolygons(geometry) {
  if (geometry.type === "Polygon") {
    if (ringArea(geometry.coordinates[0]) < MINIMUM_POLYGON_AREA) return null;
    return { type: "MultiPolygon", coordinates: [geometry.coordinates] };
  }

  if (geometry.type === "MultiPolygon") {
    const coordinates = geometry.coordinates.filter(
      (polygon) => ringArea(polygon[0]) >= MINIMUM_POLYGON_AREA,
    );
    if (coordinates.length === 0) return null;
    return { type: "MultiPolygon", coordinates };
  }

  throw new TypeError(`Unexpected dissolve geometry type: ${geometry.type}`);
}

const source = JSON.parse(await readFile(prefecturesPath, "utf8"));
if (!Array.isArray(source.features) || source.features.length === 0) {
  throw new TypeError("Expected japan-prefectures.geojson FeatureCollection");
}

const dissolved = union(featureCollection(source.features));
if (!dissolved?.geometry) {
  throw new RangeError("Prefecture dissolve produced empty geometry");
}

const geometry = filterPolygons(dissolved.geometry);
if (!geometry) {
  throw new RangeError("Prefecture dissolve produced no usable polygons");
}

const result = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        shapeName: "Japan",
        shapeGroup: "JPN",
        shapeType: "ADM0",
        source: "dissolved-from-japan-prefectures",
      },
      geometry,
    },
  ],
};

await writeFile(outputPath, `${JSON.stringify(result)}\n`);

const partCount =
  geometry.type === "MultiPolygon" ? geometry.coordinates.length : 1;
console.log(
  `Wrote Japan boundary (${geometry.type}, ${partCount} parts) to ${outputPath}`,
);
