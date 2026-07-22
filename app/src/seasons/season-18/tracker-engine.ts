import { seasonEighteen } from "@/data/season-18";
import { compareTimestamps, isTimestampInRange } from "@/lib/timestamps";

import type { TeamId } from "./team-data";
import type {
    EndpointLabel,
    GroundDwellPhase,
    GroundPathPhase,
    GroundTravelEvent,
    ResolvedEndpointLabel,
    ResolvedTrackerInterval,
    ResolvedTravelDisplay,
    StationaryEvent,
    TrackerEvent,
    TrackerTimestamp,
    TravelDisplay,
} from "./tracker-model";
import type { Coordinate } from "./tracker-routes";
import {
    materializePath,
    trackerLocations,
    trackerPaths,
    type LocationId,
    type PathId,
} from "./tracker-static";
import {
    trackerEpisodeRanges,
    trackerTimeline,
} from "./tracker-timeline";

type SeasonEighteenEvent = TrackerEvent<PathId, LocationId>;
type SeasonEighteenGroundEvent = GroundTravelEvent<PathId, LocationId>;
type SeasonEighteenGroundPhase =
    | GroundPathPhase<PathId, LocationId>
    | GroundDwellPhase<LocationId>;
type SeasonEighteenInterval = ResolvedTrackerInterval<LocationId>;

type DraftInterval = SeasonEighteenInterval & { order: number };

function compare(left: TrackerTimestamp, right: TrackerTimestamp) {
    return compareTimestamps(seasonEighteen, left, right);
}

function timestampEquals(left: TrackerTimestamp, right: TrackerTimestamp) {
    return compare(left, right) === 0;
}

function distance(left: Coordinate, right: Coordinate) {
    return Math.hypot(left[0] - right[0], left[1] - right[1]);
}

function getClosestProgress(path: readonly Coordinate[], target: Coordinate) {
    if (path.length < 2) return 0;

    const segmentLengths = path.slice(1).map((point, index) =>
        distance(point, path[index]));
    const totalLength = segmentLengths.reduce((total, length) => total + length, 0);
    let traveled = 0;
    let closestProgress = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    segmentLengths.forEach((length, index) => {
        const start = path[index];
        const end = path[index + 1];
        const deltaLongitude = end[0] - start[0];
        const deltaLatitude = end[1] - start[1];
        const lengthSquared = deltaLongitude ** 2 + deltaLatitude ** 2;
        const projection = lengthSquared === 0
            ? 0
            : Math.min(1, Math.max(0, (
                (target[0] - start[0]) * deltaLongitude
                + (target[1] - start[1]) * deltaLatitude
            ) / lengthSquared));
        const projected: Coordinate = [
            start[0] + deltaLongitude * projection,
            start[1] + deltaLatitude * projection,
        ];
        const projectedDistance = distance(projected, target);

        if (projectedDistance < closestDistance) {
            closestDistance = projectedDistance;
            closestProgress = totalLength === 0
                ? 0
                : (traveled + length * projection) / totalLength;
        }
        traveled += length;
    });

    return closestProgress;
}

function joinPaths(paths: readonly (readonly Coordinate[])[]) {
    return paths.flatMap((path, index) => index === 0 ? [...path] : path.slice(1));
}

function mergeDisplay(
    eventDisplay: TravelDisplay<LocationId> | undefined,
    phaseDisplay: TravelDisplay<LocationId> | undefined,
) {
    return { ...eventDisplay, ...phaseDisplay };
}

function labelIsVisible(
    label: EndpointLabel<LocationId> | undefined,
    at: TrackerTimestamp,
) {
    return label !== false
        && (!label?.visibleFrom || compare(label.visibleFrom, at) <= 0);
}

