"use client";

import type * as GeoJSON from "geojson";
import type { FilterSpecification } from "maplibre-gl";
import { useEffect, useMemo } from "react";
import {
    CENTRE_PARTY_CANTONS_URL,
    NON_MITTELLAND_REGIONS_URL,
    ZURICH_CANTON_URL,
} from "@/generated/geojson-assets";
import { Map, MapControls, MapGeoJSON, useMap } from "@/components/ui/map";
import { MAPLIBRE_INVESTIGATION_COLORS } from "@/components/ui/map-colors";
import { useGeoJson } from "@/lib/geojson";
import { useSwitzerlandGeoJson } from "@/lib/switzerland-geojson";
import { getInvestigationMapResetBounds } from "./investigation-map-bounds";
import type { SeekersTrackerState } from "./seekers-tracker-data";
import { SeekersTrackerOverlay } from "./seekers-tracker-overlay";
import type { SeasonNineState } from "./timeline-data";

type Coordinate = [number, number];

const MIN_HIDER_LONGITUDE = 8.3093;
const ADAM_FINALE_MIN_HIDER_LONGITUDE = 7.44115;
const MAX_HIDER_LATITUDE = 47.0502;
const MEGGEN_STATION: Coordinate = [8.38306, 47.05015];
const SAM_MEGGEN_LONGITUDE_EVENT_ID = "47d454a3-2b4c-41a4-9bd9-019d41f92123";
const ADAM_FINALE_LONGITUDE_EVENT_ID = "3aed6dee-dbaa-4bcb-8e15-c628332087d9";
const SAM_PLATEAU_REGION_EVENT_ID = "7752ab74-3e56-4059-9f2f-c2279f090382";
const SAM_ZURICH_CANTON_EVENT_ID = "902d3f18-9259-47e5-9b91-fca5e7933e0c";
const ADAM_NOT_ZURICH_CANTON_EVENT_ID = "ce2c3fcf-64fe-43d5-8604-8b31af974b11";
const ARTH_GOLDAU_STATION: Coordinate = [8.54965, 47.04913];
const ANDERMATT_STATION: Coordinate = [8.59333, 46.63684];
const STEINEN_STATION: Coordinate = [8.60747, 47.04769];
const GISIKON_ROOT_STATION: Coordinate = [8.39472, 47.12118];
const WINTERTHUR_STATION: Coordinate = [8.72397, 47.50031];
const BERN_STATION: Coordinate = [7.43996, 46.94891];
const SOLOTHURN_STATION: Coordinate = [7.54268, 47.20425];
const STADION_SCHUETZENWIESE: Coordinate = [8.71813, 47.50075];
const HOSPENTAL_STATION: Coordinate = [8.5696, 46.6195];
// const WINTERTHUR_TOESS_STATION: Coordinate = [8.7093, 47.4898];
const WINTERTHUR_TOESS_STATION: Coordinate = [8.7121341, 47.4953199];
const MERLISCHACHEN_STATION: Coordinate = [8.409058, 47.06766];
const MAP_MAX_ZOOM = 22;
const COUNTRY_LABEL_LAYER_IDS = ["place_country_1", "place_country_2"] as const;
type CentrePartyCantons = GeoJSON.FeatureCollection<
    GeoJSON.Polygon | GeoJSON.MultiPolygon,
    { id: number; name: string }
>;
type NonMittellandRegions = GeoJSON.FeatureCollection<
    GeoJSON.Polygon | GeoJSON.MultiPolygon,
    { id: number; region: string; subregion: string }
>;
type ZurichCanton = GeoJSON.FeatureCollection<
    GeoJSON.Polygon,
    { id: number; name: string }
>;

type RadarConstraintDefinition = {
    center: Coordinate;
    radiusMiles: number;
    result: "hit" | "miss";
};

