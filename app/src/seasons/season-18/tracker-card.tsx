"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
    FlightRoute,
    generateArcCoordinates,
    resolveAirport,
} from "@/components/ui/flight";
import {
    Map,
    MapControls,
    MapMarker,
    MapRoute,
    MarkerContent,
    useMap,
} from "@/components/ui/map";
import { cn } from "@/lib/utils";

import {
    seasonEighteenTeamIds,
    seasonEighteenTeams,
} from "./team-data";
import {
    clampTrackerTime,
    cropPath,
    getPointAlongPath,
    resolveTrackerInterval,
    resolveTrackerProgress,
    type Coordinate,
    type ResolvedFlightTrajectory,
    type ResolvedGroundTrajectory,
    type ResolvedEndpointLabel,
    type TrackerInterval,
} from "./tracker-data";

type TrackerCardProps = {
    episodeSlug: string;
    currentTime: number;
    className?: string;
};

type MapStage = {
    center: Coordinate;
    zoom: number;
};

type TrackerTrajectory = (
    | ResolvedGroundTrajectory
    | ResolvedFlightTrajectory
) & {
    positionProgress: number;
    revealProgressOnly: boolean;
    originLabel: string;
    destinationLabel: string;
    destinationVisible: boolean;
};

type ResolvedTeamState = {
    interval: TrackerInterval;
    event: {
        id: string;
        team: (typeof TEAM_ORDER)[number];
        status: TrackerInterval["status"];
    };
    position: Coordinate;
    trajectory: TrackerTrajectory | null;
    trajectoryCoordinates: readonly Coordinate[];
    originCoordinate: Coordinate | null;
    destinationCoordinate: Coordinate | null;
    waypointLabels: readonly ResolvedEndpointLabel[];
};

type ResolvedTrajectory = Pick<
    ResolvedTeamState,
    | "trajectoryCoordinates"
    | "originCoordinate"
    | "destinationCoordinate"
> & {
    position: Coordinate | null;
};

type TeamFocusRequest = {
    state: ResolvedTeamState;
    requestId: number;
};

const TEAM_ORDER = seasonEighteenTeamIds;
const PIN_PROXIMITY_PX = 72;
const PIN_TILT_DEGREES = 8;
const LABEL_MIN_ZOOM = 8;
const CAMERA_INTERACTION_GRACE_MS = 15_000;
const TRACKER_UPDATE_INTERVAL_SECONDS = 0.5;
const PIN_POSITION_TRANSITION_MS = 500;

const MAP_STAGES = {
    newYork: { center: [-73.92, 40.76] as Coordinate, zoom: 10.7 },
    flights: { center: [-83.7, 39.3] as Coordinate, zoom: 4.25 },
    split: { center: [-87.96, 38.54] as Coordinate, zoom: 5 },
    episodeTwoRoadtrip: { center: [-83.5, 38.5] as Coordinate, zoom: 3.65 },
    episodeTwoFlights: { center: [-80.5, 39.5] as Coordinate, zoom: 3.85 },
    episodeThree: { center: [-80.8, 39.7] as Coordinate, zoom: 3.7 },
    episodeFour: { center: [-87.2, 40.3] as Coordinate, zoom: 3.15 },
    episodeFive: { center: [-84.8, 42.2] as Coordinate, zoom: 3.1 },
} satisfies Record<string, MapStage>;

function getMapStage(episodeSlug: string, currentTime: number): MapStage {
    if (episodeSlug === "episode-5") return MAP_STAGES.episodeFive;
    if (episodeSlug === "episode-4") return MAP_STAGES.episodeFour;
    if (episodeSlug === "episode-3") return MAP_STAGES.episodeThree;

    if (episodeSlug === "episode-2") {
        return currentTime < 30 * 60 + 13
            ? MAP_STAGES.episodeTwoRoadtrip
            : MAP_STAGES.episodeTwoFlights;
    }

    if (currentTime < 10 * 60 + 43) {
        return MAP_STAGES.newYork;
    }

    if (currentTime < 15 * 60 + 59) {
        return MAP_STAGES.flights;
    }

    return MAP_STAGES.split;
}

