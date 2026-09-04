"use client";

import type { FeatureCollection, MultiPolygon } from "geojson";
import { JAPAN_GEOJSON_URL } from "@/generated/geojson-assets";
import { useGeoJson } from "@/lib/geojson";

export type JapanGeoJson = FeatureCollection<
  MultiPolygon,
  {
    shapeName: string;
    shapeISO: string;
    shapeID: string;
    shapeGroup: string;
    shapeType: string;
  }
>;

export function useJapanGeoJson() {
  return useGeoJson<JapanGeoJson>(JAPAN_GEOJSON_URL);
}