function resolveEndpointLabel(
    label: EndpointLabel<LocationId> | undefined,
    defaultLocation: LocationId,
    at: TrackerTimestamp,
    defaultText?: string,
): ResolvedEndpointLabel<LocationId> | null {
    if (!labelIsVisible(label, at)) return null;
    const definition = label || {};
    const location = definition.location ?? defaultLocation;
    return {
        text: definition.text ?? defaultText ?? trackerLocations[location].name,
        location,
        coordinate: trackerLocations[location].coordinate,
    };
}

function getLabelVisibilityBoundaries(
    display: TravelDisplay<LocationId> | undefined,
) {
    return [
        display?.originLabel && display.originLabel.visibleFrom,
        display?.destinationLabel && display.destinationLabel.visibleFrom,
    ].filter((boundary): boundary is TrackerTimestamp => Boolean(boundary));
}

function getGroundPathGroups(event: SeasonEighteenGroundEvent) {
    const groups: Array<{
        path: PathId;
        phases: Array<{ phase: GroundPathPhase<PathId, LocationId>; index: number }>;
    }> = [];

    event.phases.forEach((phase, index) => {
        if (phase.kind !== "path") return;
        const previousPhase = event.phases[index - 1];
        const previousGroup = groups[groups.length - 1];
        if (
            previousPhase?.kind === "path"
            && previousGroup?.path === phase.path
        ) {
            previousGroup.phases.push({ phase, index });
            return;
        }
        groups.push({ path: phase.path, phases: [{ phase, index }] });
    });

    return groups;
}

function findGroundGroupIndex(
    groups: ReturnType<typeof getGroundPathGroups>,
    phaseIndex: number,
) {
    return groups.findIndex((group) =>
        group.phases.some((entry) => entry.index === phaseIndex));
}

function getIntermediateOriginGroupIndex(
    event: SeasonEighteenGroundEvent,
    groups: ReturnType<typeof getGroundPathGroups>,
    phaseIndex: number,
) {
    let startGroupIndex = 0;
    for (let index = 0; index <= phaseIndex; index += 1) {
        const phase = event.phases[index];
        if (!phase.setIntermediateOrigin) continue;
        if (phase.kind === "path") {
            startGroupIndex = findGroundGroupIndex(groups, index);
        } else {
            const nextGroupIndex = groups.findIndex((group) =>
                group.phases[0].index > index);
            startGroupIndex = nextGroupIndex === -1
                ? groups.length - 1
                : nextGroupIndex;
        }
    }
    return Math.max(0, startGroupIndex);
}

function getGroundPhaseProgressBounds(
    event: SeasonEighteenGroundEvent,
    groups: ReturnType<typeof getGroundPathGroups>,
    phase: SeasonEighteenGroundPhase,
    phaseIndex: number,
    coordinates: readonly Coordinate[],
) {
    if (phase.kind === "dwell") {
        const progress = getClosestProgress(
            coordinates,
            trackerLocations[phase.location].coordinate,
        );
        return { progressFrom: progress, progressTo: progress };
    }

    const groupIndex = findGroundGroupIndex(groups, phaseIndex);
    const group = groups[groupIndex];
    const groupStart = group.phases[0].phase.time.start;
    const groupEnd = group.phases[group.phases.length - 1].phase.time.end;
    const groupDuration = groupEnd.at - groupStart.at;
    const phaseFrom = groupDuration === 0
        ? 0
        : (phase.time.start.at - groupStart.at) / groupDuration;
    let phaseTo = groupDuration === 0
        ? 1
        : (phase.time.end.at - groupStart.at) / groupDuration;

    if (
        event.interruption
        && phaseIndex === event.phases.length - 1
    ) {
        const fullPath = materializePath(phase.path);
        phaseTo *= getClosestProgress(
            fullPath,
            trackerLocations[event.interruption].coordinate,
        );
    }

    const pathStart = getClosestProgress(
        coordinates,
        trackerLocations[trackerPaths[phase.path].origin].coordinate,
    );
    const pathEnd = getClosestProgress(
        coordinates,
        trackerLocations[trackerPaths[phase.path].destination].coordinate,
    );
    return {
        progressFrom: pathStart + (pathEnd - pathStart) * phaseFrom,
        progressTo: pathStart + (pathEnd - pathStart) * phaseTo,
    };
}

