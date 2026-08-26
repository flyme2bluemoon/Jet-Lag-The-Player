import type { SeekersTrackerState, TrackerCoordinate } from "./seekers-tracker-data";

export type InvestigationMapBounds = [TrackerCoordinate, TrackerCoordinate];

/**
 * Expands the playable-area camera bounds to include every piece of the
 * currently visible seekers tracker overlay.
 */
export function getInvestigationMapResetBounds(
    playableBounds: InvestigationMapBounds,
    seekersTrackerState: SeekersTrackerState,
): InvestigationMapBounds {
    const trackerCoordinates = seekersTrackerState.kind === "point"
        ? [seekersTrackerState.coordinate]
        : [
            ...seekersTrackerState.route,
            ...seekersTrackerState.waypoints.map((waypoint) => waypoint.coordinate),
        ];

    return trackerCoordinates.reduce<InvestigationMapBounds>(
        (bounds, [longitude, latitude]) => [
            [
                Math.min(bounds[0][0], longitude),
                Math.min(bounds[0][1], latitude),
            ],
            [
                Math.max(bounds[1][0], longitude),
                Math.max(bounds[1][1], latitude),
            ],
        ],
        [
            [...playableBounds[0]],
            [...playableBounds[1]],
        ],
    );
}
