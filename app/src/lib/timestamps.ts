type SeasonWithEpisodes = {
    slug?: string;
    episodes: readonly { slug: string }[];
};

export type EpisodeTimestamp = {
    episode: string;
    at: number;
};

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
    const leftEpisodeIndex = season.episodes.findIndex(
        (episode) => episode.slug === left.episode,
    );
    const rightEpisodeIndex = season.episodes.findIndex(
        (episode) => episode.slug === right.episode,
    );

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