function TrackerCamera({
    stage,
    states,
}: {
    stage: MapStage;
    states: ResolvedTeamState[];
}) {
    const { map } = useMap();
    const lastInteractionAt = useRef(Number.NEGATIVE_INFINITY);
    const lastHandledUpdate = useRef<string | null>(null);
    const previousStage = useRef<string | null>(null);
    const previousStates = useRef<ResolvedTeamState[] | null>(null);
    const stageKey = `${stage.center.join(",")}:${stage.zoom}`;
    const cameraUpdate = [
        stageKey,
        ...states.map((state) => state.interval.id),
    ].join(":");

    useEffect(() => {
        if (!map) return;

        const container = map.getContainer();
        const markInteraction = () => {
            lastInteractionAt.current = Date.now();
        };
        const markPointerInteraction = (event: PointerEvent) => {
            if (event.buttons !== 0) markInteraction();
        };

        container.addEventListener("pointerdown", markInteraction, true);
        container.addEventListener("pointermove", markPointerInteraction, true);
        container.addEventListener("wheel", markInteraction, { capture: true, passive: true });
        container.addEventListener("touchstart", markInteraction, { capture: true, passive: true });
        container.addEventListener("keydown", markInteraction, true);

        return () => {
            container.removeEventListener("pointerdown", markInteraction, true);
            container.removeEventListener("pointermove", markPointerInteraction, true);
            container.removeEventListener("wheel", markInteraction, true);
            container.removeEventListener("touchstart", markInteraction, true);
            container.removeEventListener("keydown", markInteraction, true);
        };
    }, [map]);

    useEffect(() => {
        if (!map || lastHandledUpdate.current === cameraUpdate) return;

        const priorStates = previousStates.current;
        const stageChanged = previousStage.current !== null
            && previousStage.current !== stageKey;
        const changedStates = states.flatMap((state, index) => {
            const previousState = priorStates?.[index];
            return previousState?.interval.id === state.interval.id
                ? []
                : [{ state, previousState }];
        });

        // Consume each discrete tracker update once. If user interaction or an
        // in-progress movement suppresses it, later position ticks must not
        // replay the update after the grace period expires.
        lastHandledUpdate.current = cameraUpdate;
        previousStage.current = stageKey;
        previousStates.current = states;

        // The Map itself already receives the correct initial center and zoom.
        if (!priorStates) return;

        if (map.isMoving()) return;

        if (
            Date.now() - lastInteractionAt.current
            < CAMERA_INTERACTION_GRACE_MS
        ) {
            return;
        }

        if (stageChanged) {
            map.easeTo({
                center: stage.center,
                zoom: stage.zoom,
                duration: 900,
            });
            return;
        }

        const visibleBounds = map.getBounds();
        const coordinatesMatch = (
            left: Coordinate | null,
            right: Coordinate | null,
        ) => left?.[0] === right?.[0] && left?.[1] === right?.[1];
        const trackerCoordinates = changedStates.flatMap(({ state, previousState }) => [
            state.position,
            ...(
                state.originCoordinate
                && !coordinatesMatch(state.originCoordinate, previousState?.originCoordinate ?? null)
                    ? [state.originCoordinate]
                    : []
            ),
            ...(
                state.destinationCoordinate
                && !coordinatesMatch(
                    state.destinationCoordinate,
                    previousState?.destinationCoordinate ?? null,
                )
                    ? [state.destinationCoordinate]
                    : []
            ),
        ]);

        if (trackerCoordinates.every((coordinate) => visibleBounds.contains(coordinate))) {
            return;
        }

        const currentCenter = map.getCenter().toArray() as Coordinate;
        const cameraCoordinates = [currentCenter, ...trackerCoordinates];
        const bounds = cameraCoordinates.slice(1).reduce<[Coordinate, Coordinate]>(
            ([southwest, northeast], coordinate) => [
                [
                    Math.min(southwest[0], coordinate[0]),
                    Math.min(southwest[1], coordinate[1]),
                ],
                [
                    Math.max(northeast[0], coordinate[0]),
                    Math.max(northeast[1], coordinate[1]),
                ],
            ],
            [currentCenter, currentCenter],
        );

        map.fitBounds(bounds, {
            padding: 56,
            maxZoom: map.getZoom(),
            duration: 900,
        });
    }, [cameraUpdate, map, stage, stageKey, states]);

    return null;
}

