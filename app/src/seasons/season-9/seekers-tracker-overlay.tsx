"use client";

import { useEffect, useMemo, useState } from "react";
import {
    MapMarker,
    MapRoute,
    MarkerContent,
    useMap,
} from "@/components/ui/map";
import { MAPLIBRE_COLORS } from "@/components/ui/map-colors";
import { cn } from "@/lib/utils";
import type { SeekersTrackerState, TrackerCoordinate } from "./seekers-tracker-data";
import type { PlayerId } from "./timeline-data";

/** The earlier of the two seekers in this order paints the base line, the other the dashes. */
const PLAYER_ORDER = ["adam", "sam", "ben"] as const satisfies readonly PlayerId[];

const PLAYER_MAP_COLORS = {
    sam: MAPLIBRE_COLORS.jetLagYellow,
    adam: MAPLIBRE_COLORS.jetLagGreen,
    ben: MAPLIBRE_COLORS.jetLagRed,
} as const satisfies Record<PlayerId, string>;

const DASH_LENGTH = 1.6;
const GAP_LENGTH = 2.2;
const DASH_STEPS = 24;

/**
 * Dash patterns in line-width units, one per animation frame. Each places a dash
 * of the same length at `offset` along the pattern's period, so stepping through
 * the frames slides identical dashes forward along the whole route. Once the dash
 * runs past the end of the period it wraps, and the pattern has to start with the
 * wrapped tail before the gap and the remainder of the dash.
 */
const DASH_FRAMES = Array.from({ length: DASH_STEPS }, (_unused, step) => {
    const offset = (step / DASH_STEPS) * (DASH_LENGTH + GAP_LENGTH);
    if (offset <= GAP_LENGTH) return [0, offset, DASH_LENGTH, GAP_LENGTH - offset];

    const wrapped = offset - GAP_LENGTH;
    return [wrapped, GAP_LENGTH, DASH_LENGTH - wrapped, 0];
});

function useDashFrame(active: boolean) {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        if (!active) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const interval = window.setInterval(
            () => setFrame((current) => (current + 1) % DASH_FRAMES.length),
            120,
        );
        return () => window.clearInterval(interval);
    }, [active]);

    return DASH_FRAMES[frame]!;
}

const EARTH_RADIUS_KM = 6371;
const ROUTE_LABEL_REFERENCE_DISTANCE_KM = 20;
const ROUTE_LABEL_REFERENCE_ZOOM = 6;
const ROUTE_LABEL_MINIMUM_ZOOM = 4.5;
const ROUTE_LABEL_MAXIMUM_ZOOM = 12;
const ROUTE_MARKER_MINIMUM_SCALE = 0.68;
const ROUTE_MARKER_SCALE_START_ZOOM = 5.5;
const ROUTE_MARKER_FULL_SIZE_ZOOM = 9;

function degreesToRadians(degrees: number) {
    return degrees * Math.PI / 180;
}

function crowFlightDistanceKm(
    [startLongitude, startLatitude]: TrackerCoordinate,
    [endLongitude, endLatitude]: TrackerCoordinate,
) {
    const latitudeDelta = degreesToRadians(endLatitude - startLatitude);
    const longitudeDelta = degreesToRadians(endLongitude - startLongitude);
    const startLatitudeRadians = degreesToRadians(startLatitude);
    const endLatitudeRadians = degreesToRadians(endLatitude);
    const haversine = Math.sin(latitudeDelta / 2) ** 2
        + Math.cos(startLatitudeRadians)
        * Math.cos(endLatitudeRadians)
        * Math.sin(longitudeDelta / 2) ** 2;

    return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(haversine)));
}

/**
 * Map distance doubles with each zoom level, so halving a route's endpoint
 * distance requires one additional zoom level before its labels appear.
 */
function minimumRouteLabelZoom(start: TrackerCoordinate, end: TrackerCoordinate) {
    const distanceKm = Math.max(crowFlightDistanceKm(start, end), 0.1);
    const zoom = ROUTE_LABEL_REFERENCE_ZOOM
        + Math.log2(ROUTE_LABEL_REFERENCE_DISTANCE_KM / distanceKm);

    return Math.max(
        ROUTE_LABEL_MINIMUM_ZOOM,
        Math.min(ROUTE_LABEL_MAXIMUM_ZOOM, zoom),
    );
}

function routeMarkerScale(zoom: number) {
    const progress = Math.max(
        0,
        Math.min(
            1,
            (zoom - ROUTE_MARKER_SCALE_START_ZOOM)
                / (ROUTE_MARKER_FULL_SIZE_ZOOM - ROUTE_MARKER_SCALE_START_ZOOM),
        ),
    );

    return ROUTE_MARKER_MINIMUM_SCALE
        + progress * (1 - ROUTE_MARKER_MINIMUM_SCALE);
}

