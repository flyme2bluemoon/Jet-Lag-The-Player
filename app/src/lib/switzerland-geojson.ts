"use client";

import { useEffect, useState } from "react";
import type { FeatureCollection, Polygon } from "geojson";

const SWITZERLAND_GEOJSON_URL = "/geojson/switzerland.geojson";

export type SwitzerlandGeoJson = FeatureCollection<
    Polygon,
    { shapeName: string; shapeISO: string; shapeID: string; shapeGroup: string; shapeType: string }
>;

let cachedSwitzerlandGeoJson: SwitzerlandGeoJson | null = null;
let pendingSwitzerlandGeoJson: Promise<SwitzerlandGeoJson> | null = null;

/**
 * Loads the simplified Switzerland boundary once per client session so every
 * Season 9 map shares its parsed GeoJSON object.
 */
export function loadSwitzerlandGeoJson() {
    if (cachedSwitzerlandGeoJson) {
        return Promise.resolve(cachedSwitzerlandGeoJson);
    }

    pendingSwitzerlandGeoJson ??= fetch(SWITZERLAND_GEOJSON_URL)
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Unable to load Switzerland GeoJSON: ${response.status}`,
                );
            }
            return response.json() as Promise<SwitzerlandGeoJson>;
        })
        .then((geoJson) => {
            cachedSwitzerlandGeoJson = geoJson;
            return geoJson;
        })
        .catch((error: unknown) => {
            pendingSwitzerlandGeoJson = null;
            throw error;
        });

    return pendingSwitzerlandGeoJson;
}

export function useSwitzerlandGeoJson() {
    const [geoJson, setGeoJson] = useState(cachedSwitzerlandGeoJson);

    useEffect(() => {
        if (geoJson) return;

        let active = true;
        void loadSwitzerlandGeoJson()
            .then((loadedGeoJson) => {
                if (active) setGeoJson(loadedGeoJson);
            })
            .catch(() => {
                // Leave the map empty if the static asset cannot be loaded.
            });

        return () => {
            active = false;
        };
    }, [geoJson]);

    return geoJson;
}
