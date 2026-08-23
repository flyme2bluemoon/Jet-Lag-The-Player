import { seasonOne } from "@/data/season-1";
import { compareTimestamps } from "@/lib/timestamps";
import type { TeamId } from "./team-data";
import type { ChallengeCard } from "./card-data";
import { seasonOneCards } from "./card-data";

export type StateClaim = {
    episode: string;
    at: number;
    state: string;
    team: TeamId;
    challenge: ChallengeCard;
};

export const seasonOneEpisodeOrder = [
    "episode-1",
    "episode-2",
    "finale",
] as const;

export const seasonOneStateClaims: StateClaim[] = [
    { episode: "episode-1", at: 591, state: "Wyoming", team: "ben-adam", challenge: seasonOneCards.catchBugs},
    { episode: "episode-1", at: 841, state: "Colorado", team: "ben-adam", challenge: seasonOneCards.getIntoxicated},
    { episode: "episode-1", at: 1046, state: "California", team: "sam-brian", challenge: seasonOneCards.eatSpicyFood},
    { episode: "episode-1", at: 1428, state: "Nevada", team: "sam-brian", challenge: seasonOneCards.bowlAStrike},
    { episode: "episode-2", at: 363, state: "Arizona", team: "ben-adam", challenge: seasonOneCards.solvePuzzle},
    { episode: "episode-2", at: 817, state: "Oregon", team: "ben-adam", challenge: seasonOneCards.buryTreasure},
    { episode: "episode-2", at: 1133, state: "Idaho", team: "sam-brian", challenge: seasonOneCards.recreateStatue},
    { episode: "finale", at: 567, state: "Utah", team: "ben-adam", challenge: seasonOneCards.busk},
    { episode: "finale", at: 1338, state: "Montana", team: "sam-brian", challenge: seasonOneCards.claimImmidiately},
];

const stateClaimsSnapshotCache = new Map<
    number,
    ReadonlyMap<string, StateClaim>
>();
const emptyStateClaims = new Map<string, StateClaim>();

export function getStateClaims(
    episode: string,
    currentTime: number,
): ReadonlyMap<string, StateClaim> {
    if (!seasonOneEpisodeOrder.includes(
        episode as (typeof seasonOneEpisodeOrder)[number],
    )) {
        return emptyStateClaims;
    }

    const currentTimestamp = { episode, at: currentTime };
    const revision = seasonOneStateClaims.reduce(
        (count, claim) => count + Number(
            compareTimestamps(seasonOne, claim, currentTimestamp) <= 0,
        ),
        0,
    );
    const cachedClaims = stateClaimsSnapshotCache.get(revision);
    if (cachedClaims) return cachedClaims;

    const claims = new Map<string, StateClaim>();

    for (const claim of seasonOneStateClaims) {
        if (compareTimestamps(seasonOne, claim, currentTimestamp) <= 0) {
            claims.set(claim.state, claim);
        }
    }

    stateClaimsSnapshotCache.set(revision, claims);
    return claims;
}

export function getPreviousStateClaim(claim: StateClaim) {
    let previousClaim: StateClaim | undefined;

    for (const candidate of seasonOneStateClaims) {
        if (candidate === claim) return previousClaim;
        if (candidate.state === claim.state) previousClaim = candidate;
    }

    return previousClaim;
}