function getGroundDisplay(
    event: SeasonEighteenGroundEvent,
    phase: SeasonEighteenGroundPhase,
    groups: ReturnType<typeof getGroundPathGroups>,
    startGroupIndex: number,
    rangeStart: TrackerTimestamp,
): ResolvedTravelDisplay<LocationId> {
    const definition = mergeDisplay(event.display, phase.display);
    const originGroup = groups[startGroupIndex];
    const originLocation = trackerPaths[originGroup.path].origin;
    const waypointLabel = phase.kind === "path" && phase.destWaypointMapLabel
        ? {
            text: phase.destWaypointMapLabel.text
                ?? trackerLocations[trackerPaths[phase.path].destination].name,
            location: trackerPaths[phase.path].destination,
            coordinate: trackerLocations[trackerPaths[phase.path].destination].coordinate,
        }
        : phase.kind === "dwell" && phase.mapLabel
            ? {
                text: phase.mapLabel.text ?? trackerLocations[phase.location].name,
                location: phase.location,
                coordinate: trackerLocations[phase.location].coordinate,
            }
            : null;

    return {
        revealPath: definition.revealPath ?? "full",
        originLabel: resolveEndpointLabel(
            definition.originLabel,
            originLocation,
            rangeStart,
        ),
        destinationLabel: resolveEndpointLabel(
            definition.destinationLabel,
            event.destination,
            rangeStart,
        ),
        waypointLabels: waypointLabel ? [waypointLabel] : [],
    };
}

function compileGroundEvent(
    team: TeamId,
    event: SeasonEighteenGroundEvent,
    initialOrder: number,
) {
    const groups = getGroundPathGroups(event);
    const intervals: DraftInterval[] = [];
    let order = initialOrder;

    event.phases.forEach((phase, phaseIndex) => {
        const startGroupIndex = getIntermediateOriginGroupIndex(
            event,
            groups,
            phaseIndex,
        );
        const coordinates = joinPaths(
            groups.slice(startGroupIndex).map((group) => materializePath(group.path)),
        );
        const bounds = getGroundPhaseProgressBounds(
            event,
            groups,
            phase,
            phaseIndex,
            coordinates,
        );
        intervals.push({
            id: `${event.id}:${phaseIndex}`,
            eventId: event.id,
            team,
            kind: "ground",
            time: phase.time,
            status: phase.status ?? event.status,
            trajectory: {
                kind: "ground",
                coordinates,
                ...bounds,
            },
            display: getGroundDisplay(
                event,
                phase,
                groups,
                startGroupIndex,
                phase.time.start,
            ),
            order,
        });
        order += 1;
    });

    return intervals;
}

function getFlightDisplay(
    event: Extract<SeasonEighteenEvent, { kind: "flight" }>,
    phase: Extract<SeasonEighteenEvent, { kind: "flight" }>["phases"][number],
    rangeStart: TrackerTimestamp,
): ResolvedTravelDisplay<LocationId> {
    const definition = mergeDisplay(event.display, phase.display);
    const origin = trackerLocations[event.origin];
    const destination = trackerLocations[event.destination];
    return {
        revealPath: definition.revealPath ?? "full",
        originLabel: resolveEndpointLabel(
            definition.originLabel,
            event.origin,
            rangeStart,
            "airportCode" in origin ? origin.airportCode : undefined,
        ),
        destinationLabel: resolveEndpointLabel(
            definition.destinationLabel,
            event.destination,
            rangeStart,
            "airportCode" in destination ? destination.airportCode : undefined,
        ),
        waypointLabels: [],
    };
}