const RADAR_CONSTRAINTS_BY_EVENT_ID: Readonly<Record<string, RadarConstraintDefinition>> = {
    "97128882-7671-4d04-869d-90c58e530401": {
        center: ARTH_GOLDAU_STATION,
        radiusMiles: 25,
        result: "miss",
    },
    "1f5fd38f-49b2-4a69-bab9-6cad868f04c2": {
        center: ANDERMATT_STATION,
        radiusMiles: 10,
        result: "hit",
    },
    "50fb97fd-1dbd-4674-bd9a-6fb909e9bcb2": {
        center: STEINEN_STATION,
        radiusMiles: 25,
        result: "hit",
    },
    "5b99c4ce-933f-4cf2-b01c-b46b0e6779e1": {
        center: GISIKON_ROOT_STATION,
        radiusMiles: 25,
        result: "miss",
    },
    "d26f2a5e-c47d-4fa5-8e30-f1f22710b67c": {
        center: WINTERTHUR_STATION,
        radiusMiles: 5,
        result: "hit",
    },
    "6ab7d123-8c75-4f62-8777-95fee10fa23f": {
        center: STADION_SCHUETZENWIESE,
        radiusMiles: 0.5,
        result: "miss",
    },
    "c34befe7-d37d-44e0-bfb1-7fea4aa415a7": {
        center: WINTERTHUR_STATION,
        radiusMiles: 50,
        result: "miss",
    },
    "3300d096-2ffd-4ce7-b2ed-a84dbfd04553": {
        center: BERN_STATION,
        radiusMiles: 10,
        result: "miss",
    },
    "492385e2-2ea0-4914-a2c4-ac7279889aca": {
        center: BERN_STATION,
        radiusMiles: 25,
        result: "hit",
    },
    "c2243c5c-1671-441a-9732-39b24653dfbc": {
        center: SOLOTHURN_STATION,
        radiusMiles: 5,
        result: "miss",
    },
};