function TeamFocusController({
    request,
}: {
    request: TeamFocusRequest | null;
}) {
    const { map } = useMap();

    useEffect(() => {
        if (!map || !request) return;

        const { state } = request;
        map.stop();

        if (!state.trajectory) {
            map.easeTo({
                center: state.position,
                zoom: Math.max(map.getZoom(), 12),
                duration: 900,
            });
            return;
        }

        const coordinates = state.trajectory.kind === "flight"
            ? generateArcCoordinates(
                resolveAirport(state.trajectory.from),
                resolveAirport(state.trajectory.to),
            )
            : state.trajectory.coordinates;
        const [firstCoordinate, ...remainingCoordinates] = coordinates;

        if (!firstCoordinate) return;

        const bounds = remainingCoordinates.reduce<[Coordinate, Coordinate]>(
            ([southwest, northeast], coordinate) => [
                [
                    Math.min(southwest[0], coordinate[0]),
                    Math.min(southwest[1], coordinate[1]),
                ],
                [
                    Math.max(northeast[0], coordinate[0]),
                    Math.max(northeast[1], coordinate[1]),
                ],
            ],
            [firstCoordinate, firstCoordinate],
        );

        map.fitBounds(bounds, {
            padding: { top: 72, right: 56, bottom: 72, left: 56 },
            maxZoom: 12,
            duration: 900,
        });
    }, [map, request]);

    return null;
}

function resolveTrajectory(
    trajectory: TrackerTrajectory | null,
): ResolvedTrajectory {
    if (!trajectory) {
        return {
            position: null,
            trajectoryCoordinates: [],
            originCoordinate: null,
            destinationCoordinate: null,
        };
    }

    const fullCoordinates = trajectory.kind === "flight"
        ? generateArcCoordinates(
            resolveAirport(trajectory.from),
            resolveAirport(trajectory.to),
        )
        : trajectory.coordinates;
    const position = getPointAlongPath(fullCoordinates, trajectory.positionProgress);
    const trajectoryCoordinates = trajectory.revealProgressOnly
        ? cropPath(fullCoordinates, trajectory.positionProgress)
        : fullCoordinates;

    return {
        position,
        trajectoryCoordinates,
        originCoordinate: fullCoordinates[0],
        destinationCoordinate: trajectory.destinationVisible === false
            ? null
            : fullCoordinates[fullCoordinates.length - 1],
    };
}

function trackerIntervalFallbackPosition(interval: TrackerInterval): Coordinate {
    if (interval.kind === "stationary") return interval.coordinate;
    if (interval.kind === "ground") return interval.trajectory.coordinates[0];
    return resolveAirport(interval.trajectory.from);
}

function getTeamPinRotations(
    states: ResolvedTeamState[],
    project: (coordinate: Coordinate) => { x: number; y: number },
) {
    const rotations = new globalThis.Map<string, number>();

    states.forEach((state) => rotations.set(state.event.team, 0));

    for (let leftIndex = 0; leftIndex < states.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < states.length; rightIndex += 1) {
            const leftState = states[leftIndex];
            const rightState = states[rightIndex];
            const leftPoint = project(leftState.position);
            const rightPoint = project(rightState.position);

            if (Math.hypot(leftPoint.x - rightPoint.x, leftPoint.y - rightPoint.y) > PIN_PROXIMITY_PX) {
                continue;
            }

            const westernState = leftState.position[0] <= rightState.position[0]
                ? leftState
                : rightState;
            const easternState = westernState === leftState ? rightState : leftState;

            rotations.set(westernState.event.team, -PIN_TILT_DEGREES);
            rotations.set(easternState.event.team, PIN_TILT_DEGREES);
        }
    }

    return rotations;
}