/** Tracks the map's zoom so markers can shrink as the viewport widens. */
function useMapZoom() {
    const { map } = useMap();
    const [zoom, setZoom] = useState(() => map?.getZoom() ?? ROUTE_MARKER_FULL_SIZE_ZOOM);

    useEffect(() => {
        if (!map) return;

        const update = () => setZoom(map.getZoom());
        update();
        map.on("zoom", update);
        return () => {
            map.off("zoom", update);
        };
    }, [map]);

    return zoom;
}

/**
 * Small two-tone dot: marks either end of a leg while the seekers are in transit,
 * including zoomed-out views where endpoint labels are hidden.
 */
function TwoColorDot({
    colors,
    className,
}: {
    colors: readonly string[];
    className?: string;
}) {
    const [leftColor = MAPLIBRE_COLORS.jetLagGreen, rightColor = leftColor] = colors;

    return (
        <span
            className={cn("block size-4 shrink-0 rounded-full", className)}
            style={{
                backgroundImage:
                    `linear-gradient(90deg, ${leftColor} 0 50%, ${rightColor} 50% 100%)`,
            }}
            aria-hidden="true"
        />
    );
}

function EndpointDot({
    colors,
    label,
    scale = 1,
}: {
    colors: readonly string[];
    label: string;
    scale?: number;
}) {
    return (
        <MarkerContent className="pointer-events-none">
            <div
                className="relative flex flex-col items-center"
                style={{ transform: `scale(${scale})` }}
                role="img"
                aria-label={label}
            >
                <TwoColorDot
                    colors={colors}
                    className="border-jet-lag-navy-blue border-2 shadow-lg"
                />
            </div>
        </MarkerContent>
    );
}

type EndpointBadgePlacement = "left" | "right";

function EndpointDotCap({
    colors,
    compact = false,
}: {
    colors: readonly string[];
    compact?: boolean;
}) {
    return (
        <span
            className={cn(
                "bg-jet-lag-navy-blue dark:bg-challenge-card-paper relative z-10 flex shrink-0 items-center justify-center rounded-full",
                compact ? "size-3" : "size-6",
            )}
        >
            <TwoColorDot
                colors={colors}
                className={cn(
                    "ring-challenge-card-paper/70 dark:ring-jet-lag-navy-blue/70 shadow-sm ring-1",
                    compact && "size-2",
                )}
            />
        </span>
    );
}

function MarkerLabel({
    children,
    className,
}: {
    children: string;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "bg-jet-lag-navy-blue text-challenge-card-paper dark:bg-challenge-card-paper dark:text-jet-lag-navy-blue font-heading flex h-6 items-center rounded-md px-2 text-xs leading-none font-bold whitespace-nowrap uppercase",
                className,
            )}
        >
            {children}
        </span>
    );
}

function EndpointBadge({
    colors,
    label,
    placement,
    scale,
}: {
    colors: readonly string[];
    label: string;
    placement: EndpointBadgePlacement;
    scale: number;
}) {
    return (
        <MarkerContent className="pointer-events-none">
            <div
                className="flex h-6 items-center drop-shadow-sm"
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: placement === "left"
                        ? "calc(100% - 12px) center"
                        : "12px center",
                }}
            >
                {placement === "right" && <EndpointDotCap colors={colors} />}
                <MarkerLabel
                    className={cn(
                        placement === "left"
                            ? "-mr-3 rounded-r-none pr-3.5"
                            : "-ml-3 rounded-l-none pl-3.5",
                    )}
                >
                    {label}
                </MarkerLabel>
                {placement === "left" && <EndpointDotCap colors={colors} />}
            </div>
        </MarkerContent>
    );
}

function StaticLocationBadge({
    colors,
    label,
    scale,
}: {
    colors: readonly string[];
    label: string;
    scale: number;
}) {
    return (
        <MarkerContent className="pointer-events-none">
            <div
                className="relative flex flex-col items-center drop-shadow-sm"
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "center calc(100% - 6px)",
                }}
            >
                <MarkerLabel>{label}</MarkerLabel>
                <svg
                    viewBox="0 0 16 12"
                    className="text-jet-lag-navy-blue dark:text-challenge-card-paper -mt-px mb-0.5 h-3 w-4"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path
                        d="M0 0h16L9.8 9.4Q8 11.8 6.2 9.4Z"
                        fill="currentColor"
                    />
                </svg>
                <EndpointDotCap colors={colors} compact />
            </div>
        </MarkerContent>
    );
}

/** Splits a transit label ("Lucerne → Andermatt") into its origin and destination names. */
function legEndpointNames(label: string): [origin: string, destination: string] {
    const [origin = label, destination = label] = label.split("→").map((part) => part.trim());
    return [origin, destination];
}

