import { getSeekersTrackerState, type SeekersTrackerState } from "./seekers-tracker-data";
import { getSeasonNineState, type SeasonNineState } from "./timeline-data";
import type { SeasonNineEpisodeTimestamp } from "./types";

export type SeasonNineGameState = {
    timeline: SeasonNineState;
    seekersTracker: SeekersTrackerState;
};

/** Returns the complete Season 9 Game state visible at an Episode timestamp. */
export function getSeasonNineGameState(
    timestamp: SeasonNineEpisodeTimestamp,
): SeasonNineGameState {
    return {
        timeline: getSeasonNineState(timestamp),
        seekersTracker: getSeekersTrackerState(timestamp),
    };
}
