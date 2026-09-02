import { seasonEighteen } from "@/data/season-18";
import {
    compareTimestamps,
    createTimestampProjection,
} from "@/lib/timestamps";
import type { Coordinate } from "./tracker-routes";
import type { SeasonEighteenEpisodeTimestamp } from "./types";

export type MapFrame = Readonly<{
    center: Coordinate;
    zoom: number;
}>;

const MAP_FRAMES = {
    newYork: { center: [-73.92, 40.76], zoom: 10.7 },
    flights: { center: [-83.7, 39.3], zoom: 4.25 },
    split: { center: [-87.96, 38.54], zoom: 5 },
    episodeTwoRoadtrip: { center: [-83.5, 38.5], zoom: 3.65 },
    episodeTwoFlights: { center: [-80.5, 39.5], zoom: 3.85 },
    episodeThree: { center: [-80.8, 39.7], zoom: 3.7 },
    episodeFour: { center: [-87.2, 40.3], zoom: 3.15 },
    episodeFive: { center: [-84.8, 42.2], zoom: 3.1 },
    finale: { center: [-74.7, 39.7], zoom: 3.9 },
} as const satisfies Record<string, MapFrame>;

type MapFrameWindow = Readonly<{
    start: SeasonEighteenEpisodeTimestamp;
    frame: MapFrame;
}>;

// Each window starts when the tracker map should reframe. Episode opens are
// included so crossing into a new Episode advances the projection revision.
const mapFrameWindows = [
    { start: { episode: "episode-1", at: 0 }, frame: MAP_FRAMES.newYork },
    { start: { episode: "episode-1", at: 10 * 60 + 43 }, frame: MAP_FRAMES.flights },
    { start: { episode: "episode-1", at: 15 * 60 + 59 }, frame: MAP_FRAMES.split },
    { start: { episode: "episode-2", at: 0 }, frame: MAP_FRAMES.episodeTwoRoadtrip },
    { start: { episode: "episode-2", at: 30 * 60 + 13 }, frame: MAP_FRAMES.episodeTwoFlights },
    { start: { episode: "episode-3", at: 0 }, frame: MAP_FRAMES.episodeThree },
    { start: { episode: "episode-4", at: 0 }, frame: MAP_FRAMES.episodeFour },
    { start: { episode: "episode-5", at: 0 }, frame: MAP_FRAMES.episodeFive },
    { start: { episode: "finale", at: 0 }, frame: MAP_FRAMES.finale },
] as const satisfies readonly MapFrameWindow[];

const mapFrameBoundaries = mapFrameWindows.map(({ start }) => start);

export const getMapFrame = createTimestampProjection({
    season: seasonEighteen,
    boundaries: mapFrameBoundaries,
    project: (timestamp): MapFrame => {
        const window = mapFrameWindows.findLast((candidate) =>
            compareTimestamps(seasonEighteen, candidate.start, timestamp) <= 0
        );
        return window?.frame ?? MAP_FRAMES.newYork;
    },
});
