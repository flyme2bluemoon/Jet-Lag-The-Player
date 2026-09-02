import {
    getVisibleBudgetTransactions,
    type BudgetTransaction,
} from "./budget-data";
import {
    getGameBoardState,
    type GameBoardState,
} from "./game-data";
import {
    getTrackerState,
    type TrackerState,
} from "./tracker-data";
import type { SeasonEighteenEpisodeTimestamp } from "./types";

type SeasonEighteenGameState = {
    budgetTransactions: readonly BudgetTransaction[];
    gameBoard: GameBoardState;
    tracker: TrackerState;
};

let latestGameState: SeasonEighteenGameState | undefined;

/** Returns the complete Season 18 Game state visible at an Episode timestamp. */
export function getSeasonEighteenGameState(
    timestamp: SeasonEighteenEpisodeTimestamp,
): SeasonEighteenGameState {
    const budgetTransactions = getVisibleBudgetTransactions(timestamp);
    const gameBoard = getGameBoardState(timestamp);
    const tracker = getTrackerState(timestamp);

    if (
        latestGameState
        && latestGameState.budgetTransactions === budgetTransactions
        && latestGameState.gameBoard === gameBoard
        && latestGameState.tracker === tracker
    ) {
        return latestGameState;
    }

    latestGameState = { budgetTransactions, gameBoard, tracker };
    return latestGameState;
}

export type { SeasonEighteenGameState };
