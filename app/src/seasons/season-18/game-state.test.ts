import { describe, expect, it } from "vitest";
import { getSeasonEighteenGameState } from "./game-state";
import type { SeasonEighteenEpisodeTimestamp } from "./types";

function at(
    episode: SeasonEighteenEpisodeTimestamp["episode"],
    seconds: number,
): SeasonEighteenEpisodeTimestamp {
    return { episode, at: seconds };
}

function publicCardIds(
    state: ReturnType<typeof getSeasonEighteenGameState>,
) {
    return state.gameBoard.cardsByLocation.public.map((card) => card.id);
}

describe("getSeasonEighteenGameState", () => {
    it("keeps each projected value stable between change boundaries", () => {
        const first = getSeasonEighteenGameState(at("episode-1", 200));
        const sameRevision = getSeasonEighteenGameState(at("episode-1", 200.25));

        expect(sameRevision).not.toBe(first);
        expect(sameRevision.budgetTransactions).toBe(first.budgetTransactions);
        expect(sameRevision.gameBoard).toBe(first.gameBoard);
    });

    it("preserves gameBoard when only a budget boundary is crossed", () => {
        const before = getSeasonEighteenGameState(at("episode-1", 4 * 60 + 13.9));
        const afterBudget = getSeasonEighteenGameState(at("episode-1", 4 * 60 + 14));

        expect(afterBudget.budgetTransactions).not.toBe(before.budgetTransactions);
        expect(afterBudget.gameBoard).toBe(before.gameBoard);
    });

    it("projects a Claim and its card removal at the same timestamp", () => {
        const before = getSeasonEighteenGameState(at("episode-1", 30 * 60 + 3.9));
        const claimed = getSeasonEighteenGameState(at("episode-1", 30 * 60 + 4));

        expect(before.gameBoard.claims.has("Tennessee")).toBe(false);
        expect(publicCardIds(before)).toContain("tennessee");
        expect(claimed.gameBoard.claims.get("Tennessee")?.team).toBe("ben-adam");
        expect(publicCardIds(claimed)).not.toContain("tennessee");
    });

    it("reveals budget transactions at their factual boundaries", () => {
        const before = getSeasonEighteenGameState(at("episode-1", 4 * 60 + 13.9));
        const after = getSeasonEighteenGameState(at("episode-1", 4 * 60 + 14));

        expect(before.budgetTransactions.some(
            (transaction) => transaction.id === "sam-amy-flight-lga-ord",
        )).toBe(false);
        expect(after.budgetTransactions).toContainEqual(
            expect.objectContaining({
                id: "sam-amy-flight-lga-ord",
                amount: -558,
            }),
        );
    });

    it("tracks active Claims with half-open windows", () => {
        const active = getSeasonEighteenGameState(at("episode-1", 14 * 60 + 2));
        const completed = getSeasonEighteenGameState(at("episode-1", 30 * 60 + 4));

        expect(active.gameBoard.activeClaims.some(
            (claim) => claim.id === "ben-adam-tennessee",
        )).toBe(true);
        expect(completed.gameBoard.activeClaims.some(
            (claim) => claim.id === "ben-adam-tennessee",
        )).toBe(false);
    });

    it("adds a public card at its draw boundary", () => {
        const before = getSeasonEighteenGameState(at("episode-1", 1 * 60 + 9.9));
        const after = getSeasonEighteenGameState(at("episode-1", 1 * 60 + 10));

        expect(publicCardIds(before)).not.toContain("illinois");
        expect(publicCardIds(after)).toContain("illinois");
        expect(after.gameBoard).not.toBe(before.gameBoard);
    });

    it("removes a public card at its discard boundary", () => {
        const before = getSeasonEighteenGameState(at("episode-1", 30 * 60 + 54.9));
        const after = getSeasonEighteenGameState(at("episode-1", 30 * 60 + 55));

        expect(publicCardIds(before)).toContain("wisconsin");
        expect(publicCardIds(after)).not.toContain("wisconsin");
    });

    it("assigns private cards to day slots", () => {
        const before = getSeasonEighteenGameState(at("episode-1", 2 * 60 + 46.9));
        const after = getSeasonEighteenGameState(at("episode-1", 2 * 60 + 47));

        expect(before.gameBoard.privateSlots["sam-amy"][0].cardKey).toBeUndefined();
        expect(after.gameBoard.privateSlots["sam-amy"][0]).toMatchObject({
            day: 1,
            cardKey: "delaware",
            used: false,
        });
        expect(after.gameBoard.cardsByLocation["sam-amy"].some(
            (card) => card.id === "delaware",
        )).toBe(true);
    });

    it("updates Connected-state scores when Claims complete", () => {
        const beforeMississippi = getSeasonEighteenGameState(
            at("episode-1", 51 * 60 + 47.9),
        );
        const afterMississippi = getSeasonEighteenGameState(
            at("episode-1", 51 * 60 + 48),
        );

        expect(beforeMississippi.gameBoard.scores["ben-adam"]).toMatchObject({
            statesClaimed: 1,
            score: 1,
        });
        expect(afterMississippi.gameBoard.scores["ben-adam"]).toMatchObject({
            statesClaimed: 2,
            score: 2,
            connectedStates: expect.arrayContaining(["Tennessee", "Mississippi"]),
        });
    });

    it("rederives the same values after rewinding", () => {
        const earlier = getSeasonEighteenGameState(at("episode-1", 30 * 60 + 3.9));
        getSeasonEighteenGameState(at("finale", 40 * 60));
        const rewound = getSeasonEighteenGameState(at("episode-1", 30 * 60 + 3.9));

        expect(rewound).not.toBe(earlier);
        expect(rewound).toEqual(earlier);
    });
});
