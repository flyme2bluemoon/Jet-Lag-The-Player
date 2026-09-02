import type { TeamId } from "./team-data";
import {
    cropPath,
    getPointAlongPath,
    getTrackerInterval,
    getTrackerProgress,
    getTrackerState as getTrackerStateAt,
    type TrackerState,
} from "./tracker-engine";
import type {
    ResolvedTrackerInterval,
} from "./tracker-model";
import type { LocationId } from "./tracker-static";
import { trackerEpisodeRanges } from "./tracker-timeline";
import type { SeasonEighteenEpisodeTimestamp } from "./types";

export type { Coordinate } from "./tracker-routes";
export type {
    ResolvedEndpointLabel,
    ResolvedFlightTrajectory,
    ResolvedGroundTrajectory,
    ResolvedTravelDisplay,
    TrackerStatus,
} from "./tracker-model";
export type { TrackerState };

export type TrackerInterval = ResolvedTrackerInterval<LocationId>;

/** Clamps playback time to the Episode's authored tracker window. */
export function clampTrackerTime(
    episodeSlug: SeasonEighteenEpisodeTimestamp["episode"],
    currentTime: number,
) {
    const range = trackerEpisodeRanges[episodeSlug];
    return Math.min(Math.max(currentTime, range.start), range.end);
}

/** Returns revision-stable per-team tracker intervals for an Episode timestamp. */
export function getTrackerState(
    timestamp: SeasonEighteenEpisodeTimestamp,
): TrackerState {
    const at = clampTrackerTime(timestamp.episode, timestamp.at);
    return getTrackerStateAt(timestamp.episode, at);
}

export function resolveTrackerInterval(
    episodeSlug: SeasonEighteenEpisodeTimestamp["episode"],
    currentTime: number,
    team: TeamId,
) {
    return getTrackerState({ episode: episodeSlug, at: currentTime })[team];
}

export function resolveTrackerProgress(
    interval: TrackerInterval,
    currentTime: number,
) {
    return getTrackerProgress(interval, currentTime);
}

export {
    cropPath,
    getPointAlongPath,
    getTrackerInterval,
};
