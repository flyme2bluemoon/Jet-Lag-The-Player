import { describe, expect, it } from "vitest";
import { getMapFrame } from "./map-frame-data";
import type { SeasonEighteenEpisodeTimestamp } from "./types";

function at(
    episode: SeasonEighteenEpisodeTimestamp["episode"],
    seconds: number,
): SeasonEighteenEpisodeTimestamp {
    return { episode, at: seconds };
}

describe("getMapFrame", () => {
    it("returns the same frame reference within a revision", () => {
        const first = getMapFrame(at("episode-1", 200));
        const sameRevision = getMapFrame(at("episode-1", 200.25));

        expect(sameRevision).toBe(first);
    });

    it("advances through Episode 1 frames at authored boundaries", () => {
        expect(getMapFrame(at("episode-1", 0)).zoom).toBe(10.7);
        expect(getMapFrame(at("episode-1", 10 * 60 + 43)).zoom).toBe(4.25);
        expect(getMapFrame(at("episode-1", 15 * 60 + 59)).zoom).toBe(5);
    });

    it("uses a distinct frame when entering a later Episode", () => {
        const endOfEpisodeOne = getMapFrame(at("episode-1", 50 * 60));
        const startOfEpisodeTwo = getMapFrame(at("episode-2", 0));

        expect(startOfEpisodeTwo).not.toBe(endOfEpisodeOne);
        expect(startOfEpisodeTwo.zoom).toBe(3.65);
    });
});