function TeamPin({
    state,
    rotation,
    showLabel,
}: {
    state: ResolvedTeamState;
    rotation: number;
    showLabel: boolean;
}) {
    const team = seasonEighteenTeams[state.event.team];
    const teamIndex = TEAM_ORDER.indexOf(state.event.team);

    return (
        <>
            <MapMarker
                longitude={state.position[0]}
                latitude={state.position[1]}
                positionTransitionDuration={PIN_POSITION_TRANSITION_MS}
                anchor="bottom"
            >
                <MarkerContent>
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 56 68"
                        className="h-18 w-14 overflow-visible drop-shadow-[0_3px_3px_color-mix(in_srgb,var(--color-foreground)_30%,transparent)]"
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transformOrigin: "50% 100%",
                            transition: "transform 250ms ease-out",
                        }}
                    >
                        <path
                            d="M28 1C13.09 1 1 13.09 1 28c0 12.63 8.68 23.23 20.4 26.17L28 62l6.6-7.83C46.32 51.23 55 40.63 55 28 55 13.09 42.91 1 28 1Z"
                            fill="var(--color-muted)"
                            stroke="var(--color-paper)"
                            strokeWidth="2"
                        />
                        <circle cx="28" cy="28" r="22" fill={team.color} />
                        <circle cx="28" cy="68" r="7" fill="var(--color-paper)" />
                        <circle
                            cx="28"
                            cy="68"
                            r="5"
                            fill={team.color}
                            stroke="var(--color-muted)"
                            strokeWidth="2"
                        />
                    </svg>
                </MarkerContent>
            </MapMarker>
            {showLabel && !state.trajectory ? (
                <MapMarker
                    longitude={state.position[0]}
                    latitude={state.position[1]}
                    positionTransitionDuration={PIN_POSITION_TRANSITION_MS}
                    anchor={teamIndex === 0 ? "right" : "left"}
                    offset={[teamIndex === 0 ? -12 : 12, 0]}
                >
                    <MarkerContent className="pointer-events-none z-30">
                        <div
                            className="w-max max-w-48 rounded-md border px-2 py-1 text-center font-sans text-xs font-semibold leading-tight text-card-foreground shadow-sm"
                            style={{
                                backgroundColor: `color-mix(in srgb, ${team.color} 28%, var(--color-card))`,
                                borderColor: `color-mix(in srgb, ${team.color} 58%, var(--color-border))`,
                            }}
                        >
                            {state.event.status.description}
                        </div>
                    </MarkerContent>
                </MapMarker>
            ) : null}
        </>
    );
}

