import { describe, expect, it } from "vitest";
import { getSeasonEighteenGameState } from "./game-state";
import type { SeasonEighteenEpisodeTimestamp } from "./types";

function at(
    episode: SeasonEighteenEpisodeTimestamp["episode"],
    seconds: number,
): SeasonEighteenEpisodeTimestamp {
    return { episode, at: seconds };
}

describe("getSeasonEighteenGameState", () => {
    it("keeps each projected value stable between change boundaries", () => {
        const first = getSeasonEighteenGameState(at("episode-1", 200));
        const sameRevision = getSeasonEighteenGameState(at("episode-1", 200.25));

        expect(sameRevision).not.toBe(first);
        expect(sameRevision.budgetTransactions).toBe(first.budgetTransactions);
        expect(sameRevision.gameBoard).toBe(first.gameBoard);
    });

    it("projects a Claim and its card removal at the same timestamp", () => {
        const before = getSeasonEighteenGameState(at("episode-1", 30 * 60 + 3.9));
        const claimed = getSeasonEighteenGameState(at("episode-1", 30 * 60 + 4));

        expect(before.gameBoard.claims.has("Tennessee")).toBe(false);
        expect(before.gameBoard.cardsByLocation.public.some(
            (card) => card.id === "tennessee",
        )).toBe(true);
        expect(claimed.gameBoard.claims.get("Tennessee")?.team).toBe("ben-adam");
        expect(claimed.gameBoard.cardsByLocation.public.some(
            (card) => card.id === "tennessee",
        )).toBe(false);
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

    it("rederives the same values after rewinding", () => {
        const earlier = getSeasonEighteenGameState(at("episode-1", 30 * 60 + 3.9));
        getSeasonEighteenGameState(at("finale", 40 * 60));
        const rewound = getSeasonEighteenGameState(at("episode-1", 30 * 60 + 3.9));

        expect(rewound).not.toBe(earlier);
        expect(rewound).toEqual(earlier);
    });
});
