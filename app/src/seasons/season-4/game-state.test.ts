import { describe, expect, it } from "vitest";
import { getSeasonFourGameState } from "./game-state";
import type { Hand } from "./hand-data";
import type { SeasonFourEpisodeTimestamp } from "./types";

function at(
    episode: SeasonFourEpisodeTimestamp["episode"],
    seconds: number,
): SeasonFourEpisodeTimestamp {
    return { episode, at: seconds };
}

function handIds(hand: Hand) {
    return hand.map((card) => card?.id ?? null);
}

describe("getSeasonFourGameState", () => {
    it("keeps each projected value stable between change boundaries", () => {
        const first = getSeasonFourGameState(at("episode-1", 200));
        const sameRevision = getSeasonFourGameState(at("episode-1", 200.25));

        expect(sameRevision).not.toBe(first);
        expect(sameRevision.claimedStates).toBe(first.claimedStates);
        expect(sameRevision.hands).toBe(first.hands);
        expect(sameRevision.challenges).toBe(first.challenges);
        expect(sameRevision.battle).toBe(first.battle);
        expect(sameRevision.travelBudgetCredits)
            .toBe(first.travelBudgetCredits);
        expect(sameRevision.powerupTransactions)
            .toBe(first.powerupTransactions);
        expect(sameRevision.score).toBe(first.score);
    });

    it("projects a Claim and its Hand removal at the same timestamp", () => {
        const before = getSeasonFourGameState(at("episode-1", 307.9));
        const claimed = getSeasonFourGameState(at("episode-1", 308));

        expect(before.claimedStates.has("New York")).toBe(false);
        expect(handIds(before.hands["ben-adam"])).toContain("praise-building");
        expect(claimed.claimedStates.get("New York")?.team).toBe("ben-adam");
        expect(handIds(claimed.hands["ben-adam"])).not.toContain("praise-building");
    });

    it("applies independent Claims sharing one timestamp in one revision", () => {
        const before = getSeasonFourGameState(at("episode-1", 1617.9));
        const claimed = getSeasonFourGameState(at("episode-1", 1618));

        expect(before.claimedStates.has("Pennsylvania")).toBe(false);
        expect(before.claimedStates.has("New Jersey")).toBe(false);
        expect(claimed.claimedStates.get("Pennsylvania")?.team).toBe("ben-adam");
        expect(claimed.claimedStates.get("New Jersey")?.team).toBe("ben-adam");
    });

    it("uses half-open Challenge windows", () => {
        const active = getSeasonFourGameState(at("episode-1", 100));
        const completed = getSeasonFourGameState(at("episode-1", 308));

        expect(active.challenges["ben-adam"].active?.id).toBe("praise-building");
        expect(completed.challenges["ben-adam"].active).toBeNull();
    });

    it("reveals each Battle phase at its factual boundary", () => {
        expect(getSeasonFourGameState(at("episode-1", 2559)).battle?.phase)
            .toBe("countdown");
        expect(getSeasonFourGameState(at("episode-2", 33)).battle)
            .toMatchObject({ phase: "active", state: "Maryland" });
        expect(getSeasonFourGameState(at("episode-2", 253)).battle)
            .toMatchObject({
                phase: "concluded",
                state: "Maryland",
                winner: "ben-adam",
            });
        expect(getSeasonFourGameState(at("episode-2", 268)).battle).toBeNull();
    });

    it("keeps Hands stable when a Battle changes a Claimed state", () => {
        const active = getSeasonFourGameState(at("episode-2", 252.9));
        const concluded = getSeasonFourGameState(at("episode-2", 253));

        expect(concluded.claimedStates).not.toBe(active.claimedStates);
        expect(concluded.hands).toBe(active.hands);
    });

    it("derives Power-up token rewards from visible Claims", () => {
        const before = getSeasonFourGameState(at("episode-2", 984.9));
        const rewarded = getSeasonFourGameState(at("episode-2", 985));

        expect(before.powerupTransactions.some((item) =>
            item.id === "reward-episode-2-985-ben-adam"
        )).toBe(false);
        expect(rewarded.powerupTransactions).toContainEqual(
            expect.objectContaining({
                id: "reward-episode-2-985-ben-adam",
                amount: 1,
            }),
        );
    });

    it("moves through state-count, Area bonus, and final scoring", () => {
        const stateCount = getSeasonFourGameState(at("episode-2", 1468.9)).score;
        const areaBonus = getSeasonFourGameState(at("episode-2", 1469)).score;
        const final = getSeasonFourGameState(at("finale", 2450)).score;

        expect(stateCount.phase).toBe("state-count");
        expect(areaBonus.phase).toBe("area-bonus");
        expect(final.phase).toBe("final");

        if (final.phase !== "final") throw new Error("Expected final score");
        expect(final.byTeam["sam-brian"].total).toBe(
            final.byTeam["sam-brian"].states + final.byTeam["sam-brian"].bonus,
        );
        expect(final.byTeam["ben-adam"].total).toBe(
            final.byTeam["ben-adam"].states + final.byTeam["ben-adam"].bonus,
        );
    });

    it("preserves unrelated nested references across a Battle change", () => {
        const beforeBattle = getSeasonFourGameState(at("episode-1", 2558.9));
        const battleDeclared = getSeasonFourGameState(at("episode-1", 2559));

        expect(battleDeclared).not.toBe(beforeBattle);
        expect(battleDeclared.claimedStates).toBe(beforeBattle.claimedStates);
        expect(battleDeclared.hands).toBe(beforeBattle.hands);
        expect(battleDeclared.challenges).toBe(beforeBattle.challenges);
        expect(battleDeclared.travelBudgetCredits)
            .toBe(beforeBattle.travelBudgetCredits);
        expect(battleDeclared.powerupTransactions)
            .toBe(beforeBattle.powerupTransactions);
        expect(battleDeclared.score).toBe(beforeBattle.score);
    });

    it("invalidates the complete Hands value at a Hand boundary", () => {
        const beforeDraw = getSeasonFourGameState(at("episode-1", 1399.9));
        const afterDraw = getSeasonFourGameState(at("episode-1", 1400));

        expect(afterDraw.hands).not.toBe(beforeDraw.hands);
        expect(afterDraw.hands["sam-brian"])
            .not.toBe(beforeDraw.hands["sam-brian"]);
        expect(afterDraw.hands["ben-adam"])
            .not.toBe(beforeDraw.hands["ben-adam"]);
    });

    it("invalidates the complete Challenge value at a Challenge boundary", () => {
        const beforeChallenge = getSeasonFourGameState(at("episode-1", 99.9));
        const afterChallenge = getSeasonFourGameState(at("episode-1", 100));

        expect(afterChallenge.challenges).not.toBe(beforeChallenge.challenges);
        expect(afterChallenge.challenges["ben-adam"])
            .not.toBe(beforeChallenge.challenges["ben-adam"]);
        expect(afterChallenge.challenges["sam-brian"])
            .not.toBe(beforeChallenge.challenges["sam-brian"]);
    });

    it("rederives the same values after rewinding", () => {
        const earlier = getSeasonFourGameState(at("episode-1", 307.9));
        getSeasonFourGameState(at("finale", 2450));
        const rewound = getSeasonFourGameState(at("episode-1", 307.9));

        expect(rewound).not.toBe(earlier);
        expect(rewound).toEqual(earlier);
    });
});