export function SeekersTrackerOverlay({
    currentHider,
    state,
}: {
    currentHider: PlayerId;
    state: SeekersTrackerState;
}) {
    const seekerColors = useMemo(
        () => PLAYER_ORDER
            .filter((player) => player !== currentHider)
            .map((player) => PLAYER_MAP_COLORS[player]),
        [currentHider],
    );
    const dashArray = useDashFrame(state.kind === "transit");
    const zoom = useMapZoom();
    const transitEndpoints = state.kind === "transit"
        ? [state.route[0]!, state.route.at(-1)!] as const
        : null;
    const routeLabelMinimumZoom = useMemo(
        () => state.kind === "transit"
            ? minimumRouteLabelZoom(state.route[0]!, state.route.at(-1)!)
            : Number.POSITIVE_INFINITY,
        [state],
    );
    const showRouteLabels = zoom >= routeLabelMinimumZoom;
    const markerScale = routeMarkerScale(zoom);
    const originLabelPlacement = transitEndpoints
        && transitEndpoints[0][0] <= transitEndpoints[1][0]
        ? "left"
        : "right";
    const destinationLabelPlacement = originLabelPlacement === "left" ? "right" : "left";

    return (
        <>
            <div
                className="bg-jet-lag-navy-blue/90 text-challenge-card-paper pointer-events-none absolute top-3 left-3 z-10 rounded-sm px-2.5 py-2 shadow-lg backdrop-blur-xs"
                aria-live="polite"
            >
                <p className="font-display text-[0.625rem] leading-none font-bold tracking-wide uppercase">
                    Seekers
                </p>
                <p className="font-heading mt-1 text-sm leading-none font-bold uppercase">
                    {state.label}
                </p>
            </div>

            {state.kind === "point" ? (
                <MapMarker
                    longitude={state.coordinate[0]}
                    latitude={state.coordinate[1]}
                    anchor="bottom"
                    offset={[0, 6]}
                >
                    <StaticLocationBadge
                        colors={seekerColors}
                        label={state.label}
                        scale={markerScale}
                    />
                </MapMarker>
            ) : (
                <>
                    <MapRoute
                        id={`seekers-route-${state.id}`}
                        coordinates={state.route}
                        color={seekerColors[0] ?? MAPLIBRE_COLORS.jetLagGreen}
                        width={7}
                        opacity={0.95}
                        interactive={false}
                    />
                    <MapRoute
                        id={`seekers-route-dashes-${state.id}`}
                        coordinates={state.route}
                        color={seekerColors[1] ?? MAPLIBRE_COLORS.jetLagYellow}
                        width={3.5}
                        opacity={1}
                        dashArray={dashArray}
                        lineCap="butt"
                        interactive={false}
                    />
                    <MapMarker
                        longitude={state.route[0]![0]}
                        latitude={state.route[0]![1]}
                        anchor={originLabelPlacement === "left" ? "right" : "left"}
                        offset={showRouteLabels
                            ? [originLabelPlacement === "left" ? 12 : -12, 0]
                            : [originLabelPlacement === "left" ? 8 : -8, 0]}
                    >
                        {showRouteLabels ? (
                            <EndpointBadge
                                colors={seekerColors}
                                label={legEndpointNames(state.label)[0]}
                                placement={originLabelPlacement}
                                scale={markerScale}
                            />
                        ) : (
                            <EndpointDot
                                colors={seekerColors}
                                label={legEndpointNames(state.label)[0]}
                                scale={markerScale}
                            />
                        )}
                    </MapMarker>
                    <MapMarker
                        longitude={state.route.at(-1)![0]}
                        latitude={state.route.at(-1)![1]}
                        anchor={destinationLabelPlacement === "left" ? "right" : "left"}
                        offset={showRouteLabels
                            ? [destinationLabelPlacement === "left" ? 12 : -12, 0]
                            : [destinationLabelPlacement === "left" ? 8 : -8, 0]}
                    >
                        {showRouteLabels ? (
                            <EndpointBadge
                                colors={seekerColors}
                                label={legEndpointNames(state.label)[1]}
                                placement={destinationLabelPlacement}
                                scale={markerScale}
                            />
                        ) : (
                            <EndpointDot
                                colors={seekerColors}
                                label={legEndpointNames(state.label)[1]}
                                scale={markerScale}
                            />
                        )}
                    </MapMarker>
                    {state.waypoints.map((waypoint) => (
                        <MapMarker
                            key={waypoint.label}
                            longitude={waypoint.coordinate[0]}
                            latitude={waypoint.coordinate[1]}
                            anchor="left"
                            offset={showRouteLabels ? [-12, 0] : [-8, 0]}
                        >
                            {showRouteLabels ? (
                                <EndpointBadge
                                    colors={seekerColors}
                                    label={waypoint.label}
                                    placement="right"
                                    scale={markerScale}
                                />
                            ) : (
                                <EndpointDot
                                    colors={seekerColors}
                                    label={waypoint.label}
                                    scale={markerScale}
                                />
                            )}
                        </MapMarker>
                    ))}
                </>
            )}
        </>
    );
}
