import { describe, expect, it } from "vitest";
import { getSeasonEighteenScore } from "./score-data";
import type { SeasonEighteenEpisodeTimestamp } from "./types";

function at(
    episode: SeasonEighteenEpisodeTimestamp["episode"],
    seconds: number,
): SeasonEighteenEpisodeTimestamp {
    return { episode, at: seconds };
}

describe("getSeasonEighteenScore", () => {
    it("returns the same score reference within a revision", () => {
        const first = getSeasonEighteenScore(at("episode-1", 200));
        const sameRevision = getSeasonEighteenScore(at("episode-1", 200.25));

        expect(sameRevision).toBe(first);
        expect(first.phase).toBe("connected-state");
    });

    it("reveals the Area tiebreak at its factual boundary", () => {
        expect(getSeasonEighteenScore(at("episode-5", 28.9)).phase)
            .toBe("connected-state");
        expect(getSeasonEighteenScore(at("episode-5", 29))).toEqual({
            phase: "area-tiebreak",
            areaLeader: "sam-amy",
        });
        expect(getSeasonEighteenScore(at("finale", 0)).phase)
            .toBe("area-tiebreak");
    });

    it("reveals the final score at its factual boundary", () => {
        expect(getSeasonEighteenScore(at("finale", 42 * 60 + 42.9)).phase)
            .toBe("area-tiebreak");
        expect(getSeasonEighteenScore(at("finale", 42 * 60 + 43))).toEqual({
            phase: "final",
            areaLeader: "sam-amy",
        });
    });
});
