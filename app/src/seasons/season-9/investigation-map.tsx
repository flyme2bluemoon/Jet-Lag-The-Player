"use client";

import type * as GeoJSON from "geojson";
import type { FilterSpecification } from "maplibre-gl";
import { useEffect, useMemo } from "react";
import { Map, MapControls, MapGeoJSON, useMap } from "@/components/ui/map";
import { MAPLIBRE_INVESTIGATION_COLORS } from "@/components/ui/map-colors";
import switzerlandGeoJson from "../../../public/geojson/switzerland.json";
import type { SeasonNineState } from "./timeline-data";

type Coordinate = [number, number];

const switzerlandFeature = (
    switzerlandGeoJson as GeoJSON.FeatureCollection<GeoJSON.Polygon>
).features[0]!;
const SWITZERLAND_OUTLINE = switzerlandFeature.geometry.coordinates[0]!.map(
    ([longitude, latitude]) => [longitude!, latitude!] as Coordinate,
);
const MIN_HIDER_LONGITUDE = 8.3093;
const MAX_HIDER_LATITUDE = 47.0502;
const GOLDAU_STATION: Coordinate = [8.5496, 47.0492];
const ANDERMATT_STATION: Coordinate = [8.5947, 46.6374];
const HOSPENTAL_STATION: Coordinate = [8.5696, 46.6195];
const MAP_MAX_ZOOM = 22;
const SWITZERLAND_BOUNDS = playableAreaBounds(SWITZERLAND_OUTLINE, null);
const withinSwitzerland: FilterSpecification = ["within", switzerlandFeature];
const COUNTRY_LABEL_LAYER_IDS = ["place_country_1", "place_country_2"] as const;
const SWISS_CITY_FILTERS: Record<string, FilterSpecification> = {
    place_city_r6: [
        "all",
        ["==", ["get", "class"], "city"],
        [">=", ["number", ["get", "rank"], 0], 6],
        withinSwitzerland,
    ],
    place_city_r5: [
        "all",
        ["==", ["get", "class"], "city"],
        [">=", ["number", ["get", "rank"], 0], 0],
        ["<=", ["number", ["get", "rank"], 0], 5],
        withinSwitzerland,
    ],
    place_city_dot_r7: [
        "all",
        ["==", ["get", "class"], "city"],
        ["<=", ["number", ["get", "rank"], 0], 7],
        withinSwitzerland,
    ],
    place_city_dot_r4: [
        "all",
        ["==", ["get", "class"], "city"],
        ["<=", ["number", ["get", "rank"], 0], 4],
        withinSwitzerland,
    ],
    place_city_dot_r2: [
        "all",
        ["==", ["get", "class"], "city"],
        ["<=", ["number", ["get", "rank"], 0], 2],
        withinSwitzerland,
    ],
    place_city_dot_z7: [
        "all",
        ["!", ["has", "capital"]],
        ["!", ["in", ["get", "class"], ["literal", ["country", "state"]]]],
        withinSwitzerland,
    ],
    place_capital_dot_z7: [
        "all",
        [">", ["number", ["get", "capital"], 0], 0],
        withinSwitzerland,
    ],
};
const SWITZERLAND_MASK: GeoJSON.Feature<GeoJSON.Polygon, { id: string }> = {
    type: "Feature",
    properties: { id: "season-nine-switzerland-mask" },
    geometry: {
        type: "Polygon",
        coordinates: [
            [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]],
            orientedRing(SWITZERLAND_OUTLINE, true),
        ],
    },
};

function closeRing(coordinates: Coordinate[]) {
    const first = coordinates[0];
    const last = coordinates.at(-1);
    if (!first || !last) return coordinates;
    if (first[0] === last[0] && first[1] === last[1]) return coordinates;
    return [...coordinates, first];
}

function ringArea(coordinates: Coordinate[]) {
    return coordinates.reduce((area, coordinate, index) => {
        const next = coordinates[(index + 1) % coordinates.length]!;
        return area + coordinate[0] * next[1] - next[0] * coordinate[1];
    }, 0) / 2;
}

function orientedRing(coordinates: Coordinate[], clockwise: boolean) {
    const isClockwise = ringArea(coordinates) < 0;
    return closeRing(isClockwise === clockwise ? coordinates : coordinates.toReversed());
}

