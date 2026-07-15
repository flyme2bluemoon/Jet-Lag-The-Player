import {
    seasonFourEpisodeOrder,
    type StateClaim,
    type TeamId,
} from "./state-claims";

export const AREA_BONUS_REVEALED_AT = 24 * 60 + 29;
export const AREA_BONUS_POINTS = 2;

// Total areas in square miles, rounded to the nearest square mile. These match
// the Census Bureau's MAF/TIGER state area measurements and the total-area
// figure for Texas cited in the show.
const stateAreas: Record<string, number> = {
    Alaska: 665384,
    Arizona: 113990,
    California: 163695,
    Colorado: 104094,
    Connecticut: 5543,
    Delaware: 2489,
    "District of Columbia": 68,
    Illinois: 57914,
    Indiana: 36420,
    Maryland: 12406,
    Massachusetts: 10554,
    Michigan: 96714,
    Nevada: 110572,
    "New Jersey": 8723,
    "New York": 54555,
    Pennsylvania: 46054,
    "Rhode Island": 1545,
    Tennessee: 42144,
    Texas: 268596,
    Virginia: 42775,
    Wyoming: 97813,
};

export type AreaBonusScore = {
    area: number;
    bonus: number;
    states: number;
};

export function isAreaBonusVisible(episodeSlug: string, currentTime: number) {
    const episodeIndex = seasonFourEpisodeOrder.indexOf(
        episodeSlug as (typeof seasonFourEpisodeOrder)[number],
    );
    const revealEpisodeIndex = seasonFourEpisodeOrder.indexOf("episode-2");

    return episodeIndex > revealEpisodeIndex || (
        episodeIndex === revealEpisodeIndex && currentTime >= AREA_BONUS_REVEALED_AT
    );
}

export function getAreaBonusScores(
    claimsByTeam: Record<TeamId, StateClaim[]>,
): Record<TeamId, AreaBonusScore> {
    const areas: Record<TeamId, number> = {
        "sam-brian": getClaimedArea(claimsByTeam["sam-brian"]),
        "ben-adam": getClaimedArea(claimsByTeam["ben-adam"]),
    };
    const leader = areas["sam-brian"] === areas["ben-adam"]
        ? undefined
        : areas["sam-brian"] > areas["ben-adam"]
            ? "sam-brian"
            : "ben-adam";

    return {
        "sam-brian": makeScore("sam-brian", claimsByTeam, areas, leader),
        "ben-adam": makeScore("ben-adam", claimsByTeam, areas, leader),
    };
}

function getClaimedArea(claims: StateClaim[]) {
    return claims.reduce((total, claim) => total + (stateAreas[claim.state] ?? 0), 0);
}

function makeScore(
    team: TeamId,
    claimsByTeam: Record<TeamId, StateClaim[]>,
    areas: Record<TeamId, number>,
    leader: TeamId | undefined,
): AreaBonusScore {
    const states = claimsByTeam[team].length;
    const bonus = leader === team ? AREA_BONUS_POINTS : 0;

    return { area: areas[team], bonus, states };
}
