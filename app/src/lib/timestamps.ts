type SeasonWithEpisodes<Episode extends string = string> = {
    slug?: string;
    episodes: readonly { slug: Episode }[];
};

const episodeIndexCache = new WeakMap<
    SeasonWithEpisodes,
    ReadonlyMap<string, number>
>();

export type EpisodeTimestamp<Episode extends string = string> = {
    episode: Episode;
    at: number;
};

type TimestampProjectionOptions<Episode extends string, Snapshot> = {
    season: SeasonWithEpisodes<Episode>;
    boundaries: readonly EpisodeTimestamp<Episode>[];
    project: (timestamp: EpisodeTimestamp<Episode>) => Snapshot;
};

/** Formats an episode slug for compact timestamp metadata. */
export function formatEpisodeLabel(episode: string) {
    if (episode === "finale") return "Finale";

    const episodeNumber = episode.match(/^episode-(\d+)$/)?.[1];
    return episodeNumber ? `Ep. ${episodeNumber}` : episode;
}

/** Formats elapsed video seconds as minutes and zero-padded seconds. */
export function formatTimestamp(seconds: number) {
    const roundedSeconds = Math.floor(seconds);
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Compares two timestamps using their episode order within a season.
 *
 * Returns a negative number when `left` is earlier, a positive number when
 * `left` is later, and zero when both timestamps identify the same moment.
 */
export function compareTimestamps(
    season: SeasonWithEpisodes,
    left: EpisodeTimestamp,
    right: EpisodeTimestamp,
) {
    let episodeIndexes = episodeIndexCache.get(season);

    if (!episodeIndexes) {
        episodeIndexes = new Map(
            season.episodes.map((episode, index) => [episode.slug, index]),
        );
        episodeIndexCache.set(season, episodeIndexes);
    }

    const leftEpisodeIndex = episodeIndexes.get(left.episode) ?? -1;
    const rightEpisodeIndex = episodeIndexes.get(right.episode) ?? -1;

    if (leftEpisodeIndex === -1 || rightEpisodeIndex === -1) {
        const unknownEpisode = leftEpisodeIndex === -1
            ? left.episode
            : right.episode;

        throw new RangeError(
            `Episode "${unknownEpisode}" does not belong to season "${season.slug ?? "unknown"}".`,
        );
    }

    return leftEpisodeIndex === rightEpisodeIndex
        ? left.at - right.at
        : leftEpisodeIndex - rightEpisodeIndex;
}

/** Returns whether `current` falls within the half-open `[start, end)` range. */
export function isTimestampInRange(
    season: SeasonWithEpisodes,
    current: EpisodeTimestamp,
    start: EpisodeTimestamp,
    end: EpisodeTimestamp,
) {
    return compareTimestamps(season, start, current) <= 0
        && compareTimestamps(season, current, end) < 0;
}

/**
 * Creates a bounded, revision-stable projection over an ordered season.
 *
 * Change boundaries must be derived from the authoritative source records.
 * The projection callback must depend only on those records and its timestamp.
 */
export function createTimestampProjection<Episode extends string, Snapshot>({
    season,
    boundaries,
    project,
}: TimestampProjectionOptions<Episode, Snapshot>) {
    for (const boundary of boundaries) {
        validateProjectionTimestamp(season, boundary);
    }

    const orderedBoundaries = boundaries
        .toSorted((left, right) => compareTimestamps(season, left, right))
        .filter((boundary, index, ordered) =>
            index === 0 ||
            compareTimestamps(season, ordered[index - 1], boundary) !== 0
        );
    let latest: { revision: number; snapshot: Snapshot } | undefined;

    return (timestamp: EpisodeTimestamp<Episode>) => {
        validateProjectionTimestamp(season, timestamp);
        const revision = findVisibleRevision(
            season,
            orderedBoundaries,
            timestamp,
        );

        if (latest?.revision === revision) return latest.snapshot;

        const snapshot = project(timestamp);
        latest = { revision, snapshot };
        return snapshot;
    };
}

function findVisibleRevision<Episode extends string>(
    season: SeasonWithEpisodes<Episode>,
    boundaries: readonly EpisodeTimestamp<Episode>[],
    timestamp: EpisodeTimestamp<Episode>,
) {
    let start = 0;
    let end = boundaries.length;

    while (start < end) {
        const middle = Math.floor((start + end) / 2);
        const boundary = boundaries[middle];

        if (compareTimestamps(season, boundary, timestamp) <= 0) {
            start = middle + 1;
        } else {
            end = middle;
        }
    }

    return start;
}

function validateProjectionTimestamp<Episode extends string>(
    season: SeasonWithEpisodes<Episode>,
    timestamp: EpisodeTimestamp<Episode>,
) {
    if (!Number.isFinite(timestamp.at) || timestamp.at < 0) {
        throw new RangeError(
            `Episode timestamp seconds must be finite and non-negative; received "${timestamp.at}".`,
        );
    }

    compareTimestamps(season, timestamp, timestamp);
}
