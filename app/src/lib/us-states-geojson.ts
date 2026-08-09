"use client";

import type {
    FeatureCollection,
    MultiPolygon,
    Polygon,
} from "geojson";
import { loadGeoJson, useGeoJson } from "@/lib/geojson";

const US_STATES_GEOJSON_URL = "/geojson/us-states.geojson";

export type UsStateGeometry = Polygon | MultiPolygon;
export type UsStatesGeoJson = FeatureCollection<
    UsStateGeometry,
    { name: string; density?: number }
>;

export function loadUsStatesGeoJson() {
    return loadGeoJson<UsStatesGeoJson>(US_STATES_GEOJSON_URL);
}

export function useUsStatesGeoJson() {
    return useGeoJson<UsStatesGeoJson>(US_STATES_GEOJSON_URL);
}
