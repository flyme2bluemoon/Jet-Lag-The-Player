"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    MapPopup,
    type MapGeoJSONEvent,
    useMap,
} from "@/components/ui/map";

const HOVER_DELAY_MS = 500;

type RegionLabel = {
    latitude: number;
    longitude: number;
    name: string;
    trigger: "click" | "hover";
};

export function useMapRegionLabel() {
    const { map } = useMap();
    const [label, setLabel] = useState<RegionLabel | null>(null);
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearHoverTimer = useCallback(() => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
    }, []);

    useEffect(() => clearHoverTimer, [clearHoverTimer]);

    useEffect(() => {
        if (!label || !map) return;

        const dismissLabel = () => setLabel(null);
        map.once("mousemove", dismissLabel);

        return () => {
            map.off("mousemove", dismissLabel);
        };
    }, [label, map]);

    const showOnClick = useCallback((
        name: string,
        event: MapGeoJSONEvent,
    ) => {
        clearHoverTimer();
        setLabel({
            latitude: event.latitude,
            longitude: event.longitude,
            name,
            trigger: "click",
        });
    }, [clearHoverTimer]);

    const showOnHover = useCallback((
        name: string | null,
        event: MapGeoJSONEvent | null,
    ) => {
        if (!name || !event) {
            clearHoverTimer();
            setLabel((current) => current?.trigger === "hover" ? null : current);
            return;
        }

        clearHoverTimer();
        setLabel(null);
        hoverTimerRef.current = setTimeout(() => {
            setLabel({
                latitude: event.latitude,
                longitude: event.longitude,
                name,
                trigger: "hover",
            });
            hoverTimerRef.current = null;
        }, HOVER_DELAY_MS);
    }, [clearHoverTimer]);

    const regionLabelPopup = label ? (
        <MapPopup
            longitude={label.longitude}
            latitude={label.latitude}
            offset={8}
            maxWidth="10rem"
            closeOnClick
            focusAfterOpen={false}
            onClose={() => setLabel(null)}
            className="pointer-events-none max-w-40 rounded-full px-2 py-1"
        >
            <span className="font-sans text-xs leading-none font-medium whitespace-nowrap">
                {label.name}
            </span>
        </MapPopup>
    ) : null;

    return {
        regionLabelPopup,
        showOnClick,
        showOnHover,
    };
}
