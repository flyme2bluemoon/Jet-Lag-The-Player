import {
    generateArcCoordinates,
    resolveAirport,
} from "@/components/ui/flight";

import type {
    Coordinate,
    ResolvedFlightTrajectory,
    ResolvedGroundTrajectory,
} from "./tracker-data";

export type EndpointLabelDirection = {
    east: number;
    north: number;
};

export type EndpointLabelPlacement = {
    anchor: "top" | "bottom" | "left" | "right";
    offset: [number, number];
};

type EndpointLabelCandidate = {
    direction: EndpointLabelDirection;
    placement: EndpointLabelPlacement;
};

const COLOCATED_MARKER_DISTANCE_MILES = 0.5;
const LABEL_REFERENCE_DISTANCE_MILES = 10;
const LABEL_DIRECTION_SAMPLE_FRACTION = 0.05;
const LABEL_DIRECTION_MIN_SAMPLE_MILES = 0.25;
const EARTH_RADIUS_MILES = 3_958.8;

export const MAP_MIN_ZOOM = 3;
export const LABEL_MAX_ZOOM = 8;

const ENDPOINT_LABEL_CANDIDATES = {
    above: {
        direction: { east: 0, north: 1 },
        placement: { anchor: "bottom", offset: [0, -12] },
    },
    below: {
        direction: { east: 0, north: -1 },
        placement: { anchor: "top", offset: [0, 12] },
    },
    left: {
        direction: { east: -1, north: 0 },
        placement: { anchor: "right", offset: [-12, 0] },
    },
    right: {
        direction: { east: 1, north: 0 },
        placement: { anchor: "left", offset: [12, 0] },
    },
} satisfies Record<string, EndpointLabelCandidate>;

function degreesToRadians(degrees: number) {
    return degrees * Math.PI / 180;
}

function getSegmentDistanceMiles(start: Coordinate, end: Coordinate) {
    const startLatitude = degreesToRadians(start[1]);
    const endLatitude = degreesToRadians(end[1]);
    const latitudeDelta = endLatitude - startLatitude;
    const longitudeDelta = degreesToRadians(end[0] - start[0]);
    const haversine = (
        Math.sin(latitudeDelta / 2) ** 2
        + Math.cos(startLatitude)
        * Math.cos(endLatitude)
        * Math.sin(longitudeDelta / 2) ** 2
    );

    return 2 * EARTH_RADIUS_MILES * Math.asin(
        Math.sqrt(Math.min(1, haversine)),
    );
}

export function coordinatesAreColocated(
    left: Coordinate,
    right: Coordinate,
) {
    return getSegmentDistanceMiles(left, right)
        <= COLOCATED_MARKER_DISTANCE_MILES;
}

export function coordinatesMatch(
    left: Coordinate | null,
    right: Coordinate | null,
) {
    return left?.[0] === right?.[0] && left?.[1] === right?.[1];
}

export function getAverageCoordinate(
    coordinates: readonly Coordinate[],
): Coordinate {
    const totals = coordinates.reduce<Coordinate>(
        ([longitude, latitude], coordinate) => [
            longitude + coordinate[0],
            latitude + coordinate[1],
        ],
        [0, 0],
    );

    return [
        totals[0] / coordinates.length,
        totals[1] / coordinates.length,
    ];
}