function circleCoordinates(center: Coordinate, radiusMiles: number) {
    const earthRadiusMiles = 3958.8;
    const angularDistance = radiusMiles / earthRadiusMiles;
    const centerLatitude = center[1] * Math.PI / 180;
    const centerLongitude = center[0] * Math.PI / 180;
    const coordinates: Coordinate[] = [];

    for (let step = 0; step < 72; step += 1) {
        const bearing = step / 72 * Math.PI * 2;
        const latitude = Math.asin(
            Math.sin(centerLatitude) * Math.cos(angularDistance)
            + Math.cos(centerLatitude) * Math.sin(angularDistance) * Math.cos(bearing),
        );
        const longitude = centerLongitude + Math.atan2(
            Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(centerLatitude),
            Math.cos(angularDistance) - Math.sin(centerLatitude) * Math.sin(latitude),
        );
        coordinates.push([longitude * 180 / Math.PI, latitude * 180 / Math.PI]);
    }

    return coordinates;
}

type ClippingEdge = {
    includes: (coordinate: Coordinate) => boolean;
    intersection: (from: Coordinate, to: Coordinate) => Coordinate;
};

function clipPolygon(coordinates: Coordinate[], edge: ClippingEdge) {
    const clipped: Coordinate[] = [];
    let previous = coordinates.at(-1)!;
    let previousIsIncluded = edge.includes(previous);

    for (const coordinate of coordinates) {
        const isIncluded = edge.includes(coordinate);
        if (isIncluded !== previousIsIncluded) clipped.push(edge.intersection(previous, coordinate));
        if (isIncluded) clipped.push(coordinate);
        previous = coordinate;
        previousIsIncluded = isIncluded;
    }

    return clipped;
}

const eastOfLongitude: ClippingEdge = {
    includes: ([longitude]) => longitude >= MIN_HIDER_LONGITUDE,
    intersection: ([fromLongitude, fromLatitude], [toLongitude, toLatitude]) => {
        const progress = (MIN_HIDER_LONGITUDE - fromLongitude) / (toLongitude - fromLongitude);
        return [MIN_HIDER_LONGITUDE, fromLatitude + (toLatitude - fromLatitude) * progress];
    },
};

const southOfLatitude: ClippingEdge = {
    includes: ([, latitude]) => latitude <= MAX_HIDER_LATITUDE,
    intersection: ([fromLongitude, fromLatitude], [toLongitude, toLatitude]) => {
        const progress = (MAX_HIDER_LATITUDE - fromLatitude) / (toLatitude - fromLatitude);
        return [fromLongitude + (toLongitude - fromLongitude) * progress, MAX_HIDER_LATITUDE];
    },
};

function applyDirectionalHints(
    coordinates: Coordinate[],
    hasLongitudeConstraint: boolean,
    hasLatitudeConstraint: boolean,
) {
    let result = coordinates;
    if (hasLongitudeConstraint) result = clipPolygon(result, eastOfLongitude);
    if (hasLatitudeConstraint) result = clipPolygon(result, southOfLatitude);
    return result;
}

function crossProduct([leftX, leftY]: Coordinate, [rightX, rightY]: Coordinate) {
    return leftX * rightY - leftY * rightX;
}

function subtractCoordinates([leftX, leftY]: Coordinate, [rightX, rightY]: Coordinate): Coordinate {
    return [leftX - rightX, leftY - rightY];
}

function containsCoordinate([longitude, latitude]: Coordinate, polygon: Coordinate[]) {
    let isInside = false;

    for (let index = 0, previousIndex = polygon.length - 1; index < polygon.length; previousIndex = index, index += 1) {
        const [currentLongitude, currentLatitude] = polygon[index]!;
        const [previousLongitude, previousLatitude] = polygon[previousIndex]!;
        const crossesLatitude = currentLatitude > latitude !== previousLatitude > latitude;
        const crossingLongitude = (previousLongitude - currentLongitude)
            * (latitude - currentLatitude)
            / (previousLatitude - currentLatitude)
            + currentLongitude;

        if (crossesLatitude && longitude < crossingLongitude) isInside = !isInside;
    }

    return isInside;
}

type RingIntersection = {
    coordinate: Coordinate;
    candidateSegment: number;
    candidateProgress: number;
    excludedSegment: number;
    excludedProgress: number;
};