function compileFlightEvent(
    team: TeamId,
    event: Extract<SeasonEighteenEvent, { kind: "flight" }>,
    initialOrder: number,
) {
    const origin = trackerLocations[event.origin];
    const destination = trackerLocations[event.destination];
    const originAirport = "airportCode" in origin ? origin.airportCode : null;
    const destinationAirport = "airportCode" in destination
        ? destination.airportCode
        : null;
    if (!originAirport || !destinationAirport) {
        throw new Error(`Flight event "${event.id}" requires airport locations.`);
    }

    const intervals: DraftInterval[] = [];
    let order = initialOrder;
    event.phases.forEach((phase, phaseIndex) => {
        intervals.push({
            id: `${event.id}:${phaseIndex}`,
            eventId: event.id,
            team,
            kind: "flight",
            time: phase.time,
            status: phase.status ?? event.status,
            trajectory: {
                kind: "flight",
                from: originAirport,
                to: destinationAirport,
                progressFrom: phase.progress?.from ?? 0,
                progressTo: phase.progress?.to ?? 1,
            },
            display: getFlightDisplay(event, phase, phase.time.start),
            order,
        });
        order += 1;
    });
    return intervals;
}

function compileStationaryEvent(
    team: TeamId,
    event: StationaryEvent<LocationId>,
    end: TrackerTimestamp,
    order: number,
): DraftInterval {
    return {
        id: event.id,
        eventId: event.id,
        team,
        kind: "stationary",
        time: { start: event.at, end },
        status: event.status,
        location: event.location,
        coordinate: trackerLocations[event.location].coordinate,
        order,
    };
}

function validateTimeline(team: TeamId, events: readonly SeasonEighteenEvent[]) {
    const eventIds = new Set<string>();
    const stationaryKeys = new Set<string>();

    let previousEventStart: TrackerTimestamp | null = null;

    events.forEach((event) => {
        if (eventIds.has(event.id)) throw new Error(`Duplicate tracker event ID "${event.id}".`);
        eventIds.add(event.id);

        const eventStart = event.kind === "stationary"
            ? event.at
            : event.phases[0].time.start;
        if (previousEventStart && compare(previousEventStart, eventStart) > 0) {
            throw new Error(`Tracker events for ${team} are not chronological at "${event.id}".`);
        }
        previousEventStart = eventStart;

        if (event.kind === "stationary") {
            const key = `${event.at.episode}:${event.at.at}:${event.location}`;
            if (stationaryKeys.has(key)) {
                throw new Error(`Duplicate stationary tracker event for ${team} at ${key}.`);
            }
            stationaryKeys.add(key);
            return;
        }

        event.phases.forEach((phase) => {
            if (compare(phase.time.start, phase.time.end) >= 0) {
                throw new Error(`Tracker phase in "${event.id}" must have positive duration.`);
            }

            getLabelVisibilityBoundaries(phase.display).forEach((boundary) => {
                if (!timestampEquals(boundary, phase.time.start)) {
                    throw new Error(
                        `Phase label visibility in "${event.id}" must begin at that phase boundary.`,
                    );
                }
            });
        });

        const phaseBoundaries = event.phases.flatMap((phase) => [
            phase.time.start,
            phase.time.end,
        ]);
        getLabelVisibilityBoundaries(event.display).forEach((boundary) => {
            if (!phaseBoundaries.some((candidate) => timestampEquals(candidate, boundary))) {
                throw new Error(
                    `Event label visibility in "${event.id}" must coincide with a phase boundary.`,
                );
            }
        });

        if (event.kind === "flight") {
            if (event.phases.length > 1 && event.phases.some((phase) => !phase.progress)) {
                throw new Error(`Cross-episode flight "${event.id}" requires explicit progress.`);
            }
            event.phases.forEach((phase, index) => {
                const progress = phase.progress ?? { from: 0, to: 1 };
                if (
                    progress.from < 0
                    || progress.to > 1
                    || progress.from >= progress.to
                ) {
                    throw new Error(`Flight phase in "${event.id}" has invalid progress.`);
                }
                const previousProgress = event.phases[index - 1]?.progress;
                if (previousProgress && previousProgress.to !== progress.from) {
                    throw new Error(`Flight progress in "${event.id}" is not continuous.`);
                }
            });
            return;
        }

        const pathPhases = event.phases.filter((phase) => phase.kind === "path");
        if (pathPhases.length === 0) throw new Error(`Ground event "${event.id}" has no paths.`);
        if (trackerPaths[pathPhases[0].path].origin !== event.origin) {
            throw new Error(`Ground event "${event.id}" does not begin at its origin.`);
        }
        if (trackerPaths[pathPhases[pathPhases.length - 1].path].destination !== event.destination) {
            throw new Error(`Ground event "${event.id}" does not reference its destination.`);
        }

        let currentLocation = event.origin;
        event.phases.forEach((phase, index) => {
            const previous = event.phases[index - 1];
            if (previous && !timestampEquals(previous.time.end, phase.time.start)) {
                throw new Error(`Ground phases in "${event.id}" must be contiguous in time.`);
            }

            if (phase.kind === "dwell") {
                if (phase.location !== currentLocation) {
                    throw new Error(`Dwell in "${event.id}" does not match the current location.`);
                }
                return;
            }

            const path = trackerPaths[phase.path];
            const repeatsPreviousPath = previous?.kind === "path"
                && previous.path === phase.path;
            if (!repeatsPreviousPath && path.origin !== currentLocation) {
                throw new Error(`Paths in "${event.id}" are not spatially continuous.`);
            }
            if (!repeatsPreviousPath) currentLocation = path.destination;
        });

        if (event.interruption) {
            const finalPhase = event.phases[event.phases.length - 1];
            if (finalPhase.kind !== "path") {
                throw new Error(`Interrupted event "${event.id}" must end with a path.`);
            }
            const finalPath = materializePath(finalPhase.path);
            const interruption = trackerLocations[event.interruption].coordinate;
            const interruptionIndex = finalPath.findIndex((coordinate) =>
                distance(coordinate, interruption) < 1e-9);
            if (interruptionIndex <= 0) {
                throw new Error(`Interruption for "${event.id}" is not on its final path.`);
            }
            const arrival = events.find((candidate) => {
                if (candidate.kind === "stationary") {
                    return candidate.location === event.interruption
                        && timestampEquals(candidate.at, finalPhase.time.end);
                }
                return candidate.origin === event.interruption
                    && timestampEquals(candidate.phases[0].time.start, finalPhase.time.end);
            });
            if (!arrival) {
                throw new Error(`Interruption for "${event.id}" needs a matching next event.`);
            }
        }
    });
}

