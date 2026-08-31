"use client";

import { useEffect, useState } from "react";
import type { GeoJsonObject } from "geojson";

const cachedGeoJson = new Map<string, GeoJsonObject>();
const pendingGeoJson = new Map<string, Promise<GeoJsonObject>>();

/** Loads and parses a GeoJSON asset once per client session. */
function loadGeoJson<T extends GeoJsonObject>(url: string): Promise<T> {
    const cached = cachedGeoJson.get(url) as T | undefined;
    if (cached) return Promise.resolve(cached);

    const pending = pendingGeoJson.get(url) as Promise<T> | undefined;
    if (pending) return pending;

    const request = fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Unable to load GeoJSON from ${url}: ${response.status}`);
            }
            return response.json() as Promise<T>;
        })
        .then((geoJson) => {
            cachedGeoJson.set(url, geoJson);
            pendingGeoJson.delete(url);
            return geoJson;
        })
        .catch((error: unknown) => {
            pendingGeoJson.delete(url);
            throw error;
        });

    pendingGeoJson.set(url, request);
    return request;
}

/**
 * Returns a cached GeoJSON asset, loading it when a URL is supplied. Pass
 * `null` to defer the request until the geometry is needed.
 */
export function useGeoJson<T extends GeoJsonObject>(url: string | null) {
    const [loaded, setLoaded] = useState<{ data: T; url: string } | null>(() => {
        if (!url) return null;
        const cached = cachedGeoJson.get(url) as T | undefined;
        return cached ? { data: cached, url } : null;
    });
    const geoJson = loaded?.url === url ? loaded.data : null;

    useEffect(() => {
        if (!url || geoJson) return;

        let active = true;
        void loadGeoJson<T>(url)
            .then((data) => {
                if (active) setLoaded({ data, url });
            })
            .catch((error: unknown) => {
                if (active) console.error(`Unable to load GeoJSON from ${url}`, error);
            });

        return () => {
            active = false;
        };
    }, [geoJson, url]);

    return geoJson;
}
