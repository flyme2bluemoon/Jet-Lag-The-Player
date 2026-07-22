import type { TeamId } from "./team-data";
import {
    cropPath,
    getPointAlongPath,
    getTrackerInterval,
    getTrackerProgress,
} from "./tracker-engine";
import type {
    ResolvedTrackerInterval,
} from "./tracker-model";
import type { Coordinate } from "./tracker-routes";
import type { LocationId } from "./tracker-static";
import {
    trackerEpisodeRanges,
    type TrackerEpisodeSlug,
} from "./tracker-timeline";

export type { Coordinate } from "./tracker-routes";
export type {
    ResolvedEndpointLabel,
    ResolvedFlightTrajectory,
    ResolvedGroundTrajectory,
    ResolvedTravelDisplay,
    TrackerStatus,
} from "./tracker-model";

export type TrackerInterval = ResolvedTrackerInterval<LocationId>;

export function hasTrackerData(
    episodeSlug: string,
): episodeSlug is TrackerEpisodeSlug {
    return Object.hasOwn(trackerEpisodeRanges, episodeSlug);
}

export function clampTrackerTime(episodeSlug: string, currentTime: number) {
    if (!hasTrackerData(episodeSlug)) return currentTime;
    const range = trackerEpisodeRanges[episodeSlug];
    return Math.min(Math.max(currentTime, range.start), range.end);
}

export function resolveTrackerInterval(
    episodeSlug: string,
    currentTime: number,
    team: TeamId,
) {
    if (!hasTrackerData(episodeSlug)) {
        throw new RangeError(`No Season 18 tracker data exists for "${episodeSlug}".`);
    }
    const time = clampTrackerTime(episodeSlug, currentTime);
    return getTrackerInterval(episodeSlug, time, team);
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
};

export function getStationaryCoordinate(interval: TrackerInterval): Coordinate | null {
    return interval.kind === "stationary" ? interval.coordinate : null;
}
