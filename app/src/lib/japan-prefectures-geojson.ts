"use client";

import type {
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from "geojson";
import { JAPAN_PREFECTURES_GEOJSON_URL } from "@/generated/geojson-assets";
import { useGeoJson } from "@/lib/geojson";

export type JapanPrefectureGeometry = Polygon | MultiPolygon;
export type JapanPrefecturesGeoJson = FeatureCollection<
  JapanPrefectureGeometry,
  {
    name: string;
    shapeName: string;
    shapeISO: string;
    shapeID: string;
    shapeGroup: string;
    shapeType: string;
  }
>;

/** Loads Season 19's generated Japan ADM1 prefecture boundaries. */
export function useJapanPrefecturesGeoJson() {
  return useGeoJson<JapanPrefecturesGeoJson>(JAPAN_PREFECTURES_GEOJSON_URL);
}