function getLastTrackerTimestamp(): TrackerTimestamp {
    const episodes = Object.keys(trackerEpisodeRanges) as Array<keyof typeof trackerEpisodeRanges>;
    const episode = episodes[episodes.length - 1];
    return { episode, at: trackerEpisodeRanges[episode].end };
}

function compileTeam(team: TeamId) {
    const events = trackerTimeline[team] as readonly SeasonEighteenEvent[];
    validateTimeline(team, events);
    const starts = events.flatMap((event) =>
        event.kind === "stationary"
            ? [event.at]
            : event.phases.map((phase) => phase.time.start))
        .sort(compare);
    const intervals: DraftInterval[] = [];
    let order = 0;

    events.forEach((event) => {
        if (event.kind === "stationary") {
            const nextStart = starts.find((candidate) => compare(event.at, candidate) < 0)
                ?? getLastTrackerTimestamp();
            intervals.push(compileStationaryEvent(team, event, nextStart, order));
            order += 1;
            return;
        }
        const compiled = event.kind === "ground"
            ? compileGroundEvent(team, event, order)
            : compileFlightEvent(team, event, order);
        intervals.push(...compiled);
        order += compiled.length;
    });

    return intervals.sort((left, right) =>
        compare(left.time.start, right.time.start) || left.order - right.order);
}

const compiledIntervals: Readonly<Record<TeamId, readonly SeasonEighteenInterval[]>> = {
    "sam-amy": compileTeam("sam-amy"),
    "ben-adam": compileTeam("ben-adam"),
};