function segmentIntersection(
    candidateStart: Coordinate,
    candidateEnd: Coordinate,
    excludedStart: Coordinate,
    excludedEnd: Coordinate,
) {
    const candidateVector = subtractCoordinates(candidateEnd, candidateStart);
    const excludedVector = subtractCoordinates(excludedEnd, excludedStart);
    const denominator = crossProduct(candidateVector, excludedVector);
    if (Math.abs(denominator) < 1e-12) return null;

    const startsDelta = subtractCoordinates(excludedStart, candidateStart);
    const candidateProgress = crossProduct(startsDelta, excludedVector) / denominator;
    const excludedProgress = crossProduct(startsDelta, candidateVector) / denominator;
    const tolerance = 1e-10;
    if (
        candidateProgress < -tolerance
        || candidateProgress > 1 + tolerance
        || excludedProgress < -tolerance
        || excludedProgress > 1 + tolerance
    ) return null;

    return {
        coordinate: [
            candidateStart[0] + candidateVector[0] * candidateProgress,
            candidateStart[1] + candidateVector[1] * candidateProgress,
        ] as Coordinate,
        candidateProgress,
        excludedProgress,
    };
}

function forwardRingPath(
    ring: Coordinate[],
    startSegment: number,
    startCoordinate: Coordinate,
    endSegment: number,
    endCoordinate: Coordinate,
) {
    const path = [startCoordinate];
    let segment = startSegment;

    while (segment !== endSegment) {
        path.push(ring[(segment + 1) % ring.length]!);
        segment = (segment + 1) % ring.length;
    }

    path.push(endCoordinate);
    return path;
}

function pathSample(path: Coordinate[]) {
    const middle = Math.max(0, Math.floor((path.length - 1) / 2));
    const start = path[middle]!;
    const end = path[Math.min(middle + 1, path.length - 1)]!;
    return [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2] as Coordinate;
}

/** Traces the single remaining boundary when an excluded convex area cuts into a candidate polygon. */
function playableBoundaryAfterExclusion(candidate: Coordinate[], excluded: Coordinate[]) {
    const intersections: RingIntersection[] = [];

    for (let candidateSegment = 0; candidateSegment < candidate.length; candidateSegment += 1) {
        const candidateStart = candidate[candidateSegment]!;
        const candidateEnd = candidate[(candidateSegment + 1) % candidate.length]!;

        for (let excludedSegment = 0; excludedSegment < excluded.length; excludedSegment += 1) {
            const intersection = segmentIntersection(
                candidateStart,
                candidateEnd,
                excluded[excludedSegment]!,
                excluded[(excludedSegment + 1) % excluded.length]!,
            );
            if (!intersection) continue;

            const isDuplicate = intersections.some(({ coordinate }) =>
                Math.abs(coordinate[0] - intersection.coordinate[0]) < 1e-9
                && Math.abs(coordinate[1] - intersection.coordinate[1]) < 1e-9,
            );
            if (!isDuplicate) {
                intersections.push({
                    ...intersection,
                    candidateSegment,
                    excludedSegment,
                });
            }
        }
    }

    if (intersections.length !== 2) return null;
    const [first, second] = intersections as [RingIntersection, RingIntersection];
    const candidatePaths = [
        forwardRingPath(
            candidate,
            first.candidateSegment,
            first.coordinate,
            second.candidateSegment,
            second.coordinate,
        ),
        forwardRingPath(
            candidate,
            second.candidateSegment,
            second.coordinate,
            first.candidateSegment,
            first.coordinate,
        ),
    ];
    const candidatePath = candidatePaths.find((path) =>
        !containsCoordinate(pathSample(path), excluded),
    );
    if (!candidatePath) return null;

    const startsAtFirst = candidatePath[0] === first.coordinate;
    const pathEnd = startsAtFirst ? second : first;
    const pathStart = startsAtFirst ? first : second;
    const excludedPaths = [
        forwardRingPath(
            excluded,
            pathEnd.excludedSegment,
            pathEnd.coordinate,
            pathStart.excludedSegment,
            pathStart.coordinate,
        ),
        forwardRingPath(
            excluded,
            pathStart.excludedSegment,
            pathStart.coordinate,
            pathEnd.excludedSegment,
            pathEnd.coordinate,
        ).toReversed(),
    ];
    const excludedPath = excludedPaths.find((path) =>
        containsCoordinate(pathSample(path), candidate),
    );
    if (!excludedPath) return null;

    return [...candidatePath, ...excludedPath.slice(1, -1)];
}

