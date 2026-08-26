import type { SeekersTrackerState, TrackerCoordinate } from "./seekers-tracker-data";

export type InvestigationMapBounds = [TrackerCoordinate, TrackerCoordinate];
export type InvestigationMapPadding = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};

type Rectangle = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};

export type InvestigationMapOverlay = {
    edge: keyof InvestigationMapPadding;
    bounds: Rectangle;
};

const BASE_RESET_PADDING = 24;
const OVERLAY_GAP = 12;

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

/** Returns edge padding that keeps fitted map content clear of visible overlays. */
export function getInvestigationMapResetPadding(
    containerBounds: Rectangle,
    overlays: readonly InvestigationMapOverlay[],
): InvestigationMapPadding {
    return overlays.reduce<InvestigationMapPadding>((padding, overlay) => {
        const occupiedSpace = {
            top: overlay.bounds.bottom - containerBounds.top,
            right: containerBounds.right - overlay.bounds.left,
            bottom: containerBounds.bottom - overlay.bounds.top,
            left: overlay.bounds.right - containerBounds.left,
        }[overlay.edge];

        return {
            ...padding,
            [overlay.edge]: Math.max(
                padding[overlay.edge],
                Math.ceil(occupiedSpace + OVERLAY_GAP),
            ),
        };
    }, {
        top: BASE_RESET_PADDING,
        right: BASE_RESET_PADDING,
        bottom: BASE_RESET_PADDING,
        left: BASE_RESET_PADDING,
    });
}
