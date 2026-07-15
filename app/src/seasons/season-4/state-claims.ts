export type TeamId = "sam-brian" | "ben-adam";

export type StateClaim = {
    episode: string;
    at: number;
    state: string;
    team: TeamId;
    challenge: string;
    battleWin?: BattleWin;
};

export type BattleWin = {
    episode: string;
    at: number;
    challenge: string;
    result: "held" | "stolen";
};

export const seasonFourEpisodeOrder = [
    "episode-1",
    "episode-2",
    "episode-3",
    "episode-4",
    "finale",
] as const;

export const MARYLAND_BATTLE_RESOLVED_AT = 249.78;

// Claim times are taken from the timestamped Season 4 episode transcripts.
// A later event for the same state changes its owner (Maryland in episode 2).
export const seasonFourStateClaims: StateClaim[] = [
    { episode: "episode-1", at: 304.415, state: "New York", team: "ben-adam", challenge: "Praise the ugliest building" },
    { episode: "episode-1", at: 1343, state: "District of Columbia", team: "sam-brian", challenge: "Visit every Spirit Halloween" },
    { episode: "episode-1", at: 1618, state: "Pennsylvania", team: "ben-adam", challenge: "Sell something from one pawn shop to another" },
    { episode: "episode-1", at: 1618, state: "New Jersey", team: "ben-adam", challenge: "Sell something from one pawn shop to another" },
    { episode: "episode-1", at: 1988, state: "Maryland", team: "sam-brian", challenge: "File a Geodetic Mark Recovery Form" },
    { episode: "episode-1", at: 2314, state: "Virginia", team: "sam-brian", challenge: "Photograph your partner from far away" },
    { episode: "episode-1", at: 2340, state: "Delaware", team: "ben-adam", challenge: "High five at the highest point" },

    { episode: "episode-2", at: MARYLAND_BATTLE_RESOLVED_AT, state: "Maryland", team: "ben-adam", challenge: "Find the most foreign license plate" },
    { episode: "episode-2", at: 985, state: "Connecticut", team: "ben-adam", challenge: "Respect the weirdest roadside attraction" },
    { episode: "episode-2", at: 1247, state: "Massachusetts", team: "sam-brian", challenge: "Win a prize from a claw machine" },
    { episode: "episode-2", at: 1548, state: "Rhode Island", team: "ben-adam", challenge: "Get Drunk, Again" },

    { episode: "episode-3", at: 564, state: "Tennessee", team: "sam-brian", challenge: "Spend $100 at Buc-ee's" },
    { episode: "episode-3", at: 1024, state: "Illinois", team: "ben-adam", challenge: "Take a Chevy to a levee and eat pie" },
    { episode: "episode-3", at: 1491, state: "Indiana", team: "ben-adam", challenge: "Criticize the most beautiful place" },
    { episode: "episode-3", at: 2005, state: "Texas", team: "sam-brian", challenge: "Eat at In-N-Out" },

    { episode: "episode-4", at: 377, state: "Michigan", team: "ben-adam", challenge: "Break a law from Crime Spree" },
    { episode: "episode-4", at: 895, state: "California", team: "sam-brian", challenge: "Find a four leaf clover as a leprechaun" },
    { episode: "episode-4", at: 1587, state: "Nevada", team: "ben-adam", challenge: "Forge great American art" },

    { episode: "finale", at: 266, state: "Arizona", team: "sam-brian", challenge: "Eat soup in a helicopter" },
    { episode: "finale", at: 1779, state: "Colorado", team: "sam-brian", challenge: "Get a hole in one in mini golf" },
    { episode: "finale", at: 2204, state: "Alaska", team: "ben-adam", challenge: "Spell “HELP” in rocks on an island" },
    { episode: "finale", at: 2409, state: "Wyoming", team: "sam-brian", challenge: "Ineffectively advertise Jet Lag: The Game" },
];

const seasonFourBattleWins: Array<BattleWin & { state: string; team: TeamId }> = [
    {
        episode: "episode-2",
        at: MARYLAND_BATTLE_RESOLVED_AT,
        state: "Maryland",
        team: "ben-adam",
        challenge: "Find the most foreign license plate",
        result: "stolen",
    },
    {
        episode: "episode-3",
        at: 92.384,
        state: "Massachusetts",
        team: "sam-brian",
        challenge: "Photograph the most birds",
        result: "held",
    },
    {
        episode: "finale",
        at: 1076.061,
        state: "Nevada",
        team: "ben-adam",
        challenge: "Draw George Washington",
        result: "held",
    },
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

export function getStateClaims(episode: string, currentTime: number) {
    const episodeIndex = seasonFourEpisodeOrder.indexOf(
        episode as (typeof seasonFourEpisodeOrder)[number],
    );
    const claims = new Map<string, StateClaim>();

    if (episodeIndex === -1) return claims;

    for (const claim of seasonFourStateClaims) {
        const claimEpisodeIndex = seasonFourEpisodeOrder.indexOf(
            claim.episode as (typeof seasonFourEpisodeOrder)[number],
        );
        if (
            claimEpisodeIndex < episodeIndex ||
            (claimEpisodeIndex === episodeIndex && claim.at <= currentTime)
        ) {
            claims.set(claim.state, claim);
        }
    }

    for (const battleWin of seasonFourBattleWins) {
        const battleEpisodeIndex = seasonFourEpisodeOrder.indexOf(
            battleWin.episode as (typeof seasonFourEpisodeOrder)[number],
        );
        const isVisible =
            battleEpisodeIndex < episodeIndex ||
            (battleEpisodeIndex === episodeIndex && battleWin.at <= currentTime);
        const claim = claims.get(battleWin.state);

        if (isVisible && claim?.team === battleWin.team) {
            claims.set(battleWin.state, { ...claim, battleWin });
        }
    }

    return claims;
}