function playableAreaBounds(candidateArea: Coordinate[], excludedArea: Coordinate[] | null) {
    const boundaryCoordinates = excludedArea
        ? [
            ...candidateArea.filter((coordinate) => !containsCoordinate(coordinate, excludedArea)),
            ...excludedArea.filter((coordinate) => containsCoordinate(coordinate, candidateArea)),
        ]
        : candidateArea;
    const coordinates = boundaryCoordinates.length > 0 ? boundaryCoordinates : candidateArea;
    const longitudes = coordinates.map(([longitude]) => longitude);
    const latitudes = coordinates.map(([, latitude]) => latitude);

    return [
        [Math.min(...longitudes), Math.min(...latitudes)],
        [Math.max(...longitudes), Math.max(...latitudes)],
    ] as [[number, number], [number, number]];
}

function switzerlandBoundarySegment([longitude, latitude]: Coordinate) {
    const tolerance = 1e-8;

    for (let segment = 0; segment < SWITZERLAND_OUTLINE.length; segment += 1) {
        const start = SWITZERLAND_OUTLINE[segment]!;
        const end = SWITZERLAND_OUTLINE[(segment + 1) % SWITZERLAND_OUTLINE.length]!;
        const vector = subtractCoordinates(end, start);
        const pointVector = subtractCoordinates([longitude, latitude], start);
        const lengthSquared = vector[0] ** 2 + vector[1] ** 2;
        if (lengthSquared === 0) continue;

        const progress = (pointVector[0] * vector[0] + pointVector[1] * vector[1]) / lengthSquared;
        if (progress < -tolerance || progress > 1 + tolerance) continue;

        const distance = Math.abs(crossProduct(vector, pointVector)) / Math.sqrt(lengthSquared);
        if (distance <= tolerance) return segment;
    }

    return null;
}

/**
 * Converts a playable ring that touches Switzerland's edge into the complementary
 * eliminated exterior ring. This avoids invalid GeoJSON holes that touch their shell.
 */
function eliminatedBoundaryFromPlayableArea(playableArea: Coordinate[]) {
    const boundaryEdges = playableArea.map((coordinate, index) => {
        const next = playableArea[(index + 1) % playableArea.length]!;
        const midpoint: Coordinate = [
            (coordinate[0] + next[0]) / 2,
            (coordinate[1] + next[1]) / 2,
        ];
        return switzerlandBoundarySegment(midpoint) !== null;
    });
    const boundaryEdge = boundaryEdges.findIndex(Boolean);
    if (boundaryEdge === -1 || boundaryEdges.every(Boolean)) return null;

    const internalChains: Coordinate[][] = [];
    let chain: Coordinate[] | null = null;
    for (let offset = 1; offset <= playableArea.length; offset += 1) {
        const edge = (boundaryEdge + offset) % playableArea.length;
        if (!boundaryEdges[edge]) {
            chain ??= [playableArea[edge]!];
            chain.push(playableArea[(edge + 1) % playableArea.length]!);
        } else if (chain) {
            internalChains.push(chain);
            chain = null;
        }
    }
    if (chain) internalChains.push(chain);

    const internalChain = internalChains.toSorted((left, right) => right.length - left.length)[0];
    if (!internalChain || internalChain.length < 2) return null;

    const chainStart = internalChain[0]!;
    const chainEnd = internalChain.at(-1)!;
    const startSegment = switzerlandBoundarySegment(chainStart);
    const endSegment = switzerlandBoundarySegment(chainEnd);
    if (startSegment === null || endSegment === null) return null;

    const complementarySwissPath = forwardRingPath(
        SWITZERLAND_OUTLINE,
        startSegment,
        chainStart,
        endSegment,
        chainEnd,
    ).toReversed();

    return [...internalChain, ...complementarySwissPath.slice(1, -1)];
}

