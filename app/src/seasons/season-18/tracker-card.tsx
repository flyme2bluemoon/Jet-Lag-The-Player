"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

import {
    FlightRoute,
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
import {
    coordinatesAreColocated,
    coordinatesMatch,
    getAverageCoordinate,
    getCoordinateBounds,
    getEndpointLabelDirection,
    getEndpointLabelPlacement,
    getFullTrajectoryCoordinates,
    getTrajectoryDistanceMiles,
    getTrajectoryLabelMinZoom,
    LABEL_MAX_ZOOM,
    MAP_MIN_ZOOM,
    type EndpointLabelDirection,
    type EndpointLabelPlacement,
} from "./tracker-map-utils";

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
        markerLabel?: string;
    };
    position: Coordinate;
    trajectory: TrackerTrajectory | null;
    fullTrajectoryCoordinates: readonly Coordinate[];
    trajectoryCoordinates: readonly Coordinate[];
    originCoordinate: Coordinate | null;
    destinationCoordinate: Coordinate | null;
    waypointLabels: readonly ResolvedEndpointLabel[];
};

type ResolvedTrajectory = Pick<
    ResolvedTeamState,
    | "fullTrajectoryCoordinates"
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

type TransitEndpoint = {
    key: string;
    coordinate: Coordinate;
    states: ResolvedTeamState[];
    label: string;
    labelDirections: EndpointLabelDirection[];
    minZoom: number;
};

const TEAM_ORDER = seasonEighteenTeamIds;
const PIN_PROXIMITY_PX = 72;
const PIN_TILT_DEGREES = 8;
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
    finale: { center: [-74.7, 39.7] as Coordinate, zoom: 3.9 },
} satisfies Record<string, MapStage>;

