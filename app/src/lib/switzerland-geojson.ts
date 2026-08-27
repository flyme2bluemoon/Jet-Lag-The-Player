"use client";

import type { FeatureCollection, Polygon } from "geojson";
import { SWITZERLAND_GEOJSON_URL } from "@/generated/geojson-assets";
import { loadGeoJson, useGeoJson } from "@/lib/geojson";

export type SwitzerlandGeoJson = FeatureCollection<
    Polygon,
    { shapeName: string; shapeISO: string; shapeID: string; shapeGroup: string; shapeType: string }
>;

/**
 * Loads the simplified Switzerland boundary once per client session so every
 * Season 9 map shares its parsed GeoJSON object.
 */
export function loadSwitzerlandGeoJson() {
    return loadGeoJson<SwitzerlandGeoJson>(SWITZERLAND_GEOJSON_URL);
}

export function useSwitzerlandGeoJson() {
    return useGeoJson<SwitzerlandGeoJson>(SWITZERLAND_GEOJSON_URL);
}