function TeamPins({
    states,
    showLabels,
}: {
    states: ResolvedTeamState[];
    showLabels: boolean;
}) {
    const { map, isLoaded } = useMap();
    const [cameraRevision, setCameraRevision] = useState(0);

    useEffect(() => {
        if (!map) return;

        const refreshRotations = () => setCameraRevision((revision) => revision + 1);
        map.on("moveend", refreshRotations);
        map.on("resize", refreshRotations);

        return () => {
            map.off("moveend", refreshRotations);
            map.off("resize", refreshRotations);
        };
    }, [map]);

    const rotations = useMemo(() => {
        if (!map || !isLoaded) return new globalThis.Map<string, number>();

        return getTeamPinRotations(states, (coordinate) => map.project(coordinate));
        // Recalculate after a map movement changes the screen-space distance.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cameraRevision, isLoaded, map, states]);

    return states.map((state) => (
        <TeamPin
            key={state.event.team}
            state={state}
            rotation={rotations.get(state.event.team) ?? 0}
            showLabel={showLabels}
        />
    ));
}

function TransitEndpointMarker({
    coordinate,
    states,
    label,
    showLabel,
}: {
    coordinate: Coordinate;
    states: ResolvedTeamState[];
    label: string;
    showLabel: boolean;
}) {
    const colors = states.map((state) =>
        seasonEighteenTeams[state.event.team].color);
    const markerColor = colors.length === 1
        ? colors[0]
        : `conic-gradient(${colors[0]} 0 50%, ${colors[1]} 50% 100%)`;
    const teamIds = new Set(states.map((state) => state.event.team));
    const labelColor = teamIds.size === 1 ? colors[0] : null;
    const labelRow = Math.min(...states.map((state) =>
        TEAM_ORDER.indexOf(state.event.team)));
    return (
        <>
            <MapMarker
                longitude={coordinate[0]}
                latitude={coordinate[1]}
                anchor="center"
            >
                <MarkerContent className="z-20">
                    <div
                        aria-hidden="true"
                        className="size-4 rounded-full border-2 border-paper shadow-md"
                        style={{ background: markerColor }}
                    />
                </MarkerContent>
            </MapMarker>
            {showLabel ? (
                <MapMarker
                    longitude={coordinate[0]}
                    latitude={coordinate[1]}
                    anchor={labelRow === 0 ? "bottom" : "top"}
                    offset={[0, labelRow === 0 ? -12 : 12]}
                >
                    <MarkerContent className="pointer-events-none z-20">
                        <div
                            className="w-max max-w-44 rounded-md border border-border bg-card px-2 py-1.5 text-center shadow-md"
                            style={labelColor ? {
                                backgroundColor: `color-mix(in srgb, ${labelColor} 28%, var(--color-card))`,
                                borderColor: `color-mix(in srgb, ${labelColor} 58%, var(--color-border))`,
                            } : undefined}
                        >
                            <p className="whitespace-normal wrap-break-word font-sans text-xs font-semibold leading-tight text-card-foreground">
                                {label}
                            </p>
                        </div>
                    </MarkerContent>
                </MapMarker>
            ) : null}
        </>
    );
}

function TransitEndpoints({
    states,
    showLabels,
}: {
    states: ResolvedTeamState[];
    showLabels: boolean;
}) {
    const endpoints = new globalThis.Map<string, {
        coordinate: Coordinate;
        states: ResolvedTeamState[];
        label: string;
    }>();

    states.forEach((state) => {
        if (
            !state.trajectory
            || !state.originCoordinate
        ) {
            return;
        }

        const additions = [
            {
                coordinate: state.originCoordinate,
                label: state.trajectory.originLabel,
            },
            ...(state.destinationCoordinate ? [{
                coordinate: state.destinationCoordinate,
                label: state.trajectory.destinationLabel,
            }] : []),
            ...state.waypointLabels.map((waypoint) => ({
                coordinate: waypoint.coordinate,
                label: waypoint.text,
            })),
        ];

        additions.forEach(({ coordinate, label }) => {
            const key = `${coordinate[0]},${coordinate[1]}:${label}`;
            const existing = endpoints.get(key);
            if (existing) {
                existing.states.push(state);
                return;
            }
            endpoints.set(key, {
                coordinate,
                states: [state],
                label,
            });
        });
    });

    return [...endpoints.entries()].map(([key, endpoint]) => (
        <TransitEndpointMarker
            key={key}
            coordinate={endpoint.coordinate}
            states={endpoint.states}
            label={endpoint.label}
            showLabel={showLabels}
        />
    ));
}

function TrackerMarkers({ states }: { states: ResolvedTeamState[] }) {
    const { map, isLoaded } = useMap();
    const [showLabels, setShowLabels] = useState(false);

    useEffect(() => {
        if (!map || !isLoaded) return;

        const updateLabelVisibility = () => {
            setShowLabels(map.getZoom() >= LABEL_MIN_ZOOM);
        };

        updateLabelVisibility();
        map.on("zoom", updateLabelVisibility);

        return () => {
            map.off("zoom", updateLabelVisibility);
        };
    }, [isLoaded, map]);

    return (
        <>
            <TeamPins states={states} showLabels={showLabels} />
            <TransitEndpoints states={states} showLabels={showLabels} />
        </>
    );
}

type GroundTeamState = ResolvedTeamState & {
    trajectory: Extract<TrackerTrajectory, { kind: "ground" }>;
};

function getSharedRoutePrefix(
    first: readonly Coordinate[],
    second: readonly Coordinate[],
) {
    const length = Math.min(first.length, second.length);
    let sharedLength = 0;

    while (
        sharedLength < length
        && first[sharedLength][0] === second[sharedLength][0]
        && first[sharedLength][1] === second[sharedLength][1]
    ) {
        sharedLength += 1;
    }

    return first.slice(0, sharedLength);
}

function TrajectoryRoutes({ states }: { states: ResolvedTeamState[] }) {
    const groundStates = states.filter((state): state is GroundTeamState =>
        state.trajectory?.kind === "ground"
        && state.trajectoryCoordinates.length >= 2);
    const sharedPrefix = groundStates.length === 2
        ? getSharedRoutePrefix(
            groundStates[0].trajectoryCoordinates,
            groundStates[1].trajectoryCoordinates,
        )
        : [];

    return (
        <>
            {states.map((state) => {
                if (state.trajectory?.kind !== "flight") return null;
                const team = seasonEighteenTeams[state.event.team];

                return (
                    <FlightRoute
                        key={`trajectory-${state.event.team}`}
                        from={state.trajectory.from}
                        to={state.trajectory.to}
                        color={team.mapColor}
                        width={3}
                        opacity={0.8}
                        showAirports={false}
                        interactive={false}
                    />
                );
            })}

            {sharedPrefix.length >= 2 ? (
                <>
                    <MapRoute
                        id={`trajectory-${groundStates[0].event.team}`}
                        coordinates={groundStates[0].trajectoryCoordinates}
                        color={seasonEighteenTeams[groundStates[0].event.team].mapColor}
                        width={4}
                        opacity={0.82}
                    />
                    {groundStates[1].trajectoryCoordinates.length > sharedPrefix.length ? (
                        <MapRoute
                            id={`trajectory-${groundStates[1].event.team}-unique`}
                            coordinates={groundStates[1].trajectoryCoordinates.slice(sharedPrefix.length - 1)}
                            color={seasonEighteenTeams[groundStates[1].event.team].mapColor}
                            width={4}
                            opacity={0.82}
                        />
                    ) : null}
                    <MapRoute
                        id="trajectory-shared-alternating"
                        coordinates={sharedPrefix}
                        color={seasonEighteenTeams[groundStates[1].event.team].mapColor}
                        width={4}
                        opacity={0.82}
                        dashArray={[1.5, 1.5]}
                        lineCap="butt"
                    />
                </>
            ) : groundStates.map((state) => (
                <MapRoute
                    key={`trajectory-${state.event.team}`}
                    coordinates={state.trajectoryCoordinates}
                    color={seasonEighteenTeams[state.event.team].mapColor}
                    width={4}
                    opacity={0.82}
                />
            ))}
        </>
    );
}

function TeamStatus({
    state,
    onFocus,
}: {
    state: ResolvedTeamState;
    onFocus: () => void;
}) {
    const team = seasonEighteenTeams[state.event.team];

    return (
        <button
            type="button"
            onClick={onFocus}
            aria-label={`Focus map on ${team.name}`}
            className="flex min-w-0 flex-1 cursor-pointer items-start px-5 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-7"
        >
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <span
                        aria-hidden="true"
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: team.color }}
                    />
                    <p className="wrap-break-word font-heading text-lg font-bold uppercase leading-none text-card-foreground">
                        {team.name}
                    </p>
                </div>
                <p className="mt-2 whitespace-normal wrap-break-word font-sans text-base font-semibold leading-snug text-card-foreground">
                    {state.event.status.description}
                </p>
                <p className="mt-1 whitespace-normal wrap-break-word font-sans text-sm leading-snug text-muted-foreground">
                    {state.event.status.location}
                </p>
            </div>
        </button>
    );
}