function getMapStage(episodeSlug: string, currentTime: number): MapStage {
    if (episodeSlug === "finale") return MAP_STAGES.finale;
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

function getUniqueTeamStates(states: readonly ResolvedTeamState[]) {
    const byTeam = new globalThis.Map(
        states.map((state) => [state.event.team, state]),
    );

    return TEAM_ORDER.flatMap((team) => {
        const state = byTeam.get(team);
        return state ? [state] : [];
    });
}

function getTeamColors(states: readonly ResolvedTeamState[]) {
    return states.map((state) =>
        seasonEighteenTeams[state.event.team].color);
}

function getStationaryLabel(state: ResolvedTeamState) {
    return state.event.markerLabel ?? state.event.status.description;
}

function endpointMatchesStationaryState(
    endpoint: TransitEndpoint,
    state: ResolvedTeamState,
) {
    return !state.trajectory
        && endpoint.label === getStationaryLabel(state)
        && coordinatesAreColocated(endpoint.coordinate, state.position);
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
        const bounds = getCoordinateBounds([
            currentCenter,
            ...trackerCoordinates,
        ]);
        if (!bounds) return;

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

        const bounds = getCoordinateBounds(state.fullTrajectoryCoordinates);
        if (!bounds) return;

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
            fullTrajectoryCoordinates: [],
            trajectoryCoordinates: [],
            originCoordinate: null,
            destinationCoordinate: null,
        };
    }

    const fullCoordinates = getFullTrajectoryCoordinates(trajectory);
    const position = getPointAlongPath(fullCoordinates, trajectory.positionProgress);
    const trajectoryCoordinates = trajectory.revealProgressOnly
        ? cropPath(fullCoordinates, trajectory.positionProgress)
        : fullCoordinates;

    return {
        position,
        fullTrajectoryCoordinates: fullCoordinates,
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

function getColocatedStateGroups(states: ResolvedTeamState[]) {
    return states.reduce<ResolvedTeamState[][]>((groups, state) => {
        const existing = !state.trajectory
            ? groups.find((group) =>
                group.every((candidate) => !candidate.trajectory)
                && group.some((candidate) =>
                    coordinatesAreColocated(candidate.position, state.position)))
            : undefined;

        if (existing) {
            existing.push(state);
        } else {
            groups.push([state]);
        }
        return groups;
    }, []);
}

function TrackerMarkerLabel({
    coordinate,
    placement,
    color,
    positionTransitionDuration,
    contentClassName,
    className,
    children,
}: {
    coordinate: Coordinate;
    placement: EndpointLabelPlacement;
    color: string | null;
    positionTransitionDuration?: number;
    contentClassName?: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <MapMarker
            longitude={coordinate[0]}
            latitude={coordinate[1]}
            positionTransitionDuration={positionTransitionDuration}
            anchor={placement.anchor}
            offset={placement.offset}
        >
            <MarkerContent className={cn("pointer-events-none", contentClassName)}>
                <div
                    className={cn(
                        "w-max rounded-md border border-border bg-card text-center text-card-foreground",
                        className,
                    )}
                    style={color ? {
                        backgroundColor: `color-mix(in srgb, ${color} 28%, var(--color-card))`,
                        borderColor: `color-mix(in srgb, ${color} 58%, var(--color-border))`,
                    } : undefined}
                >
                    {children}
                </div>
            </MarkerContent>
        </MapMarker>
    );
}

function TeamPin({
    states,
    associatedEndpoints,
    rotation,
    showLabel,
}: {
    states: ResolvedTeamState[];
    associatedEndpoints: TransitEndpoint[];
    rotation: number;
    showLabel: boolean;
}) {
    const position = getAverageCoordinate(
        states.map((state) => state.position),
    );
    const stationaryStates = states.filter((state) => !state.trajectory);
    const markerStates = getUniqueTeamStates(states);
    const labelStates = getUniqueTeamStates([
        ...states,
        ...associatedEndpoints.flatMap((endpoint) => endpoint.states),
    ]);
    const colors = getTeamColors(markerStates);
    const gradientId = `tracker-pin-${markerStates.map((state) =>
        state.event.team).join("-")}`;
    const markerFill = colors.length === 1
        ? colors[0]
        : `url(#${gradientId})`;
    const labelState = stationaryStates[0];
    const labelTeamIndex = Math.min(...labelStates.map((state) =>
        TEAM_ORDER.indexOf(state.event.team)));
    const labelDirections = associatedEndpoints.flatMap((endpoint) =>
        endpoint.labelDirections);
    const labelPlacement = labelDirections.length > 0
        ? getEndpointLabelPlacement(
            labelDirections,
            labelTeamIndex,
            true,
        )
        : labelTeamIndex === 0
            ? { anchor: "right" as const, offset: [-12, 0] as [number, number] }
            : { anchor: "left" as const, offset: [12, 0] as [number, number] };
    const labelColors = getTeamColors(labelStates);
    const labelColor = labelStates.length === 1 ? labelColors[0] : null;

    return (
        <>
            <MapMarker
                longitude={position[0]}
                latitude={position[1]}
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
                        {colors.length > 1 ? (
                            <defs>
                                <linearGradient id={gradientId}>
                                    <stop offset="50%" stopColor={colors[0]} />
                                    <stop offset="50%" stopColor={colors[1]} />
                                </linearGradient>
                            </defs>
                        ) : null}
                        <path
                            d="M28 1C13.09 1 1 13.09 1 28c0 12.63 8.68 23.23 20.4 26.17L28 62l6.6-7.83C46.32 51.23 55 40.63 55 28 55 13.09 42.91 1 28 1Z"
                            fill="var(--color-muted)"
                            stroke="var(--color-paper)"
                            strokeWidth="2"
                        />
                        <circle cx="28" cy="28" r="22" fill={markerFill} />
                        <circle cx="28" cy="68" r="7" fill="var(--color-paper)" />
                        <circle
                            cx="28"
                            cy="68"
                            r="5"
                            fill={markerFill}
                            stroke="var(--color-muted)"
                            strokeWidth="2"
                        />
                    </svg>
                </MarkerContent>
            </MapMarker>
            {showLabel && labelState ? (
                <TrackerMarkerLabel
                    coordinate={position}
                    positionTransitionDuration={PIN_POSITION_TRANSITION_MS}
                    placement={labelPlacement}
                    color={labelColor}
                    contentClassName="z-30"
                    className="max-w-48 px-2 py-1 font-sans text-xs font-semibold leading-tight shadow-sm"
                >
                    {getStationaryLabel(labelState)}
                </TrackerMarkerLabel>
            ) : null}
        </>
    );
}

function TeamPins({
    states,
    endpoints,
    showLabels,
}: {
    states: ResolvedTeamState[];
    endpoints: TransitEndpoint[];
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

    return getColocatedStateGroups(states).map((group) => {
        const stationaryStates = group.filter((state) => !state.trajectory);
        const associatedEndpoints = endpoints.filter((endpoint) =>
            stationaryStates.some((state) =>
                endpointMatchesStationaryState(endpoint, state)));

        return (
            <TeamPin
                key={group.map((state) => state.event.team).join("-")}
                states={group}
                associatedEndpoints={associatedEndpoints}
                rotation={group.length === 1
                    ? rotations.get(group[0].event.team) ?? 0
                    : 0}
                showLabel={showLabels}
            />
        );
    });
}

function TransitEndpointMarker({
    coordinate,
    states,
    label,
    labelDirections,
    showLabel,
}: {
    coordinate: Coordinate;
    states: ResolvedTeamState[];
    label: string;
    labelDirections: readonly EndpointLabelDirection[];
    showLabel: boolean;
}) {
    const uniqueStates = getUniqueTeamStates(states);
    const colors = getTeamColors(uniqueStates);
    const markerColor = colors.length === 1
        ? colors[0]
        : `conic-gradient(${colors[0]} 0 50%, ${colors[1]} 50% 100%)`;
    const labelColor = uniqueStates.length === 1 ? colors[0] : null;
    const labelRow = Math.min(...uniqueStates.map((state) =>
        TEAM_ORDER.indexOf(state.event.team)));
    const labelPlacement = getEndpointLabelPlacement(
        labelDirections,
        labelRow,
    );
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
                <TrackerMarkerLabel
                    coordinate={coordinate}
                    placement={labelPlacement}
                    color={labelColor}
                    contentClassName="z-20"
                    className="max-w-44 px-2 py-1.5 shadow-md"
                >
                    <p className="whitespace-normal wrap-break-word font-sans text-xs font-semibold leading-tight">
                        {label}
                    </p>
                </TrackerMarkerLabel>
            ) : null}
        </>
    );
}

