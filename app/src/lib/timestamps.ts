type SeasonWithEpisodes = {
    slug?: string;
    episodes: readonly { slug: string }[];
};

const episodeIndexCache = new WeakMap<
    SeasonWithEpisodes,
    ReadonlyMap<string, number>
>();

export type EpisodeTimestamp = {
    episode: string;
    at: number;
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