export function getCoordinateBounds(
    coordinates: readonly Coordinate[],
): [Coordinate, Coordinate] | null {
    const [firstCoordinate, ...remainingCoordinates] = coordinates;
    if (!firstCoordinate) return null;

    return remainingCoordinates.reduce<[Coordinate, Coordinate]>(
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
}

export function getFullTrajectoryCoordinates(
    trajectory: ResolvedGroundTrajectory | ResolvedFlightTrajectory,
) {
    return trajectory.kind === "flight"
        ? generateArcCoordinates(
            resolveAirport(trajectory.from),
            resolveAirport(trajectory.to),
        )
        : trajectory.coordinates;
}

export function getTrajectoryDistanceMiles(
    coordinates: readonly Coordinate[],
) {
    return coordinates.slice(1).reduce(
        (total, coordinate, index) =>
            total + getSegmentDistanceMiles(coordinates[index], coordinate),
        0,
    );
}

export function getTrajectoryLabelMinZoom(distanceMiles: number) {
    if (distanceMiles <= 0) return LABEL_MAX_ZOOM;

    return Math.max(
        MAP_MIN_ZOOM,
        Math.min(
            LABEL_MAX_ZOOM,
            LABEL_MAX_ZOOM - Math.log2(
                distanceMiles / LABEL_REFERENCE_DISTANCE_MILES,
            ),
        ),
    );
}

function getEndpointDirectionReference(
    coordinates: readonly Coordinate[],
    endpoint: "origin" | "destination",
    sampleDistanceMiles: number,
) {
    let traveledMiles = 0;

    if (endpoint === "origin") {
        for (let index = 1; index < coordinates.length; index += 1) {
            traveledMiles += getSegmentDistanceMiles(
                coordinates[index - 1],
                coordinates[index],
            );
            if (traveledMiles >= sampleDistanceMiles) {
                return coordinates[index];
            }
        }
        return coordinates[coordinates.length - 1];
    }

    for (let index = coordinates.length - 2; index >= 0; index -= 1) {
        traveledMiles += getSegmentDistanceMiles(
            coordinates[index + 1],
            coordinates[index],
        );
        if (traveledMiles >= sampleDistanceMiles) {
            return coordinates[index];
        }
    }
    return coordinates[0];
}

export function getEndpointLabelDirection(
    coordinates: readonly Coordinate[],
    endpoint: "origin" | "destination",
    trajectoryDistanceMiles: number,
): EndpointLabelDirection | null {
    if (coordinates.length < 2 || trajectoryDistanceMiles <= 0) return null;

    const endpointCoordinate = endpoint === "origin"
        ? coordinates[0]
        : coordinates[coordinates.length - 1];
    const sampleDistanceMiles = Math.min(
        trajectoryDistanceMiles,
        Math.max(
            LABEL_DIRECTION_MIN_SAMPLE_MILES,
            trajectoryDistanceMiles * LABEL_DIRECTION_SAMPLE_FRACTION,
        ),
    );
    const adjacentCoordinate = getEndpointDirectionReference(
        coordinates,
        endpoint,
        sampleDistanceMiles,
    );
    const latitudeScale = Math.cos(degreesToRadians(endpointCoordinate[1]));
    const east = (endpointCoordinate[0] - adjacentCoordinate[0]) * latitudeScale;
    const north = endpointCoordinate[1] - adjacentCoordinate[1];
    const magnitude = Math.hypot(east, north);

    return magnitude === 0 ? null : {
        east: east / magnitude,
        north: north / magnitude,
    };
}

export function getEndpointLabelPlacement(
    directions: readonly EndpointLabelDirection[],
    fallbackRow: number,
    avoidPinAbove = false,
): EndpointLabelPlacement {
    const { above, below, left, right } = ENDPOINT_LABEL_CANDIDATES;

    if (directions.length === 0) {
        return fallbackRow === 0
            ? above.placement
            : below.placement;
    }

    const preferredCandidates = fallbackRow === 0
        ? [above, below, left, right]
        : [below, above, right, left];
    const candidates = avoidPinAbove
        ? preferredCandidates.filter((candidate) => candidate !== above)
        : preferredCandidates;

    return candidates.reduce(
        (best, candidate) => {
            const score = Math.min(
                ...directions.map(
                    (direction) =>
                        candidate.direction.east * direction.east
                        + candidate.direction.north * direction.north,
                ),
            );

            return score > best.score
                ? { placement: candidate.placement, score }
                : best;
        },
        {
            placement: candidates[0].placement,
            score: Number.NEGATIVE_INFINITY,
        },
    ).placement;
}