function getTransitEndpoints(states: ResolvedTeamState[]) {
    const endpoints: TransitEndpoint[] = [];
    states.forEach((state) => {
        if (
            !state.trajectory
            || !state.originCoordinate
        ) {
            return;
        }

        const trajectoryDistanceMiles = getTrajectoryDistanceMiles(
            state.fullTrajectoryCoordinates,
        );
        const trajectoryLabelMinZoom = getTrajectoryLabelMinZoom(
            trajectoryDistanceMiles,
        );
        const originLabelDirection = getEndpointLabelDirection(
            state.fullTrajectoryCoordinates,
            "origin",
            trajectoryDistanceMiles,
        );
        const destinationLabelDirection = getEndpointLabelDirection(
            state.fullTrajectoryCoordinates,
            "destination",
            trajectoryDistanceMiles,
        );
        const additions = [
            {
                coordinate: state.originCoordinate,
                label: state.trajectory.originLabel,
                labelDirection: originLabelDirection,
                minZoom: trajectoryLabelMinZoom,
            },
            ...(state.destinationCoordinate ? [{
                coordinate: state.destinationCoordinate,
                label: state.trajectory.destinationLabel,
                labelDirection: destinationLabelDirection,
                minZoom: trajectoryLabelMinZoom,
            }] : []),
            ...state.waypointLabels.map((waypoint) => ({
                coordinate: waypoint.coordinate,
                label: waypoint.text,
                labelDirection: null,
                minZoom: LABEL_MAX_ZOOM,
            })),
        ];

        additions.forEach(({ coordinate, label, labelDirection, minZoom }) => {
            const existing = endpoints.find((endpoint) =>
                endpoint.label === label
                && coordinatesAreColocated(endpoint.coordinate, coordinate));
            if (existing) {
                existing.states.push(state);
                if (labelDirection) {
                    existing.labelDirections.push(labelDirection);
                }
                existing.minZoom = Math.min(existing.minZoom, minZoom);
                return;
            }
            endpoints.push({
                key: `${coordinate[0]},${coordinate[1]}:${label}`,
                coordinate,
                states: [state],
                label,
                labelDirections: labelDirection ? [labelDirection] : [],
                minZoom,
            });
        });
    });
    return endpoints;
}

function TransitEndpoints({
    endpoints,
    states,
    zoom,
}: {
    endpoints: TransitEndpoint[];
    states: ResolvedTeamState[];
    zoom: number;
}) {
    return endpoints.map((endpoint) => {
        const matchingStationaryStates = states.filter((state) =>
            endpointMatchesStationaryState(endpoint, state));
        const markerStates = getUniqueTeamStates([
            ...endpoint.states,
            ...matchingStationaryStates,
        ]);

        return (
            <TransitEndpointMarker
                key={endpoint.key}
                coordinate={endpoint.coordinate}
                states={markerStates}
                label={endpoint.label}
                labelDirections={endpoint.labelDirections}
                showLabel={
                    zoom >= endpoint.minZoom
                    && matchingStationaryStates.length === 0
                }
            />
        );
    });
}

function TrackerMarkers({ states }: { states: ResolvedTeamState[] }) {
    const { map, isLoaded } = useMap();
    const [zoom, setZoom] = useState(0);
    const endpoints = useMemo(() => getTransitEndpoints(states), [states]);

    useEffect(() => {
        if (!map || !isLoaded) return;

        const updateZoom = () => setZoom(map.getZoom());

        updateZoom();
        map.on("zoom", updateZoom);

        return () => {
            map.off("zoom", updateZoom);
        };
    }, [isLoaded, map]);

    return (
        <>
            <TeamPins
                states={states}
                endpoints={endpoints}
                showLabels={zoom >= MAP_MIN_ZOOM}
            />
            <TransitEndpoints
                endpoints={endpoints}
                states={states}
                zoom={zoom}
            />
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
                markerLabel: interval.kind === "stationary"
                    ? interval.markerLabel
                    : undefined,
            },
            trajectory,
            position: resolved.position ?? stationaryPosition
                ?? trackerIntervalFallbackPosition(interval),
            fullTrajectoryCoordinates: resolved.fullTrajectoryCoordinates,
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
                    minZoom={MAP_MIN_ZOOM}
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
