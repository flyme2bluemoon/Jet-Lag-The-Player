import { describe, expect, it } from "vitest";
import { getSeasonNineGameState } from "./game-state";
import type { SeasonNineEpisodeTimestamp } from "./types";

function at(
    episode: SeasonNineEpisodeTimestamp["episode"],
    seconds: number,
): SeasonNineEpisodeTimestamp {
    return { episode, at: seconds };
}

describe("getSeasonNineGameState", () => {
    it("keeps each projected value stable between change boundaries", () => {
        const first = getSeasonNineGameState(at("episode-1", 200));
        const sameRevision = getSeasonNineGameState(at("episode-1", 200.25));

        expect(sameRevision).not.toBe(first);
        expect(sameRevision.timeline).toBe(first.timeline);
        expect(sameRevision.seekersTracker).toBe(first.seekersTracker);
    });

    it("adds questions when a question is asked", () => {
        const before = getSeasonNineGameState(at("episode-1", 179.9));
        const asked = getSeasonNineGameState(at("episode-1", 180));

        expect(before.timeline.questions).toHaveLength(0);
        expect(asked.timeline.questions).toHaveLength(1);
        expect(asked.timeline.questions[0]?.id).toBe("longitude");
    });

    it("credits coins when a question response is received", () => {
        const before = getSeasonNineGameState(at("episode-1", 185.9));
        const received = getSeasonNineGameState(at("episode-1", 186));

        expect(before.timeline.coinBalance).toBe(0);
        expect(received.timeline.coinBalance).toBe(40);
    });

    it("reveals the curse log at the configured timestamp", () => {
        const before = getSeasonNineGameState(at("episode-1", 788.9));
        const revealed = getSeasonNineGameState(at("episode-1", 789));

        expect(before.timeline.curseLogVisible).toBe(false);
        expect(revealed.timeline.curseLogVisible).toBe(true);
    });

    it("ends the current run and resets state for the next hider", () => {
        const active = getSeasonNineGameState(at("episode-1", 2178));
        const nextRun = getSeasonNineGameState(at("episode-1", 2186));

        expect(active.timeline.currentRunActive).toBe(false);
        expect(active.timeline.leaderboard).toHaveLength(1);
        expect(nextRun.timeline.currentHider).toBe("ben");
        expect(nextRun.timeline.currentRunActive).toBe(true);
        expect(nextRun.timeline.questions).toHaveLength(0);
        expect(nextRun.timeline.coinBalance).toBe(0);
    });

    it("advances the seekers tracker when a location event becomes visible", () => {
        const before = getSeasonNineGameState(at("episode-1", 39.9));
        const arrived = getSeasonNineGameState(at("episode-1", 40));

        expect(before.seekersTracker.label).toBe("Lucerne");
        expect(arrived.seekersTracker.label).toBe("Lucerne");
        expect(before.seekersTracker).not.toBe(arrived.seekersTracker);
    });

    it("rederives earlier revisions after playback moves forward", () => {
        const earlier = getSeasonNineGameState(at("episode-1", 179.9));
        getSeasonNineGameState(at("episode-1", 2178));
        const rewound = getSeasonNineGameState(at("episode-1", 179.9));

        expect(rewound.timeline).not.toBe(earlier.timeline);
        expect(rewound.timeline.questions).toHaveLength(0);
    });
});
