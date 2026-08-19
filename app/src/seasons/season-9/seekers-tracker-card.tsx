"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
    Map,
    MapControls,
    MapMarker,
    MapRoute,
    MarkerContent,
    useMap,
} from "@/components/ui/map";
import { MAPLIBRE_COLORS } from "@/components/ui/map-colors";
import { getSeasonNineState, type PlayerId } from "./timeline-data";
import {
    getSeekersTrackerState,
    type TrackerCoordinate,
} from "./seekers-tracker-data";

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

/**
 * Teardrop pin outline: a round head, sides tapering down to a tip that is itself
 * rounded off by a small arc rather than meeting in a sharp corner.
 */
const PIN_PATH =
    "M3 20a18 18 0 1 1 36 0c0 10.4-9.6 19.4-15.6 29.4a1.7 1.7 0 0 1-2.8 0C14.6 39.4 3 30.4 3 20Z";

/** Below this zoom the pin collapses to a dot; at or above it renders at full size. */
const PIN_FULL_SIZE_ZOOM = 10;
const PIN_DOT_ZOOM = 7.5;
const PIN_MINIMUM_SCALE = 0.62;

/** Tracks the map's zoom so markers can shrink as the viewport widens. */
function useMapZoom() {
    const { map } = useMap();
    const [zoom, setZoom] = useState(() => map?.getZoom() ?? PIN_FULL_SIZE_ZOOM);

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

/** Teardrop pin split down the middle into the two seeker colours. */
function SeekersPin({
    colors,
    label,
}: {
    colors: readonly string[];
    label: string;
}) {
    const clipId = useId();
    const zoom = useMapZoom();
    const [leftColor = MAPLIBRE_COLORS.jetLagGreen, rightColor = leftColor] = colors;

    if (zoom < PIN_DOT_ZOOM) {
        // The marker is anchored at the pin's tip, so push the dot down onto it.
        return <EndpointDot colors={colors} label={label} className="translate-y-1/2" />;
    }

    const progress = Math.min(
        1,
        (zoom - PIN_DOT_ZOOM) / (PIN_FULL_SIZE_ZOOM - PIN_DOT_ZOOM),
    );
    const scale = PIN_MINIMUM_SCALE + progress * (1 - PIN_MINIMUM_SCALE);

    return (
        <MarkerContent className="pointer-events-none">
            <div className="relative flex flex-col items-center">
                <svg
                    width={42 * scale}
                    height={52 * scale}
                    viewBox="0 0 42 52"
                    className="drop-shadow-lg"
                    aria-hidden="true"
                >
                    <clipPath id={clipId}>
                        <path d={PIN_PATH} />
                    </clipPath>
                    <g clipPath={`url(#${clipId})`}>
                        <rect x="0" y="0" width="21" height="52" fill={leftColor} />
                        <rect x="21" y="0" width="21" height="52" fill={rightColor} />
                    </g>
                    <path
                        d={PIN_PATH}
                        fill="none"
                        stroke={MAPLIBRE_COLORS.jetLagNavyBlue}
                        strokeWidth="3.5"
                    />
                </svg>

                <MarkerLabelChip>{label}</MarkerLabelChip>
            </div>
        </MarkerContent>
    );
}

function MarkerLabelChip({ children }: { children: string }) {
    return (
        <span className="bg-jet-lag-navy-blue text-challenge-card-paper font-heading absolute top-full mt-1 rounded-sm px-2 py-1 text-xs leading-none font-bold whitespace-nowrap uppercase">
            {children}
        </span>
    );
}

/**
 * Small two-tone dot: marks either end of a leg while the seekers are in transit,
 * and stands in for the pin once the map is zoomed far enough out.
 */
function EndpointDot({
    colors,
    label,
    className,
}: {
    colors: readonly string[];
    label: string;
    className?: string;
}) {
    const [leftColor = MAPLIBRE_COLORS.jetLagGreen, rightColor = leftColor] = colors;

    return (
        <MarkerContent className={`pointer-events-none ${className ?? ""}`}>
            <div className="relative flex flex-col items-center">
                <span
                    className="border-jet-lag-navy-blue block size-4 rounded-full border-2 shadow-lg"
                    style={{
                        backgroundImage:
                            `linear-gradient(90deg, ${leftColor} 0 50%, ${rightColor} 50% 100%)`,
                    }}
                />
                <MarkerLabelChip>{label}</MarkerLabelChip>
            </div>
        </MarkerContent>
    );
}

/** Splits a transit label ("Lucerne → Andermatt") into its origin and destination names. */
function legEndpointNames(label: string): [origin: string, destination: string] {
    const [origin = label, destination = label] = label.split("→").map((part) => part.trim());
    return [origin, destination];
}

/**
 * Minimum padding around the fitted bounds, in degrees. A stationary pin gets a
 * wide frame so the surrounding town is legible, but a route needs only a small
 * one: on short legs the floor, not `maxZoom`, is what decides how close the map
 * gets, and too generous a floor leaves the two endpoint labels overlapping.
 */
const POINT_PADDING = { longitude: 0.025, latitude: 0.018 } as const;
const ROUTE_PADDING = { longitude: 0.004, latitude: 0.003 } as const;

function boundsAround(
    coordinates: readonly TrackerCoordinate[],
): [[number, number], [number, number]] {
    const longitudes = coordinates.map(([longitude]) => longitude);
    const latitudes = coordinates.map(([, latitude]) => latitude);
    const minimumLongitude = Math.min(...longitudes);
    const maximumLongitude = Math.max(...longitudes);
    const minimumLatitude = Math.min(...latitudes);
    const maximumLatitude = Math.max(...latitudes);
    const minimum = coordinates.length > 1 ? ROUTE_PADDING : POINT_PADDING;
    const longitudePadding = Math.max(
        minimum.longitude,
        (maximumLongitude - minimumLongitude) * 0.18,
    );
    const latitudePadding = Math.max(
        minimum.latitude,
        (maximumLatitude - minimumLatitude) * 0.18,
    );

    return [
        [minimumLongitude - longitudePadding, minimumLatitude - latitudePadding],
        [maximumLongitude + longitudePadding, maximumLatitude + latitudePadding],
    ];
}

export function SeekersTrackerCard({
    episodeSlug,
    currentTime,
}: {
    episodeSlug: string;
    currentTime: number;
}) {
    const state = useMemo(
        () => getSeekersTrackerState(episodeSlug, currentTime),
        [episodeSlug, currentTime],
    );
    const fullRoute = useMemo(
        () => state.kind === "transit" ? state.route : [state.coordinate],
        [state],
    );
    const bounds = useMemo(() => boundsAround(fullRoute), [fullRoute]);
    const seekerColors = useMemo(() => {
        const { currentHider } = getSeasonNineState(episodeSlug, currentTime);
        return PLAYER_ORDER
            .filter((player) => player !== currentHider)
            .map((player) => PLAYER_MAP_COLORS[player]);
    }, [episodeSlug, currentTime]);
    const dashArray = useDashFrame(state.kind === "transit");

    return (
        <section
            className="border-paper/25 bg-panel w-full overflow-hidden rounded-lg border"
            aria-labelledby="season-nine-seekers-tracker-title"
        >
            <header className="border-paper/20 border-b p-6">
                <h2
                    id="season-nine-seekers-tracker-title"
                    className="font-heading text-3xl leading-none font-bold tracking-tight uppercase"
                >
                    Seekers Tracker
                </h2>
            </header>

            <div className="bg-map-canvas relative h-64">
                <Map
                    key={state.id}
                    bounds={bounds}
                    fitBoundsOptions={{ padding: 42, maxZoom: 15 }}
                    attributionControl={false}
                    dragRotate={false}
                    touchPitch={false}
                >
                    {state.kind === "point" ? (
                        <MapMarker
                            longitude={state.coordinate[0]}
                            latitude={state.coordinate[1]}
                            anchor="bottom"
                        >
                            <SeekersPin colors={seekerColors} label={state.label} />
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
                                anchor="center"
                            >
                                <EndpointDot
                                    colors={seekerColors}
                                    label={legEndpointNames(state.label)[0]}
                                />
                            </MapMarker>
                            <MapMarker
                                longitude={state.route.at(-1)![0]}
                                latitude={state.route.at(-1)![1]}
                                anchor="center"
                            >
                                <EndpointDot
                                    colors={seekerColors}
                                    label={legEndpointNames(state.label)[1]}
                                />
                            </MapMarker>
                        </>
                    )}
                    <MapControls showZoom={false} showLocate={false} />
                </Map>
            </div>

            <div className="border-paper/20 border-t px-5 py-4 sm:px-6">
                <p className="font-heading text-lg leading-tight font-bold uppercase">
                    {state.label}
                </p>
                <p className="text-card-meta mt-2 text-xs">
                    Rail geometry: {" "}
                    <a
                        className="hover:text-foreground underline underline-offset-2"
                        href="https://data.sbb.ch/explore/dataset/linie-mit-polygon/"
                        rel="noreferrer"
                        target="_blank"
                    >
                        SBB Open Data
                    </a>
                    {" · "}
                    <a
                        className="hover:text-foreground underline underline-offset-2"
                        href="https://www.openstreetmap.org/copyright"
                        rel="noreferrer"
                        target="_blank"
                    >
                        OpenStreetMap contributors
                    </a>
                </p>
            </div>
        </section>
    );
}
