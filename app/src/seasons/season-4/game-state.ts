import {
    getSeasonFourScore,
    type SeasonFourScore,
} from "./area-bonus-data";
import {
    getBattleStatus,
    type BattleStatus,
} from "./battle-status-data";
import {
    getVisiblePowerupTransactions,
    getVisibleTravelBudgetCredits,
    type PowerupTransaction,
    type TravelBudgetCredit,
} from "./budget-data";
import {
    getChallengeState,
    type SeasonFourChallengeState,
} from "./challenge-data";
import {
    getHands,
    type SeasonFourHands,
} from "./hand-data";
import {
    getStateClaimState,
    type StateClaim,
} from "./state-claims";
import type { SeasonFourEpisodeTimestamp } from "./types";

type SeasonFourGameState = {
    claimedStates: ReadonlyMap<string, StateClaim>;
    hands: SeasonFourHands;
    challenges: SeasonFourChallengeState;
    battle: BattleStatus | null;
    travelBudgetCredits: readonly TravelBudgetCredit[];
    powerupTransactions: readonly PowerupTransaction[];
    score: SeasonFourScore;
};

/** Returns the complete Season 4 Game state visible at an Episode timestamp. */
export function getSeasonFourGameState(
    timestamp: SeasonFourEpisodeTimestamp,
): SeasonFourGameState {
    const stateClaims = getStateClaimState(timestamp);

    return {
        claimedStates: stateClaims.claimedStates,
        hands: getHands(timestamp),
        challenges: getChallengeState(timestamp),
        battle: getBattleStatus(timestamp),
        travelBudgetCredits: getVisibleTravelBudgetCredits(timestamp),
        powerupTransactions: getVisiblePowerupTransactions(timestamp),
        score: getSeasonFourScore(timestamp),
    };
}
