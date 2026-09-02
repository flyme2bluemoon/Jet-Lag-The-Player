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
    getSeasonEighteenScore,
    type SeasonEighteenScore,
} from "./score-data";
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
    score: SeasonEighteenScore;
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
    const score = getSeasonEighteenScore(timestamp);

    if (
        latestGameState
        && latestGameState.budgetTransactions === budgetTransactions
        && latestGameState.gameBoard === gameBoard
        && latestGameState.tracker === tracker
        && latestGameState.mapFrame === mapFrame
        && latestGameState.score === score
    ) {
        return latestGameState;
    }

    latestGameState = {
        budgetTransactions,
        gameBoard,
        tracker,
        mapFrame,
        score,
    };
    return latestGameState;
}

export type { SeasonEighteenGameState };