export function TrackerCard({
    episodeSlug,
    currentTime,
    className,
}: TrackerCardProps) {
    const trackerTime = clampTrackerTime(
        episodeSlug,
        Math.floor(currentTime / TRACKER_UPDATE_INTERVAL_SECONDS)
            * TRACKER_UPDATE_INTERVAL_SECONDS,
    );
    const mapStage = getMapStage(episodeSlug, trackerTime);
    const teamStates = useMemo(() => TEAM_ORDER.map((team) => {
        const interval = resolveTrackerInterval(episodeSlug, trackerTime, team);
        const trajectory = interval.kind === "stationary"
            ? null
            : {
                ...interval.trajectory,
                positionProgress: resolveTrackerProgress(interval, trackerTime),
                revealProgressOnly: interval.display.revealPath === "traveled",
                originLabel: interval.display.originLabel?.text ?? "",
                destinationLabel: interval.display.destinationLabel?.text ?? "",
                destinationVisible: interval.display.destinationLabel !== null,
            } satisfies TrackerTrajectory;
        const resolved = resolveTrajectory(trajectory);
        const stationaryPosition = interval.kind === "stationary"
            ? interval.coordinate
            : null;

        return {
            interval,
            event: {
                id: interval.eventId,
                team,
                status: interval.status,
            },
            trajectory,
            position: resolved.position ?? stationaryPosition
                ?? trackerIntervalFallbackPosition(interval),
            trajectoryCoordinates: resolved.trajectoryCoordinates,
            originCoordinate: resolved.originCoordinate,
            destinationCoordinate: resolved.destinationCoordinate,
            waypointLabels: interval.kind === "stationary"
                ? []
                : interval.display.waypointLabels,
        } satisfies ResolvedTeamState;
    }), [episodeSlug, trackerTime]);
    const [focusRequest, setFocusRequest] = useState<TeamFocusRequest | null>(null);

    const focusTeam = (state: ResolvedTeamState) => {
        setFocusRequest((currentRequest) => ({
            state,
            requestId: (currentRequest?.requestId ?? 0) + 1,
        }));
    };

    return (
        <section className={cn("overflow-hidden rounded-2xl border border-border bg-card", className)}>
            <div className="border-b border-border px-5 py-4 sm:px-7">
                <h2 className="font-heading text-3xl font-bold uppercase tracking-tight text-card-foreground">
                    Tracker
                </h2>
            </div>

            <div className="relative h-124 min-h-96 sm:h-144">
                <Map
                    center={mapStage.center}
                    zoom={mapStage.zoom}
                    minZoom={3}
                    maxZoom={16}
                    attributionControl={false}
                >
                    <TrackerCamera
                        stage={mapStage}
                        states={teamStates}
                    />
                    <TeamFocusController request={focusRequest} />
                    <MapControls
                        position="bottom-right"
                        showCompass={false}
                        resetView={mapStage}
                    />

                    <TrajectoryRoutes states={teamStates} />

                    <TrackerMarkers states={teamStates} />

                </Map>
            </div>

            <div className="divide-y divide-border border-t border-border lg:flex lg:divide-x lg:divide-y-0">
                {teamStates.map((state) => (
                    <TeamStatus
                        key={state.event.team}
                        state={state}
                        onFocus={() => focusTeam(state)}
                    />
                ))}
            </div>
        </section>
    );
}
