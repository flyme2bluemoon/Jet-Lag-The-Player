import { seasonFour } from "@/data/season-4";
import { compareTimestamps } from "@/lib/timestamps";
import { seasonFourBattles } from "./battle-status-data";
import { seasonFourCards, type ChallengeCard } from "./hand-data";
import type { TeamId } from "./team-data";

export type StateClaim = {
    episode: string;
    at: number;
    state: string;
    team: TeamId;
    challenge: ChallengeCard;
};

export const seasonFourEpisodeOrder = [
    "episode-1",
    "episode-2",
    "episode-3",
    "episode-4",
    "finale",
] as const;

// Claim times are taken from the timestamped Season 4 episode transcripts.
// A later event for the same state becomes its current claim. This covers both
// ownership changes and successful battle defenses.
const standardStateClaims: StateClaim[] = [
    { episode: "episode-1", at: 308, state: "New York", team: "ben-adam", challenge: seasonFourCards.praiseBuilding },
    { episode: "episode-1", at: 1343, state: "District of Columbia", team: "sam-brian", challenge: seasonFourCards.spiritHalloween },
    { episode: "episode-1", at: 1618, state: "Pennsylvania", team: "ben-adam", challenge: seasonFourCards.pawnShop },
    { episode: "episode-1", at: 1618, state: "New Jersey", team: "ben-adam", challenge: seasonFourCards.pawnShop },
    { episode: "episode-1", at: 1988, state: "Maryland", team: "sam-brian", challenge: seasonFourCards.geodeticMarker },
    { episode: "episode-1", at: 2314, state: "Virginia", team: "sam-brian", challenge: seasonFourCards.photographPartner },
    { episode: "episode-1", at: 2340, state: "Delaware", team: "ben-adam", challenge: seasonFourCards.highFive },

    { episode: "episode-2", at: 985, state: "Connecticut", team: "ben-adam", challenge: seasonFourCards.roadsideAttraction },
    { episode: "episode-2", at: 1247, state: "Massachusetts", team: "sam-brian", challenge: seasonFourCards.clawMachine },
    { episode: "episode-2", at: 1548, state: "Rhode Island", team: "ben-adam", challenge: seasonFourCards.getDrunk },

    { episode: "episode-3", at: 564, state: "Tennessee", team: "sam-brian", challenge: seasonFourCards.spendBucees },
    { episode: "episode-3", at: 1024, state: "Illinois", team: "ben-adam", challenge: seasonFourCards.chevyLevee },
    { episode: "episode-3", at: 1491, state: "Indiana", team: "ben-adam", challenge: seasonFourCards.criticizePlace },
    { episode: "episode-3", at: 2005, state: "Texas", team: "sam-brian", challenge: seasonFourCards.eatInNOut },

    { episode: "episode-4", at: 377, state: "Michigan", team: "ben-adam", challenge: seasonFourCards.breakLaw },
    { episode: "episode-4", at: 895, state: "California", team: "sam-brian", challenge: seasonFourCards.fourLeafClover },
    { episode: "episode-4", at: 1587, state: "Nevada", team: "ben-adam", challenge: seasonFourCards.forgeArt },

    { episode: "finale", at: 266, state: "Arizona", team: "sam-brian", challenge: seasonFourCards.soupHelicopter },
    { episode: "finale", at: 1779, state: "Colorado", team: "sam-brian", challenge: seasonFourCards.miniGolf },
    { episode: "finale", at: 2204, state: "Alaska", team: "ben-adam", challenge: seasonFourCards.spellHelp },
    { episode: "finale", at: 2409, state: "Wyoming", team: "sam-brian", challenge: seasonFourCards.advertise },
];

const battleStateClaims: StateClaim[] = seasonFourBattles.map((battle) => ({
    ...battle.concluded,
    state: battle.state,
    team: battle.winner,
    challenge: battle.challenge,
}));

export const seasonFourStateClaims: StateClaim[] = [
    ...standardStateClaims,
    ...battleStateClaims,
].sort((left, right) => compareTimestamps(seasonFour, left, right));

const stateClaimsSnapshotCache = new Map<
    number,
    ReadonlyMap<string, StateClaim>
>();
const emptyStateClaims = new Map<string, StateClaim>();

export function getStateClaims(
    episode: string,
    currentTime: number,
): ReadonlyMap<string, StateClaim> {
    if (!seasonFourEpisodeOrder.includes(
        episode as (typeof seasonFourEpisodeOrder)[number],
    )) {
        return emptyStateClaims;
    }

    const currentTimestamp = { episode, at: currentTime };
    const revision = seasonFourStateClaims.reduce(
        (count, claim) => count + Number(
            compareTimestamps(seasonFour, claim, currentTimestamp) <= 0,
        ),
        0,
    );
    const cachedClaims = stateClaimsSnapshotCache.get(revision);
    if (cachedClaims) return cachedClaims;

    const claims = new Map<string, StateClaim>();

    for (const claim of seasonFourStateClaims) {
        if (compareTimestamps(seasonFour, claim, currentTimestamp) <= 0) {
            claims.set(claim.state, claim);
        }
    }

    stateClaimsSnapshotCache.set(revision, claims);
    return claims;
}

export function getPreviousStateClaim(claim: StateClaim) {
    let previousClaim: StateClaim | undefined;

    for (const candidate of seasonFourStateClaims) {
        if (candidate === claim) return previousClaim;
        if (candidate.state === claim.state) previousClaim = candidate;
    }

    return previousClaim;
}