function swissCityFilters(
    switzerlandFeature: GeoJSON.Feature<GeoJSON.Polygon>,
): Record<string, FilterSpecification> {
    const withinSwitzerland: FilterSpecification = ["within", switzerlandFeature];

    return {
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
}

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

function polygonContainsCoordinate(polygon: Coordinate[][], coordinate: Coordinate) {
    const [outerRing, ...holes] = polygon;
    if (!outerRing) return false;
    const outerBounds = polygonBounds(outerRing);
    if (!createPolygonContainmentIndex(outerRing, outerBounds)(coordinate)) return false;

    return !holes.some((hole) => {
        const holeBounds = polygonBounds(hole);
        return createPolygonContainmentIndex(hole, holeBounds)(coordinate);
    });
}

function ringInteriorCoordinate(ring: Coordinate[]) {
    const bounds = polygonBounds(ring);
    const scale = Math.max(
        bounds.maxLongitude - bounds.minLongitude,
        bounds.maxLatitude - bounds.minLatitude,
    );
    const contains = createPolygonContainmentIndex(ring, bounds);
    const clockwise = ringArea(ring) < 0;

    for (let index = 0; index < ring.length; index += 1) {
        const start = ring[index]!;
        const end = ring[(index + 1) % ring.length]!;
        const vector = subtractCoordinates(end, start);
        const length = Math.hypot(vector[0], vector[1]);
        if (length < 1e-10) continue;

        const midpoint: Coordinate = [
            (start[0] + end[0]) / 2,
            (start[1] + end[1]) / 2,
        ];
        const inwardNormal: Coordinate = clockwise
            ? [vector[1] / length, -vector[0] / length]
            : [-vector[1] / length, vector[0] / length];

        for (const scaleFactor of [1e-7, 1e-8, 1e-9, 1e-10]) {
            const offset = Math.min(scale * scaleFactor, length * 1e-3);
            const candidate: Coordinate = [
                midpoint[0] + inwardNormal[0] * offset,
                midpoint[1] + inwardNormal[1] * offset,
            ];
            if (contains(candidate)) return candidate;
        }
    }

    throw new Error("Unable to find an interior coordinate for a generated map ring.");
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

function applyDirectionalHints(
    coordinates: Coordinate[],
    minimumLongitude: number | null,
    hasLatitudeConstraint: boolean,
) {
    // Keep each hint as a separate candidate polygon. Clipping a concave outline
    // into one ring can incorrectly join disconnected pieces when the outline
    // crosses the hint boundary more than twice (Switzerland crosses 8.3093°E four times).
    const candidateAreas = [coordinates];
    if (minimumLongitude !== null || hasLatitudeConstraint) {
        const bounds = polygonBounds(coordinates);
        const padding = Math.max(
            bounds.maxLongitude - bounds.minLongitude,
            bounds.maxLatitude - bounds.minLatitude,
            1,
        );
        const westernEdge = minimumLongitude ?? bounds.minLongitude - padding;
        const easternEdge = bounds.maxLongitude + padding;
        const southernEdge = bounds.minLatitude - padding;
        const northernEdge = hasLatitudeConstraint
            ? MAX_HIDER_LATITUDE
            : bounds.maxLatitude + padding;
        candidateAreas.push([
            [westernEdge, southernEdge],
            [easternEdge, southernEdge],
            [easternEdge, northernEdge],
            [westernEdge, northernEdge],
        ]);
    }
    return candidateAreas;
}

function crossProduct([leftX, leftY]: Coordinate, [rightX, rightY]: Coordinate) {
    return leftX * rightY - leftY * rightX;
}

function subtractCoordinates([leftX, leftY]: Coordinate, [rightX, rightY]: Coordinate): Coordinate {
    return [leftX - rightX, leftY - rightY];
}

type BoundarySegment = {
    start: Coordinate;
    end: Coordinate;
    cuts: number[];
    bounds: ReturnType<typeof polygonBounds>;
};

function segmentIntersection(left: BoundarySegment, right: BoundarySegment) {
    const leftVector = subtractCoordinates(left.end, left.start);
    const rightVector = subtractCoordinates(right.end, right.start);
    const denominator = crossProduct(leftVector, rightVector);
    if (Math.abs(denominator) < 1e-12) return null;

    const startsDelta = subtractCoordinates(right.start, left.start);
    const leftProgress = crossProduct(startsDelta, rightVector) / denominator;
    const rightProgress = crossProduct(startsDelta, leftVector) / denominator;
    const tolerance = 1e-10;
    if (
        leftProgress < -tolerance
        || leftProgress > 1 + tolerance
        || rightProgress < -tolerance
        || rightProgress > 1 + tolerance
    ) return null;

    return {
        leftProgress: Math.max(0, Math.min(1, leftProgress)),
        rightProgress: Math.max(0, Math.min(1, rightProgress)),
    };
}

function polygonBounds(polygon: Coordinate[]) {
    return polygon.reduce(
        (bounds, [longitude, latitude]) => ({
            minLongitude: Math.min(bounds.minLongitude, longitude),
            minLatitude: Math.min(bounds.minLatitude, latitude),
            maxLongitude: Math.max(bounds.maxLongitude, longitude),
            maxLatitude: Math.max(bounds.maxLatitude, latitude),
        }),
        {
            minLongitude: Infinity,
            minLatitude: Infinity,
            maxLongitude: -Infinity,
            maxLatitude: -Infinity,
        },
    );
}

function createPolygonContainmentIndex(
    polygon: Coordinate[],
    bounds: ReturnType<typeof polygonBounds>,
) {
    const rowCount = 64;
    const height = bounds.maxLatitude - bounds.minLatitude || 1;
    const rows = Array.from({ length: rowCount }, () => [] as number[]);
    const rowForLatitude = (latitude: number) => Math.max(0, Math.min(
        rowCount - 1,
        Math.floor((latitude - bounds.minLatitude) / height * rowCount),
    ));

    polygon.forEach((coordinate, index) => {
        const next = polygon[(index + 1) % polygon.length]!;
        const minRow = rowForLatitude(Math.min(coordinate[1], next[1]));
        const maxRow = rowForLatitude(Math.max(coordinate[1], next[1]));
        for (let row = minRow; row <= maxRow; row += 1) rows[row]!.push(index);
    });

    return ([longitude, latitude]: Coordinate) => {
        if (
            longitude < bounds.minLongitude
            || longitude > bounds.maxLongitude
            || latitude < bounds.minLatitude
            || latitude > bounds.maxLatitude
        ) return false;

        let isInside = false;
        for (const index of rows[rowForLatitude(latitude)]!) {
            const [currentLongitude, currentLatitude] = polygon[index]!;
            const [nextLongitude, nextLatitude] = polygon[(index + 1) % polygon.length]!;
            const crossesLatitude = currentLatitude > latitude !== nextLatitude > latitude;
            const crossingLongitude = (nextLongitude - currentLongitude)
                * (latitude - currentLatitude)
                / (nextLatitude - currentLatitude)
                + currentLongitude;
            if (crossesLatitude && longitude < crossingLongitude) isInside = !isInside;
        }
        return isInside;
    };
}

function boundsOverlap(left: ReturnType<typeof polygonBounds>, right: ReturnType<typeof polygonBounds>) {
    return left.minLongitude <= right.maxLongitude
        && left.maxLongitude >= right.minLongitude
        && left.minLatitude <= right.maxLatitude
        && left.maxLatitude >= right.minLatitude;
}

function polygonSegments(polygon: Coordinate[]) {
    return polygon.map((start, index) => {
        const end = polygon[(index + 1) % polygon.length]!;
        return {
            start,
            end,
            cuts: [0, 1],
            bounds: {
                minLongitude: Math.min(start[0], end[0]),
                minLatitude: Math.min(start[1], end[1]),
                maxLongitude: Math.max(start[0], end[0]),
                maxLatitude: Math.max(start[1], end[1]),
            },
        };
    });
}

function coordinateAt(segment: BoundarySegment, progress: number): Coordinate {
    return [
        segment.start[0] + (segment.end[0] - segment.start[0]) * progress,
        segment.start[1] + (segment.end[1] - segment.start[1]) * progress,
    ];
}

function coordinateKey([longitude, latitude]: Coordinate) {
    return `${longitude.toFixed(8)},${latitude.toFixed(8)}`;
}

type BoundaryPolygon = {
    bounds: ReturnType<typeof polygonBounds>;
    contains: (coordinate: Coordinate) => boolean;
    coordinates: Coordinate[];
    segments: BoundarySegment[];
};

function addPolygonIntersections(left: BoundaryPolygon, right: BoundaryPolygon) {
    const columnCount = 32;
    const rowCount = 32;
    const width = right.bounds.maxLongitude - right.bounds.minLongitude || 1;
    const height = right.bounds.maxLatitude - right.bounds.minLatitude || 1;
    const buckets = new globalThis.Map<string, number[]>();
    const cellIndex = (value: number, minimum: number, size: number, count: number) => (
        Math.max(0, Math.min(count - 1, Math.floor((value - minimum) / size * count)))
    );
    const cellRange = (bounds: ReturnType<typeof polygonBounds>) => ({
        minColumn: cellIndex(
            bounds.minLongitude,
            right.bounds.minLongitude,
            width,
            columnCount,
        ),
        maxColumn: cellIndex(
            bounds.maxLongitude,
            right.bounds.minLongitude,
            width,
            columnCount,
        ),
        minRow: cellIndex(bounds.minLatitude, right.bounds.minLatitude, height, rowCount),
        maxRow: cellIndex(bounds.maxLatitude, right.bounds.minLatitude, height, rowCount),
    });

    right.segments.forEach((segment, segmentIndex) => {
        const range = cellRange(segment.bounds);
        for (let column = range.minColumn; column <= range.maxColumn; column += 1) {
            for (let row = range.minRow; row <= range.maxRow; row += 1) {
                const key = `${column}:${row}`;
                buckets.set(key, [...buckets.get(key) ?? [], segmentIndex]);
            }
        }
    });

    for (const leftSegment of left.segments) {
        const range = cellRange(leftSegment.bounds);
        const candidates = new Set<number>();
        for (let column = range.minColumn; column <= range.maxColumn; column += 1) {
            for (let row = range.minRow; row <= range.maxRow; row += 1) {
                for (const segmentIndex of buckets.get(`${column}:${row}`) ?? []) {
                    candidates.add(segmentIndex);
                }
            }
        }

        for (const segmentIndex of candidates) {
            const rightSegment = right.segments[segmentIndex]!;
            if (!boundsOverlap(leftSegment.bounds, rightSegment.bounds)) continue;
            const intersection = segmentIntersection(leftSegment, rightSegment);
            if (!intersection) continue;
            leftSegment.cuts.push(intersection.leftProgress);
            rightSegment.cuts.push(intersection.rightProgress);
        }
    }
}

function playableAreaBounds(candidateArea: Coordinate[]) {
    const longitudes = candidateArea.map(([longitude]) => longitude);
    const latitudes = candidateArea.map(([, latitude]) => latitude);

    return [
        [Math.min(...longitudes), Math.min(...latitudes)],
        [Math.max(...longitudes), Math.max(...latitudes)],
    ] as [[number, number], [number, number]];
}

function intersectPlayableAreaBounds(candidateAreas: Coordinate[][]) {
    const [firstArea, ...remainingAreas] = candidateAreas;
    if (!firstArea) throw new Error("At least one candidate area is required.");

    return remainingAreas
        .map(playableAreaBounds)
        .reduce<[[number, number], [number, number]]>((intersection, bounds) => [
            [
                Math.max(intersection[0][0], bounds[0][0]),
                Math.max(intersection[0][1], bounds[0][1]),
            ],
            [
                Math.min(intersection[1][0], bounds[1][0]),
                Math.min(intersection[1][1], bounds[1][1]),
            ],
        ], playableAreaBounds(firstArea));
}

function polygonOuterRings(
    geoJson: GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon>,
) {
    return geoJson.features.flatMap((feature) => {
        const polygons = feature.geometry.type === "Polygon"
            ? [feature.geometry.coordinates]
            : feature.geometry.coordinates;

        return polygons.map(([outerRing]) => outerRing!.slice(0, -1).map(
            ([longitude, latitude]) => [longitude!, latitude!] as Coordinate,
        ));
    });
}

function regionBoundaryRings(
    areas: Coordinate[][],
    includesCoordinate: (coordinate: Coordinate, polygons: BoundaryPolygon[]) => boolean,
    minimumRingArea: number,
) {
    const polygons = areas.map((coordinates) => {
        const bounds = polygonBounds(coordinates);
        return {
            bounds,
            contains: createPolygonContainmentIndex(coordinates, bounds),
            coordinates,
            segments: polygonSegments(coordinates),
        };
    });

    for (let leftIndex = 0; leftIndex < polygons.length; leftIndex += 1) {
        const left = polygons[leftIndex]!;
        for (let rightIndex = leftIndex + 1; rightIndex < polygons.length; rightIndex += 1) {
            const right = polygons[rightIndex]!;
            if (!boundsOverlap(left.bounds, right.bounds)) continue;

            addPolygonIntersections(left, right);
        }
    }
    const boundarySegments: { start: Coordinate; end: Coordinate }[] = [];

    for (const polygon of polygons) {
        for (const segment of polygon.segments) {
            const cuts = segment.cuts
                .toSorted((left, right) => left - right)
                .filter((cut, index, sorted) => index === 0 || cut - sorted[index - 1]! > 1e-9);
            for (let index = 0; index < cuts.length - 1; index += 1) {
                const start = coordinateAt(segment, cuts[index]!);
                const end = coordinateAt(segment, cuts[index + 1]!);
                const vector = subtractCoordinates(end, start);
                const length = Math.hypot(vector[0], vector[1]);
                if (length < 1e-10) continue;

                const midpoint: Coordinate = [
                    (start[0] + end[0]) / 2,
                    (start[1] + end[1]) / 2,
                ];
                const sampleOffset: Coordinate = [
                    -vector[1] / length * 1e-7,
                    vector[0] / length * 1e-7,
                ];
                const leftIsIncluded = includesCoordinate([
                    midpoint[0] + sampleOffset[0],
                    midpoint[1] + sampleOffset[1],
                ], polygons);
                const rightIsIncluded = includesCoordinate([
                    midpoint[0] - sampleOffset[0],
                    midpoint[1] - sampleOffset[1],
                ], polygons);
                if (leftIsIncluded === rightIsIncluded) continue;
                boundarySegments.push(leftIsIncluded ? { start, end } : { start: end, end: start });
            }
        }
    }

    const outgoing = new globalThis.Map<string, number[]>();
    boundarySegments.forEach((segment, index) => {
        const key = coordinateKey(segment.start);
        outgoing.set(key, [...outgoing.get(key) ?? [], index]);
    });
    const used = new Set<number>();
    const rings: Coordinate[][] = [];

    for (let startIndex = 0; startIndex < boundarySegments.length; startIndex += 1) {
        if (used.has(startIndex)) continue;
        const first = boundarySegments[startIndex]!;
        const ring = [first.start];
        let currentIndex = startIndex;

        while (!used.has(currentIndex)) {
            used.add(currentIndex);
            const current = boundarySegments[currentIndex]!;
            ring.push(current.end);
            if (coordinateKey(current.end) === coordinateKey(first.start)) break;
            const nextIndex = outgoing.get(coordinateKey(current.end))?.find(
                (candidateIndex) => !used.has(candidateIndex),
            );
            if (nextIndex === undefined) break;
            currentIndex = nextIndex;
        }

        if (
            ring.length >= 4
            && coordinateKey(ring[0]!) === coordinateKey(ring.at(-1)!)
            && Math.abs(ringArea(ring)) > minimumRingArea
        ) rings.push(ring.slice(0, -1));
    }

    return rings;
}

function playableBoundaryRings(
    candidateAreas: Coordinate[][],
    excludedAreas: Coordinate[][],
    minimumRingArea: number,
) {
    return regionBoundaryRings(
        [...candidateAreas, ...excludedAreas],
        (coordinate, polygons) => {
            if (!polygons.slice(0, candidateAreas.length).every((polygon) => (
                polygon.contains(coordinate)
            ))) return false;
            return !polygons.slice(candidateAreas.length).some((polygon) => (
                polygon.contains(coordinate)
            ));
        },
        minimumRingArea,
    );
}

function eliminatedBoundaryRings(
    candidateAreas: Coordinate[][],
    excludedAreas: Coordinate[][],
    switzerlandOutline: Coordinate[],
    minimumRingArea: number,
) {
    const existingSwitzerlandIndex = candidateAreas.findIndex(
        (area) => area === switzerlandOutline,
    );
    const areas = existingSwitzerlandIndex === -1
        ? [...candidateAreas, ...excludedAreas, switzerlandOutline]
        : [...candidateAreas, ...excludedAreas];
    const switzerlandIndex = existingSwitzerlandIndex === -1
        ? areas.length - 1
        : existingSwitzerlandIndex;

    return regionBoundaryRings(
        areas,
        (coordinate, polygons) => {
            if (!polygons[switzerlandIndex]!.contains(coordinate)) return false;
            const isCandidate = polygons.slice(0, candidateAreas.length).every(
                (polygon) => polygon.contains(coordinate),
            );
            const isExcluded = polygons
                .slice(candidateAreas.length, candidateAreas.length + excludedAreas.length)
                .some((polygon) => polygon.contains(coordinate));
            return !isCandidate || isExcluded;
        },
        minimumRingArea,
    );
}

function polygonsFromBoundaryRings(rings: Coordinate[][]) {
    const polygons = rings
        .filter((ring) => ringArea(ring) > 0)
        .map((outerRing) => ({ outerRing, holes: [] as Coordinate[][] }));

    for (const hole of rings.filter((ring) => ringArea(ring) < 0)) {
        const interiorCoordinate = ringInteriorCoordinate(hole);
        const containingPolygon = polygons
            .filter(({ outerRing }) => polygonContainsCoordinate(
                [outerRing],
                interiorCoordinate,
            ))
            .toSorted((left, right) => (
                Math.abs(ringArea(left.outerRing)) - Math.abs(ringArea(right.outerRing))
            ))[0];
        containingPolygon?.holes.push(hole);
    }

    return polygons.map(({ outerRing, holes }) => [
        orientedRing(outerRing, false),
        ...holes.map((hole) => orientedRing(hole, true)),
    ]);
}

function combinedMapGeometry(
    candidateAreas: Coordinate[][],
    excludedAreas: Coordinate[][],
    switzerlandOutline: Coordinate[],
    minimumRingArea = 1e-10,
) {
    const candidateBounds = candidateAreas.map(polygonBounds).reduce((intersection, bounds) => ({
        minLongitude: Math.max(intersection.minLongitude, bounds.minLongitude),
        minLatitude: Math.max(intersection.minLatitude, bounds.minLatitude),
        maxLongitude: Math.min(intersection.maxLongitude, bounds.maxLongitude),
        maxLatitude: Math.min(intersection.maxLatitude, bounds.maxLatitude),
    }));
    const relevantExcludedAreas = excludedAreas
        .filter((area) => boundsOverlap(candidateBounds, polygonBounds(area)));
    const playableRings = playableBoundaryRings(
        candidateAreas,
        relevantExcludedAreas,
        minimumRingArea,
    );
    const playableOuterRings = playableRings.filter((ring) => ringArea(ring) > 0);
    const eliminatedRings = eliminatedBoundaryRings(
        candidateAreas,
        relevantExcludedAreas,
        switzerlandOutline,
        minimumRingArea,
    );
    const polygons = polygonsFromBoundaryRings(eliminatedRings);

    return {
        eliminatedArea: {
            type: "Feature",
            properties: { id: "season-nine-eliminated-area" },
            geometry: polygons.length === 1
                ? {
                    type: "Polygon",
                    coordinates: polygons[0]!,
                }
                : {
                    type: "MultiPolygon",
                    coordinates: polygons,
                },
        } satisfies GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, { id: string }>,
        playableBounds: playableOuterRings.length > 0
            ? playableAreaBounds(playableOuterRings.flat())
            : intersectPlayableAreaBounds(candidateAreas),
    };
}

function createSwitzerlandMask(switzerlandOutline: Coordinate[]) {
    return {
        type: "Feature",
        properties: { id: "season-nine-switzerland-mask" },
        geometry: {
            type: "Polygon",
            coordinates: [
                [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]],
                orientedRing(switzerlandOutline, true),
            ],
        },
    } satisfies GeoJSON.Feature<GeoJSON.Polygon, { id: string }>;
}

function SwitzerlandMask({
    mask,
    cityFilters,
}: {
    mask: GeoJSON.Feature<GeoJSON.Polygon, { id: string }>;
    cityFilters: Record<string, FilterSpecification>;
}) {
    const { map, isLoaded, resolvedTheme } = useMap();

    useEffect(() => {
        if (!map || !isLoaded) return;

        for (const layerId of COUNTRY_LABEL_LAYER_IDS) {
            if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "visibility", "none");
        }
        for (const [layerId, filter] of Object.entries(cityFilters)) {
            if (map.getLayer(layerId)) map.setFilter(layerId, filter);
        }
    }, [cityFilters, isLoaded, map]);

    return (
        <MapGeoJSON
            id="season-nine-switzerland-mask"
            data={mask}
            beforeId="place_city_r6"
            fillPaint={{
                "fill-color": MAPLIBRE_INVESTIGATION_COLORS.outside[resolvedTheme],
                "fill-opacity": 1,
            }}
            linePaint={false}
        />
    );
}

