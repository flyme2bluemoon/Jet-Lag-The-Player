import { seasonFour } from "@/data/season-4";
import {
    compareTimestamps,
    createTimestampProjection,
} from "@/lib/timestamps";
import {
    getStateClaimState,
    seasonFourStateClaims,
    type StateClaim,
} from "./state-claims";
import type { TeamId } from "./team-data";
import type { SeasonFourEpisodeTimestamp } from "./types";

const AREA_BONUS_REVEALED_AT = {
    episode: "episode-2",
    at: 24 * 60 + 29,
} satisfies SeasonFourEpisodeTimestamp;

export const FINAL_SCORE_REVEALED_AT = {
    episode: "finale",
    at: 40 * 60 + 50,
} satisfies SeasonFourEpisodeTimestamp;

const AREA_BONUS_POINTS = 2;

// Census Bureau MAF/TIGER total-area measurements in square miles, rounded to
// the nearest square mile.
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

type StateCountScore = {
    states: number;
};

export type AreaBonusScore = StateCountScore & {
    area: number;
    bonus: number;
};

type FinalScore = AreaBonusScore & {
    total: number;
};

type TeamScores<Score> = Readonly<Record<TeamId, Score>>;

export type SeasonFourScore =
    | {
        phase: "state-count";
        byTeam: TeamScores<StateCountScore>;
    }
    | {
        phase: "area-bonus";
        byTeam: TeamScores<AreaBonusScore>;
    }
    | {
        phase: "final";
        byTeam: TeamScores<FinalScore>;
    };

const scoreChangeBoundaries = [
    AREA_BONUS_REVEALED_AT,
    FINAL_SCORE_REVEALED_AT,
    ...seasonFourStateClaims.map(({ episode, at }) => ({ episode, at })),
];

export const getSeasonFourScore = createTimestampProjection({
    season: seasonFour,
    boundaries: scoreChangeBoundaries,
    project: (timestamp): SeasonFourScore => {
        const claimedStates = getStateClaimState(timestamp).claimedStates;
        const claimsByTeam = groupClaimsByTeam(claimedStates.values());
        const isAreaBonusRevealed = compareTimestamps(
            seasonFour,
            timestamp,
            AREA_BONUS_REVEALED_AT,
        ) >= 0;
        const isFinal = compareTimestamps(
            seasonFour,
            timestamp,
            FINAL_SCORE_REVEALED_AT,
        ) >= 0;

        if (!isAreaBonusRevealed) {
            return {
                phase: "state-count",
                byTeam: {
                    "sam-brian": { states: claimsByTeam["sam-brian"].length },
                    "ben-adam": { states: claimsByTeam["ben-adam"].length },
                },
            };
        }

        const areaBonusScores = getAreaBonusScores(claimsByTeam);

        return isFinal
            ? {
                phase: "final",
                byTeam: {
                    "sam-brian": withTotal(areaBonusScores["sam-brian"]),
                    "ben-adam": withTotal(areaBonusScores["ben-adam"]),
                },
            }
            : { phase: "area-bonus", byTeam: areaBonusScores };
    },
});

function groupClaimsByTeam(claims: Iterable<StateClaim>) {
    const byTeam: Record<TeamId, StateClaim[]> = {
        "sam-brian": [],
        "ben-adam": [],
    };

    for (const claim of claims) byTeam[claim.team].push(claim);
    return byTeam;
}

function withTotal(score: AreaBonusScore): FinalScore {
    return { ...score, total: score.states + score.bonus };
}

function getAreaBonusScores(
    claimsByTeam: Readonly<Record<TeamId, readonly StateClaim[]>>,
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

function getClaimedArea(claims: readonly StateClaim[]) {
    return claims.reduce((total, claim) => total + (stateAreas[claim.state] ?? 0), 0);
}

function makeScore(
    team: TeamId,
    claimsByTeam: Readonly<Record<TeamId, readonly StateClaim[]>>,
    areas: Record<TeamId, number>,
    leader: TeamId | undefined,
): AreaBonusScore {
    const states = claimsByTeam[team].length;
    const bonus = leader === team ? AREA_BONUS_POINTS : 0;

    return { area: areas[team], bonus, states };
}
