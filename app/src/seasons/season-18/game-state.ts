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

let latestGameState: SeasonEighteenGameState | undefined;

/** Returns the complete Season 18 Game state visible at an Episode timestamp. */
export function getSeasonEighteenGameState(
    timestamp: SeasonEighteenEpisodeTimestamp,
): SeasonEighteenGameState {
    const budgetTransactions = getVisibleBudgetTransactions(timestamp);
    const gameBoard = getGameBoardState(timestamp);

    if (
        latestGameState
        && latestGameState.budgetTransactions === budgetTransactions
        && latestGameState.gameBoard === gameBoard
    ) {
        return latestGameState;
    }

    latestGameState = { budgetTransactions, gameBoard };
    return latestGameState;
}

export type { SeasonEighteenGameState };
