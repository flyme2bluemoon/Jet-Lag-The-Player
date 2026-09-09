import { seasonNineteen } from "@/data/season-19";
import { isReleasedEpisode } from "@/data/season-types";
import { compareTimestamps, createTimestampProjection } from "@/lib/timestamps";
import {
  seasonNineteenPlaces,
  seasonNineteenPrefectureUnlocks,
  seasonNineteenTeamLocations,
  seasonNineteenTimelineBoundaries,
  type SeasonNineteenCoordinate,
  type SeasonNineteenPlace,
  type SeasonNineteenPlaceId,
  type SeasonNineteenTeamId,
  type SeasonNineteenTeamLocationEvent,
  type SeasonNineteenTimestamp,
} from "./timeline-data";
import { seasonNineteenTeamIds } from "./team-data";

const season = {
  episodes: seasonNineteen.episodes.filter(isReleasedEpisode),
};

export type TeamTrackerState = {
  team: SeasonNineteenTeamId;
  /** Prefecture the team currently occupies for outline purposes. */
  prefecture: string;
  label: string;
} & (
  | {
      kind: "stationary";
      place: SeasonNineteenPlaceId;
      coordinate: SeasonNineteenCoordinate;
    }
  | {
      kind: "in-transit";
      mode: Extract<
        SeasonNineteenTeamLocationEvent,
        { kind: "in-transit" }
      >["mode"];
      from: SeasonNineteenPlaceId;
      to: SeasonNineteenPlaceId;
      route: readonly SeasonNineteenCoordinate[];
    }
);

export type PrefectureFill =
  | { kind: "single"; team: SeasonNineteenTeamId }
  | { kind: "striped" };

export type PrefectureUnlockState = {
  byTeam: Record<SeasonNineteenTeamId, ReadonlySet<string>>;
  fills: ReadonlyMap<string, PrefectureFill>;
};

export type TeamLocationsState = Record<SeasonNineteenTeamId, TeamTrackerState>;

/** Latest location event at or before the requested timestamp, per team. */
export const resolveTeamLocations = createTimestampProjection({
  season,
  boundaries: seasonNineteenTimelineBoundaries.teamLocations,
  project: (timestamp): TeamLocationsState => {
    const locations = {} as TeamLocationsState;
    for (const team of seasonNineteenTeamIds) {
      locations[team] = projectTeamLocation(team, timestamp);
    }
    return locations;
  },
});

/** Prefectures unlocked at or before the requested timestamp. */
export const resolvePrefectureUnlocks = createTimestampProjection({
  season,
  boundaries: seasonNineteenTimelineBoundaries.prefectureUnlocks,
  project: (timestamp): PrefectureUnlockState => {
    const byTeam = {
      "sam-ben": new Set<string>(),
      "adam-tom": new Set<string>(),
    } satisfies Record<SeasonNineteenTeamId, Set<string>>;

    for (const unlock of seasonNineteenPrefectureUnlocks) {
      if (compareTimestamps(season, unlock, timestamp) > 0) break;
      byTeam[unlock.team].add(unlock.prefecture);
    }

    const fills = new Map<string, PrefectureFill>();
    for (const team of seasonNineteenTeamIds) {
      for (const prefecture of byTeam[team]) {
        const existing = fills.get(prefecture);
        if (!existing) {
          fills.set(prefecture, { kind: "single", team });
        } else if (existing.kind === "single" && existing.team !== team) {
          fills.set(prefecture, { kind: "striped" });
        }
      }
    }

    return { byTeam, fills };
  },
});

/**
 * Prefectures a team currently occupies without having unlocked them.
 * Stationary places use that place's prefecture; in-transit legs use the origin.
 */
export function resolveOccupiedOutlines(
  locations: TeamLocationsState,
  unlocks: PrefectureUnlockState,
): Record<SeasonNineteenTeamId, string | null> {
  const outlines = {} as Record<SeasonNineteenTeamId, string | null>;
  for (const team of seasonNineteenTeamIds) {
    const location = locations[team];
    outlines[team] = unlocks.byTeam[team].has(location.prefecture)
      ? null
      : location.prefecture;
  }
  return outlines;
}

function projectTeamLocation(
  team: SeasonNineteenTeamId,
  timestamp: SeasonNineteenTimestamp,
): TeamTrackerState {
  const events = seasonNineteenTeamLocations[team];
  let visible: SeasonNineteenTeamLocationEvent = events[0]!;
  for (const event of events) {
    if (compareTimestamps(season, event, timestamp) > 0) break;
    visible = event;
  }
  return buildTrackerState(team, visible);
}

function placeLabel(place: SeasonNineteenPlace) {
  return place.label ?? place.name;
}

function buildTrackerState(
  team: SeasonNineteenTeamId,
  event: SeasonNineteenTeamLocationEvent,
): TeamTrackerState {
  if (event.kind === "stationary") {
    const place = seasonNineteenPlaces[event.place];
    return {
      team,
      kind: "stationary",
      place: event.place,
      prefecture: place.prefecture,
      label: placeLabel(place),
      coordinate: place.coordinate,
    };
  }

  const from = seasonNineteenPlaces[event.from];
  const to = seasonNineteenPlaces[event.to];
  return {
    team,
    kind: "in-transit",
    mode: event.mode,
    from: event.from,
    to: event.to,
    prefecture: from.prefecture,
    label: `${placeLabel(from)} → ${placeLabel(to)}`,
    route: [from.coordinate, to.coordinate],
  };
}
