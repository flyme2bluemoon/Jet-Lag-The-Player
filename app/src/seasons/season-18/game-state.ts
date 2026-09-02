import {
    getVisibleBudgetTransactions,
    type BudgetTransaction,
} from "./budget-data";
import {
    getGameBoardState,
    type GameBoardState,
} from "./game-data";
import {
    getMapFrame,
    type MapFrame,
} from "./map-frame-data";
import {
    getTrackerState,
    type TrackerState,
} from "./tracker-data";
import type { SeasonEighteenEpisodeTimestamp } from "./types";

type SeasonEighteenGameState = {
    budgetTransactions: readonly BudgetTransaction[];
    gameBoard: GameBoardState;
    tracker: TrackerState;
    mapFrame: MapFrame;
};

let latestGameState: SeasonEighteenGameState | undefined;

/** Returns the complete Season 18 Game state visible at an Episode timestamp. */
export function getSeasonEighteenGameState(
    timestamp: SeasonEighteenEpisodeTimestamp,
): SeasonEighteenGameState {
    const budgetTransactions = getVisibleBudgetTransactions(timestamp);
    const gameBoard = getGameBoardState(timestamp);
    const tracker = getTrackerState(timestamp);
    const mapFrame = getMapFrame(timestamp);

    if (
        latestGameState
        && latestGameState.budgetTransactions === budgetTransactions
        && latestGameState.gameBoard === gameBoard
        && latestGameState.tracker === tracker
        && latestGameState.mapFrame === mapFrame
    ) {
        return latestGameState;
    }

    latestGameState = { budgetTransactions, gameBoard, tracker, mapFrame };
    return latestGameState;
}

export type { SeasonEighteenGameState };