export function getTrackerInterval(
    episode: TrackerTimestamp["episode"],
    at: number,
    team: TeamId,
): SeasonEighteenInterval {
    const current = { episode, at };
    const intervals = compiledIntervals[team];
    const interval = intervals.findLast((candidate) =>
        compare(candidate.time.start, current) <= 0
        && (
            isTimestampInRange(
                seasonEighteen,
                current,
                candidate.time.start,
                candidate.time.end,
            )
            || timestampEquals(current, candidate.time.end)
        ));
    return interval ?? intervals[0];
}

function validateCompiledIntervals() {
    Object.entries(compiledIntervals).forEach(([team, intervals]) => {
        intervals.forEach((interval, index) => {
            const previous = intervals[index - 1];
            if (previous && compare(previous.time.end, interval.time.start) > 0) {
                throw new Error(`Compiled tracker intervals overlap for ${team}.`);
            }

            const midpoint = interval.time.start.at
                + (interval.time.end.at - interval.time.start.at) / 2;
            if (
                interval.time.start.episode === interval.time.end.episode
                && getTrackerInterval(
                    interval.time.start.episode,
                    midpoint,
                    interval.team,
                ) !== interval
            ) {
                throw new Error(`Tracker interval "${interval.id}" is not stably cached.`);
            }

            if (
                previous
                && timestampEquals(previous.time.end, interval.time.start)
                && getTrackerInterval(
                    interval.time.start.episode,
                    interval.time.start.at,
                    interval.team,
                ) !== interval
            ) {
                throw new Error(`Tracker boundary before "${interval.id}" resolves incorrectly.`);
            }
        });
    });
}

validateCompiledIntervals();

export function getTrackerProgress(
    interval: SeasonEighteenInterval,
    at: number,
) {
    if (interval.kind === "stationary") return 0;
    const duration = interval.time.end.at - interval.time.start.at;
    const elapsed = duration === 0
        ? 1
        : Math.min(1, Math.max(0, (at - interval.time.start.at) / duration));
    return interval.trajectory.progressFrom
        + elapsed * (
            interval.trajectory.progressTo
            - interval.trajectory.progressFrom
        );
}

export function getPointAlongPath(
    path: readonly Coordinate[],
    progress: number,
): Coordinate {
    if (path.length === 0) return trackerLocations.centralPark.coordinate;
    if (path.length === 1 || progress <= 0) return path[0];
    if (progress >= 1) return path[path.length - 1];

    const lengths = path.slice(1).map((point, index) =>
        distance(point, path[index]));
    const totalLength = lengths.reduce((total, length) => total + length, 0);
    const target = totalLength * progress;
    let traveled = 0;

    for (let index = 0; index < lengths.length; index += 1) {
        const length = lengths[index];
        if (traveled + length < target) {
            traveled += length;
            continue;
        }
        const amount = length === 0 ? 1 : (target - traveled) / length;
        return [
            path[index][0] + (path[index + 1][0] - path[index][0]) * amount,
            path[index][1] + (path[index + 1][1] - path[index][1]) * amount,
        ];
    }
    return path[path.length - 1];
}

export function cropPath(
    path: readonly Coordinate[],
    progress: number,
): Coordinate[] {
    const point = getPointAlongPath(path, progress);
    if (path.length === 0) return [];
    if (progress <= 0) return [path[0], path[0]];
    if (progress >= 1) return [...path];

    const lengths = path.slice(1).map((next, index) =>
        distance(next, path[index]));
    const totalLength = lengths.reduce((total, length) => total + length, 0);
    const target = totalLength * progress;
    const result: Coordinate[] = [path[0]];
    let traveled = 0;
    for (let index = 0; index < lengths.length; index += 1) {
        if (traveled + lengths[index] < target) {
            result.push(path[index + 1]);
            traveled += lengths[index];
            continue;
        }
        result.push(point);
        break;
    }
    return result;
}
