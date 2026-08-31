import { describe, expect, it, vi } from "vitest";
import {
    compareTimestamps,
    createTimestampProjection,
    type EpisodeTimestamp,
} from "./timestamps";

const season = {
    slug: "test-season",
    episodes: [
        { slug: "episode-1" },
        { slug: "episode-2" },
        { slug: "finale" },
    ],
} as const;

type EpisodeSlug = (typeof season.episodes)[number]["slug"];
type Timestamp = EpisodeTimestamp<EpisodeSlug>;

const facts = [
    { episode: "episode-1", at: 20, value: "first" },
    { episode: "episode-1", at: 20, value: "simultaneous" },
    { episode: "episode-2", at: 5, value: "second" },
] as const satisfies readonly (Timestamp & { value: string })[];

function timestamp(episode: EpisodeSlug, at: number): Timestamp {
    return { episode, at };
}

describe("createTimestampProjection", () => {
    it("returns one stable value throughout a visible revision", () => {
        const project = vi.fn((current: Timestamp) => ({
            visible: facts
                .filter((fact) => compareTimestamps(season, fact, current) <= 0)
                .map((fact) => fact.value),
        }));
        const getSnapshot = createTimestampProjection({
            season,
            boundaries: facts.toReversed(),
            project,
        });

        const beforeFirstBoundary = getSnapshot(timestamp("episode-1", 0));
        const sameRevision = getSnapshot(timestamp("episode-1", 19.9));

        expect(sameRevision).toBe(beforeFirstBoundary);
        expect(beforeFirstBoundary.visible).toEqual([]);
        expect(project).toHaveBeenCalledTimes(1);
    });

    it("makes boundaries inclusive and deduplicates simultaneous changes", () => {
        const project = vi.fn((current: Timestamp) => ({
            visible: facts
                .filter((fact) => compareTimestamps(season, fact, current) <= 0)
                .map((fact) => fact.value),
        }));
        const getSnapshot = createTimestampProjection({
            season,
            boundaries: facts,
            project,
        });

        const atBoundary = getSnapshot(timestamp("episode-1", 20));
        const sameRevision = getSnapshot(timestamp("episode-2", 4));

        expect(atBoundary.visible).toEqual(["first", "simultaneous"]);
        expect(sameRevision).toBe(atBoundary);
        expect(project).toHaveBeenCalledTimes(1);
    });

    it("retains only the latest revision and rederives after a rewind", () => {
        const project = vi.fn((current: Timestamp) => ({ at: current }));
        const getSnapshot = createTimestampProjection({
            season,
            boundaries: facts,
            project,
        });

        const earlier = getSnapshot(timestamp("episode-1", 20));
        const later = getSnapshot(timestamp("episode-2", 5));
        const rewound = getSnapshot(timestamp("episode-1", 20));

        expect(later).not.toBe(earlier);
        expect(rewound).not.toBe(earlier);
        expect(rewound).toEqual(earlier);
        expect(project).toHaveBeenCalledTimes(3);
    });

    it.each([
        { name: "an unknown Episode", boundary: timestamp("episode-1", 0), request: { episode: "missing", at: 0 } },
        { name: "a negative time", boundary: timestamp("episode-1", 0), request: { episode: "episode-1", at: -1 } },
        { name: "a non-finite time", boundary: timestamp("episode-1", 0), request: { episode: "episode-1", at: Number.NaN } },
    ])("rejects $name at query time", ({ boundary, request }) => {
        const getSnapshot = createTimestampProjection({
            season,
            boundaries: [boundary],
            project: () => ({}),
        });

        expect(() => getSnapshot(request as Timestamp)).toThrow(RangeError);
    });

    it.each([
        { episode: "missing", at: 0 },
        { episode: "episode-1", at: -1 },
        { episode: "episode-1", at: Number.POSITIVE_INFINITY },
    ])("rejects an invalid source boundary %#", (boundary) => {
        expect(() => createTimestampProjection({
            season,
            boundaries: [boundary as Timestamp],
            project: () => ({}),
        })).toThrow(RangeError);
    });
});
