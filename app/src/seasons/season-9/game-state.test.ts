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

    it("purchases, activates, and expires a curse within one revision chain", () => {
        const beforePurchase = getSeasonNineGameState(at("episode-1", 831.9));
        const purchased = getSeasonNineGameState(at("episode-1", 832));
        const rolled = getSeasonNineGameState(at("episode-1", 858));
        const expired = getSeasonNineGameState(at("episode-1", 1442));

        expect(beforePurchase.timeline.coinBalance).toBe(125);
        expect(beforePurchase.timeline.activeCurse).toBeNull();

        expect(purchased.timeline.coinBalance).toBe(25);
        expect(purchased.timeline.curses).toHaveLength(0);
        expect(purchased.timeline.activeCurse).toBeNull();

        expect(rolled.timeline.activeCurse).toMatchObject({
            name: "William Tell Curse",
            diceCount: 2,
            roll: 7,
            active: true,
        });
        expect(rolled.timeline.curses).toHaveLength(1);

        expect(expired.timeline.activeCurse).toBeNull();
        expect(expired.timeline.curses[0]?.active).toBe(false);
    });

    it("answers a question when response and reveal share one timestamp", () => {
        const before = getSeasonNineGameState(at("episode-3", 1790.9));
        const simultaneous = getSeasonNineGameState(at("episode-3", 1791));

        const waiting = before.timeline.questions.find(
            (question) => question.id === "train-station-walking-distance",
        );
        const answered = simultaneous.timeline.questions.find(
            (question) => question.id === "train-station-walking-distance",
        );

        expect(waiting?.status).toBe("waiting");
        expect(answered).toMatchObject({
            status: "answered",
            response: "8 minutes",
        });
        expect(simultaneous.timeline).not.toBe(before.timeline);
    });

    it("keeps episode-1 state visible before later-episode events apply", () => {
        const endOfEpisodeOne = getSeasonNineGameState(at("episode-1", 2186));
        const startOfEpisodeTwo = getSeasonNineGameState(at("episode-2", 0));
        const afterEpisodeTwoQuestion = getSeasonNineGameState(at("episode-2", 201));

        expect(endOfEpisodeOne.timeline.currentHider).toBe("ben");
        expect(endOfEpisodeOne.timeline.questions).toHaveLength(0);
        expect(startOfEpisodeTwo.timeline).toEqual(endOfEpisodeOne.timeline);
        expect(startOfEpisodeTwo.timeline.questions.some(
            (question) => question.id === "five-words",
        )).toBe(false);
        expect(afterEpisodeTwoQuestion.timeline.questions[0]?.id).toBe("five-words");
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
        const before = getSeasonNineGameState(at("episode-1", 388.9));
        const inTransit = getSeasonNineGameState(at("episode-1", 389));

        expect(before.seekersTracker).toMatchObject({
            kind: "point",
            label: "Lucerne",
        });
        expect(inTransit.seekersTracker).toMatchObject({
            kind: "transit",
            label: "Lucerne → Arth-Goldau",
        });
        expect(inTransit.seekersTracker).not.toBe(before.seekersTracker);
    });

    it("preserves the seekers tracker across a timeline-only change", () => {
        const before = getSeasonNineGameState(at("episode-1", 179.9));
        const after = getSeasonNineGameState(at("episode-1", 180));

        expect(after.timeline).not.toBe(before.timeline);
        expect(after.seekersTracker).toBe(before.seekersTracker);
    });

    it("preserves the timeline across a seekers-tracker-only change", () => {
        const before = getSeasonNineGameState(at("episode-1", 388.9));
        const after = getSeasonNineGameState(at("episode-1", 389));

        expect(after.seekersTracker).not.toBe(before.seekersTracker);
        expect(after.timeline).toBe(before.timeline);
    });

    it("rederives the same values after rewinding", () => {
        const earlier = getSeasonNineGameState(at("episode-1", 179.9));
        getSeasonNineGameState(at("episode-1", 2178));
        const rewound = getSeasonNineGameState(at("episode-1", 179.9));

        expect(rewound).not.toBe(earlier);
        expect(rewound).toEqual(earlier);
        expect(rewound.timeline).not.toBe(earlier.timeline);
        expect(rewound.seekersTracker).not.toBe(earlier.seekersTracker);
    });
});
