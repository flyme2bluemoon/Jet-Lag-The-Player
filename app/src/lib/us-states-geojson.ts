"use client";

import { useEffect, useState } from "react";
import type {
    FeatureCollection,
    MultiPolygon,
    Polygon,
} from "geojson";

const US_STATES_GEOJSON_URL = "/geojson/us-states.geojson";

export type UsStateGeometry = Polygon | MultiPolygon;
export type UsStatesGeoJson = FeatureCollection<
    UsStateGeometry,
    { name: string; density?: number }
>;

let cachedUsStatesGeoJson: UsStatesGeoJson | null = null;
let pendingUsStatesGeoJson: Promise<UsStatesGeoJson> | null = null;

export function loadUsStatesGeoJson() {
    if (cachedUsStatesGeoJson) {
        return Promise.resolve(cachedUsStatesGeoJson);
    }

    pendingUsStatesGeoJson ??= fetch(US_STATES_GEOJSON_URL)
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Unable to load US states GeoJSON: ${response.status}`,
                );
            }
            return response.json() as Promise<UsStatesGeoJson>;
        })
        .then((geoJson) => {
            cachedUsStatesGeoJson = geoJson;
            return geoJson;
        })
        .catch((error: unknown) => {
            pendingUsStatesGeoJson = null;
            throw error;
        });

    return pendingUsStatesGeoJson;
}

export function useUsStatesGeoJson() {
    const [geoJson, setGeoJson] = useState(cachedUsStatesGeoJson);

    useEffect(() => {
        if (geoJson) return;

        let active = true;
        void loadUsStatesGeoJson()
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