export function InvestigationMap({
    seekersTrackerState,
    state,
}: {
    seekersTrackerState: SeekersTrackerState;
    state: SeasonNineState;
}) {
    const switzerlandGeoJson = useSwitzerlandGeoJson();
    const runKey = `${state.currentRunStartedAt.episode}:${state.currentRunStartedAt.at}`;
    const switzerlandMap = useMemo(() => {
        const feature = switzerlandGeoJson?.features[0];
        if (!feature) return null;

        const outline = feature.geometry.coordinates[0]!.map(
            ([longitude, latitude]) => [longitude!, latitude!] as Coordinate,
        );
        return {
            bounds: playableAreaBounds(outline),
            cityFilters: swissCityFilters(feature),
            mask: createSwitzerlandMask(outline),
            outline,
        };
    }, [switzerlandGeoJson]);
    const answeredQuestionIds = useMemo(
        () => new Set(
            state.questions
                .filter((question) => question.status === "answered")
                .map((question) => question.id),
        ),
        [state.questions],
    );
    const radarConstraints = useMemo(
        () => state.questions.flatMap((question) => {
            if (question.status !== "answered") return [];
            const definition = RADAR_CONSTRAINTS_BY_EVENT_ID[question.eventId];
            return definition ? [{ ...definition, eventId: question.eventId }] : [];
        }),
        [state.questions],
    );
    const radarHit = radarConstraints
        .filter((constraint) => constraint.result === "hit")
        .at(-1);
    const isFirstAdamRun = state.currentHider === "adam"
        && state.currentRunStartedAt.episode === "episode-1"
        && state.currentRunStartedAt.at === 0;
    const hasLongitudeConstraint = isFirstAdamRun && answeredQuestionIds.has("longitude");
    const hasSamMeggenLongitudeConstraint = state.questions.some(
        (question) => question.status === "answered"
            && question.eventId === SAM_MEGGEN_LONGITUDE_EVENT_ID,
    );
    const hasAdamFinaleLongitudeConstraint = state.questions.some(
        (question) => question.status === "answered"
            && question.eventId === ADAM_FINALE_LONGITUDE_EVENT_ID,
    );
    const hasSamPlateauRegionConstraint = state.questions.some(
        (question) => question.status === "answered"
            && question.eventId === SAM_PLATEAU_REGION_EVENT_ID,
    );
    const hasSamZurichCantonConstraint = state.questions.some(
        (question) => question.status === "answered"
            && question.eventId === SAM_ZURICH_CANTON_EVENT_ID,
    );
    const hasAdamZurichCantonElimination = state.questions.some(
        (question) => question.status === "answered"
            && question.eventId === ADAM_NOT_ZURICH_CANTON_EVENT_ID,
    );
    const hasZurichCantonConstraint = hasSamZurichCantonConstraint
        || hasAdamZurichCantonElimination;
    const minimumHiderLongitude = hasSamMeggenLongitudeConstraint
        ? MEGGEN_STATION[0]
        : hasAdamFinaleLongitudeConstraint
            ? ADAM_FINALE_MIN_HIDER_LONGITUDE
            : hasLongitudeConstraint
                ? MIN_HIDER_LONGITUDE
                : null;
    const hasLatitudeConstraint = isFirstAdamRun && answeredQuestionIds.has("latitude");
    const hasCentrePartyElimination = answeredQuestionIds.has("political-party");
    const centrePartyCantons = useGeoJson<CentrePartyCantons>(
        hasCentrePartyElimination ? CENTRE_PARTY_CANTONS_URL : null,
    );
    const nonMittellandRegions = useGeoJson<NonMittellandRegions>(
        hasSamPlateauRegionConstraint ? NON_MITTELLAND_REGIONS_URL : null,
    );
    const zurichCanton = useGeoJson<ZurichCanton>(
        hasZurichCantonConstraint ? ZURICH_CANTON_URL : null,
    );
    const endgameStations = {
        sam: WINTERTHUR_TOESS_STATION,
        ben: MERLISCHACHEN_STATION,
        adam: isFirstAdamRun ? HOSPENTAL_STATION : null,
    } satisfies Record<SeasonNineState["currentHider"], Coordinate | null>;
    const endgameStation = endgameStations[state.currentHider];
    const hasPlayableAreaConstraint = minimumHiderLongitude !== null
        || hasLatitudeConstraint
        || radarHit !== undefined
        || hasSamZurichCantonConstraint
        || (state.endgame && endgameStation !== null);

    const mapGeometry = useMemo(() => {
        if (!switzerlandMap) return null;
        if (hasCentrePartyElimination && !centrePartyCantons) return null;
        if (hasSamPlateauRegionConstraint && !nonMittellandRegions) return null;
        if (hasZurichCantonConstraint && !zurichCanton) return null;

        const preciseArea = state.endgame && endgameStation
            ? circleCoordinates(endgameStation, 1)
            : radarHit
                ? circleCoordinates(radarHit.center, radarHit.radiusMiles)
                : switzerlandMap.outline;
        const directionalCandidateAreas = applyDirectionalHints(
            preciseArea,
            minimumHiderLongitude,
            hasLatitudeConstraint,
        );

        const cantonAreas = hasSamZurichCantonConstraint
            ? polygonOuterRings(zurichCanton!)
            : [];
        const candidateAreas = [...directionalCandidateAreas, ...cantonAreas];

        const biogeographicalAreas = hasSamPlateauRegionConstraint
            ? polygonOuterRings(nonMittellandRegions!)
            : [];
        const centrePartyAreas = hasCentrePartyElimination
            ? polygonOuterRings(centrePartyCantons!)
            : [];
        const excludedAreas = [
            ...biogeographicalAreas,
            ...centrePartyAreas,
            ...(hasAdamZurichCantonElimination ? polygonOuterRings(zurichCanton!) : []),
            ...radarConstraints
                .filter((constraint) => constraint.result === "miss")
                .map((constraint) => circleCoordinates(
                    constraint.center,
                    constraint.radiusMiles,
                )),
        ];
        const hasEliminatedArea = hasPlayableAreaConstraint || excludedAreas.length > 0;
        const combinedGeometry = hasEliminatedArea
            ? combinedMapGeometry(
                candidateAreas,
                excludedAreas,
                switzerlandMap.outline,
                hasSamPlateauRegionConstraint ? 5e-5 : undefined,
            )
            : null;

        return {
            eliminatedArea: combinedGeometry?.eliminatedArea ?? null,
            playableBounds: combinedGeometry?.playableBounds
                ?? intersectPlayableAreaBounds(candidateAreas),
        };
    }, [
        centrePartyCantons,
        hasAdamZurichCantonElimination,
        hasLatitudeConstraint,
        hasPlayableAreaConstraint,
        hasCentrePartyElimination,
        hasSamPlateauRegionConstraint,
        hasSamZurichCantonConstraint,
        hasZurichCantonConstraint,
        minimumHiderLongitude,
        nonMittellandRegions,
        endgameStation,
        radarConstraints,
        radarHit,
        state.endgame,
        switzerlandMap,
        zurichCanton,
    ]);
    const resetBounds = useMemo(
        () => mapGeometry && getInvestigationMapResetBounds(
            mapGeometry.playableBounds,
            seekersTrackerState,
        ),
        [mapGeometry, seekersTrackerState],
    );

    return (
        <div className="bg-map-canvas relative h-80 overflow-hidden sm:h-96">
            {switzerlandMap && mapGeometry && resetBounds && (
                <Map
                    key={runKey}
                    bounds={switzerlandMap.bounds}
                    fitBoundsOptions={{ padding: 24 }}
                    minZoom={5.5}
                    maxZoom={MAP_MAX_ZOOM}
                    dragRotate={false}
                    touchPitch={false}
                >
                    <SwitzerlandMask
                        mask={switzerlandMap.mask}
                        cityFilters={switzerlandMap.cityFilters}
                    />
                    {mapGeometry.eliminatedArea && (
                        <MapGeoJSON
                            id="season-nine-eliminated-area"
                            data={mapGeometry.eliminatedArea}
                            beforeId="place_city_r6"
                            fillPaint={{
                                "fill-color": MAPLIBRE_INVESTIGATION_COLORS.eliminated,
                                "fill-opacity": 0.62,
                            }}
                            linePaint={false}
                        />
                    )}
                    <SeekersTrackerOverlay
                        key={seekersTrackerState.id}
                        currentHider={state.currentHider}
                        state={seekersTrackerState}
                    />
                    <MapControls
                        resetView={{
                            bounds: resetBounds,
                            padding: 24,
                            maxZoom: MAP_MAX_ZOOM,
                        }}
                    />
                </Map>
            )}
        </div>
    );
}