function eliminatedAreaFeature(
    candidateArea: Coordinate[],
    radarMissCircle: Coordinate[] | null,
): GeoJSON.Feature<GeoJSON.Polygon, { id: string }> {
    const playableArea = radarMissCircle
        ? playableBoundaryAfterExclusion(candidateArea, radarMissCircle) ?? candidateArea
        : candidateArea;
    const eliminatedBoundary = eliminatedBoundaryFromPlayableArea(playableArea);

    return {
        type: "Feature",
        properties: { id: "season-nine-eliminated-area" },
        geometry: {
            type: "Polygon",
            coordinates: eliminatedBoundary
                ? [orientedRing(eliminatedBoundary, false)]
                : [
                    orientedRing(SWITZERLAND_OUTLINE, false),
                    orientedRing(playableArea, true),
                ],
        },
    };
}

function SwitzerlandMask() {
    const { map, isLoaded, resolvedTheme } = useMap();

    useEffect(() => {
        if (!map || !isLoaded) return;

        for (const layerId of COUNTRY_LABEL_LAYER_IDS) {
            if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "visibility", "none");
        }
        for (const [layerId, filter] of Object.entries(SWISS_CITY_FILTERS)) {
            if (map.getLayer(layerId)) map.setFilter(layerId, filter);
        }
    }, [isLoaded, map]);

    return (
        <MapGeoJSON
            id="season-nine-switzerland-mask"
            data={SWITZERLAND_MASK}
            beforeId="place_city_r6"
            fillPaint={{
                "fill-color": MAPLIBRE_INVESTIGATION_COLORS.outside[resolvedTheme],
                "fill-opacity": 1,
            }}
            linePaint={false}
        />
    );
}

export function InvestigationMap({ state }: { state: SeasonNineState }) {
    const answeredQuestionIds = useMemo(
        () => new Set(
            state.questions
                .filter((question) => question.status === "answered")
                .map((question) => question.id),
        ),
        [state.questions],
    );
    const hasLongitudeConstraint = answeredQuestionIds.has("longitude");
    const hasLatitudeConstraint = answeredQuestionIds.has("latitude");
    const hasGoldauRadarMiss = answeredQuestionIds.has("25-miles");
    const hasAndermattRadarHit = answeredQuestionIds.has("10-miles");
    const hasSearchConstraint = hasLongitudeConstraint
        || hasLatitudeConstraint
        || hasGoldauRadarMiss
        || hasAndermattRadarHit
        || state.endgame;

    const mapGeometry = useMemo(() => {
        const preciseArea = state.endgame
            ? circleCoordinates(HOSPENTAL_STATION, 0.5)
            : hasAndermattRadarHit
                ? circleCoordinates(ANDERMATT_STATION, 10)
                : SWITZERLAND_OUTLINE;
        const constrainedArea = applyDirectionalHints(
            preciseArea,
            hasLongitudeConstraint,
            hasLatitudeConstraint,
        );
        if (constrainedArea.length < 3) {
            return {
                eliminatedArea: null,
                playableBounds: playableAreaBounds(SWITZERLAND_OUTLINE, null),
            };
        }

        const radarMissCircle = hasGoldauRadarMiss
            ? circleCoordinates(GOLDAU_STATION, 25)
            : null;
        return {
            eliminatedArea: hasSearchConstraint
                ? eliminatedAreaFeature(constrainedArea, radarMissCircle)
                : null,
            playableBounds: playableAreaBounds(constrainedArea, radarMissCircle),
        };
    }, [
        hasAndermattRadarHit,
        hasGoldauRadarMiss,
        hasLatitudeConstraint,
        hasLongitudeConstraint,
        hasSearchConstraint,
        state.endgame,
    ]);

    return (
        <div className="bg-map-canvas relative h-72 overflow-hidden">
            <Map
                bounds={SWITZERLAND_BOUNDS}
                fitBoundsOptions={{ padding: 24 }}
                minZoom={5.5}
                maxZoom={MAP_MAX_ZOOM}
                attributionControl={false}
                dragRotate={false}
                touchPitch={false}
            >
                <SwitzerlandMask />
                {mapGeometry.eliminatedArea && (
                    <MapGeoJSON
                        id="season-nine-eliminated-area"
                        data={mapGeometry.eliminatedArea}
                        fillPaint={{
                            "fill-color": MAPLIBRE_INVESTIGATION_COLORS.eliminated,
                            "fill-opacity": 0.62,
                        }}
                        linePaint={false}
                    />
                )}
                <MapControls
                    resetView={{
                        bounds: mapGeometry.playableBounds,
                        padding: 24,
                        maxZoom: MAP_MAX_ZOOM,
                    }}
                />
            </Map>
        </div>
    );
}
