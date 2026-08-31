"use client";

import type { FeatureCollection, Polygon } from "geojson";
import { SWITZERLAND_GEOJSON_URL } from "@/generated/geojson-assets";
import { useGeoJson } from "@/lib/geojson";

type SwitzerlandGeoJson = FeatureCollection<
    Polygon,
    { shapeName: string; shapeISO: string; shapeID: string; shapeGroup: string; shapeType: string }
>;

export function useSwitzerlandGeoJson() {
    return useGeoJson<SwitzerlandGeoJson>(SWITZERLAND_GEOJSON_URL);
}
