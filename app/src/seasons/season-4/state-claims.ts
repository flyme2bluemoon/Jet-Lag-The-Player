export type TeamId = "sam-brian" | "ben-adam";

export type StateClaim = {
    episode: string;
    at: number;
    state: string;
    team: TeamId;
};

export const seasonFourEpisodeOrder = [
    "episode-1",
    "episode-2",
    "episode-3",
    "episode-4",
    "finale",
] as const;

// Claim times are taken from the timestamped Season 4 episode transcripts.
// A later event for the same state changes its owner (Maryland in episode 2).
export const seasonFourStateClaims: StateClaim[] = [
    { episode: "episode-1", at: 304.415, state: "New York", team: "ben-adam" },
    { episode: "episode-1", at: 1375.284, state: "District of Columbia", team: "sam-brian" },
    { episode: "episode-1", at: 1653.524, state: "Pennsylvania", team: "ben-adam" },
    { episode: "episode-1", at: 1653.524, state: "New Jersey", team: "ben-adam" },
    { episode: "episode-1", at: 2021.7, state: "Maryland", team: "sam-brian" },
    { episode: "episode-1", at: 2309.38, state: "Virginia", team: "sam-brian" },
    { episode: "episode-1", at: 2334.36, state: "Delaware", team: "ben-adam" },

    { episode: "episode-2", at: 249.78, state: "Maryland", team: "ben-adam" },
    { episode: "episode-2", at: 1066.375, state: "Connecticut", team: "ben-adam" },
    { episode: "episode-2", at: 1286.84, state: "Massachusetts", team: "sam-brian" },
    { episode: "episode-2", at: 1540.425, state: "Rhode Island", team: "ben-adam" },

    { episode: "episode-3", at: 593.295, state: "Tennessee", team: "sam-brian" },
    { episode: "episode-3", at: 1021.094, state: "Illinois", team: "ben-adam" },
    { episode: "episode-3", at: 1573.755, state: "Indiana", team: "ben-adam" },
    { episode: "episode-3", at: 2079.943, state: "Texas", team: "sam-brian" },

    { episode: "episode-4", at: 371.604, state: "Michigan", team: "ben-adam" },
    { episode: "episode-4", at: 909.135, state: "California", team: "sam-brian" },
    { episode: "episode-4", at: 1621.995, state: "Nevada", team: "ben-adam" },

    { episode: "finale", at: 339.3, state: "Arizona", team: "sam-brian" },
    { episode: "finale", at: 1904.22, state: "Colorado", team: "sam-brian" },
    { episode: "finale", at: 2200.245, state: "Alaska", team: "ben-adam" },
    { episode: "finale", at: 2405.685, state: "Wyoming", team: "sam-brian" },
];

export function getStateOwners(episode: string, currentTime: number) {
    const episodeIndex = seasonFourEpisodeOrder.indexOf(
        episode as (typeof seasonFourEpisodeOrder)[number],
    );
    const owners = new Map<string, TeamId>();

    if (episodeIndex === -1) return owners;

    for (const claim of seasonFourStateClaims) {
        const claimEpisodeIndex = seasonFourEpisodeOrder.indexOf(
            claim.episode as (typeof seasonFourEpisodeOrder)[number],
        );
        if (
            claimEpisodeIndex < episodeIndex ||
            (claimEpisodeIndex === episodeIndex && claim.at <= currentTime)
        ) {
            owners.set(claim.state, claim.team);
        }
    }

    return owners;
}
