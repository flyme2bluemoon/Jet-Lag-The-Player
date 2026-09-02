import {
    getVisibleBudgetTransactions,
    type BudgetTransaction,
} from "./budget-data";
import {
    getGameBoardState,
    type GameBoardState,
} from "./game-data";
import type { SeasonEighteenEpisodeTimestamp } from "./types";

type SeasonEighteenGameState = {
    budgetTransactions: readonly BudgetTransaction[];
    gameBoard: GameBoardState;
};

/** Returns the complete Season 18 Game state visible at an Episode timestamp. */
export function getSeasonEighteenGameState(
    timestamp: SeasonEighteenEpisodeTimestamp,
): SeasonEighteenGameState {
    return {
        budgetTransactions: getVisibleBudgetTransactions(timestamp),
        gameBoard: getGameBoardState(timestamp),
    };
}

export type { SeasonEighteenGameState };
