import { seasonFour } from "@/data/season-4";
import {
    compareTimestamps,
    createTimestampProjection,
    isTimestampInRange,
} from "@/lib/timestamps";
import { seasonFourBattles } from "./battle-status-data";
import { seasonFourCards, type ChallengeCard } from "./challenge-card-data";
import { seasonFourStateClaims } from "./state-claims";
import type { TeamId } from "./team-data";
import type { SeasonFourEpisodeTimestamp } from "./types";

type ChallengeWindowDetails = {
    team: TeamId;
    challenge: ChallengeCard;
    displayTitle?: string;
    subtitle?: string;
};

type ChallengeWindowDefinition = ChallengeWindowDetails & {
    start: SeasonFourEpisodeTimestamp;
    // Only interrupted or abandoned attempts define their own end.
    end?: SeasonFourEpisodeTimestamp;
};

type ChallengeWindow = ChallengeWindowDetails & {
    start: SeasonFourEpisodeTimestamp;
    end: SeasonFourEpisodeTimestamp;
};

type FailedChallengeBase = SeasonFourEpisodeTimestamp & {
    team: TeamId;
    state: string;
    challenge: ChallengeCard;
};

type FailedBattleChallenge = FailedChallengeBase & {
    originalClaim: {
        team: TeamId;
    };
};

export type FailedChallenge = FailedBattleChallenge;

const seasonFourFailedChallenges: FailedChallenge[] =
    seasonFourBattles.map((battle) => ({
        ...battle.concluded,
        team: battle.winner === battle.attacker
            ? battle.defender
            : battle.attacker,
        state: battle.state,
        challenge: battle.challenge,
        originalClaim: { team: battle.defender },
    }));

// Challenge windows are taken from the timestamped Season 4 transcripts.
// A challenge starts once a team commits to completing it and includes travel
// undertaken specifically for that card. It ends when the task is completed,
// fails, is abandoned, or is superseded by a battle challenge. Completed and
// failed windows derive their end from the corresponding outcome record.
// Battle windows are derived separately from their authoritative battle record.
const challengeWindowDefinitions: ChallengeWindowDefinition[] = [
    // Episode 1
    { start: { episode: "episode-1", at: 100 }, team: "ben-adam", challenge: seasonFourCards.praiseBuilding },
    { start: { episode: "episode-1", at: 1176 }, team: "sam-brian", challenge: seasonFourCards.spiritHalloween },
    { start: { episode: "episode-1", at: 1010 }, team: "ben-adam", challenge: seasonFourCards.pawnShop },
    { start: { episode: "episode-1", at: 1715 }, team: "sam-brian", challenge: seasonFourCards.geodeticMarker },
    { start: { episode: "episode-1", at: 2167 }, team: "ben-adam", challenge: seasonFourCards.highFive },
    { start: { episode: "episode-1", at: 2152 }, team: "sam-brian", challenge: seasonFourCards.photographPartner },

    // Episode 2
    { start: { episode: "episode-2", at: 794.49 }, team: "ben-adam", challenge: seasonFourCards.roadsideAttraction },
    { start: { episode: "episode-2", at: 1185 }, team: "sam-brian", challenge: seasonFourCards.clawMachine },
    { start: { episode: "episode-2", at: 1304.985 }, team: "ben-adam", challenge: seasonFourCards.getDrunk },
    {
        start: { episode: "episode-2", at: 1441.365 },
        team: "sam-brian",
        end: { episode: "episode-2", at: 1881.92 },
        challenge: seasonFourCards.spendBucees,
    },

    // Episode 3
    { start: { episode: "episode-3", at: 338 }, team: "sam-brian", challenge: seasonFourCards.spendBucees },
    { start: { episode: "episode-3", at: 455 }, team: "ben-adam", challenge: seasonFourCards.chevyLevee },
    { start: { episode: "episode-3", at: 1169 }, team: "ben-adam", challenge: seasonFourCards.criticizePlace },
    { start: { episode: "episode-3", at: 1554 }, team: "sam-brian", challenge: seasonFourCards.eatInNOut },
    {
        start: { episode: "episode-3", at: 1869 },
        team: "ben-adam",
        challenge: seasonFourCards.breakLaw,
        displayTitle: "Seduce and Debauch an Unmarried Woman (Mich.)",
        subtitle: seasonFourCards.breakLaw.title,
    },

    // Episode 4
    { start: { episode: "episode-4", at: 543 }, team: "sam-brian", challenge: seasonFourCards.fourLeafClover },
    { start: { episode: "episode-4", at: 1822 }, team: "sam-brian", challenge: seasonFourCards.soupHelicopter },
    { start: { episode: "episode-4", at: 1289 }, team: "ben-adam", challenge: seasonFourCards.forgeArt },
    {
        start: { episode: "episode-4", at: 1792 },
        team: "ben-adam",
        end: { episode: "finale", at: 266 },
        challenge: seasonFourCards.cleanPark,
    },

    // Finale
    { start: { episode: "finale", at: 1624 }, team: "sam-brian", challenge: seasonFourCards.miniGolf },
    { start: { episode: "finale", at: 1998 }, team: "sam-brian", challenge: seasonFourCards.advertise },
    { start: { episode: "finale", at: 2138 }, team: "ben-adam", challenge: seasonFourCards.spellHelp },
];

const standardChallengeWindows: ChallengeWindow[] =
    challengeWindowDefinitions.map((window) => ({
        ...window,
        end: resolveChallengeWindowEnd(window),
    }));

const battleChallengeWindows: ChallengeWindow[] = seasonFourBattles.flatMap(
    (battle) => [battle.attacker, battle.defender].map((team) => ({
        team,
        start: battle.revealed,
        challenge: battle.challenge,
        end: battle.concluded,
    })),
);

const seasonFourChallengeWindows: ChallengeWindow[] = [
    ...standardChallengeWindows,
    ...battleChallengeWindows,
].sort((left, right) => compareTimestamps(
    seasonFour,
    left.start,
    right.start,
));

function resolveChallengeWindowEnd(window: ChallengeWindowDefinition) {
    if (window.end) return window.end;

    const completion = seasonFourStateClaims.find(
        (claim) =>
            claim.team === window.team &&
            claim.challenge === window.challenge &&
            compareTimestamps(seasonFour, claim, window.start) >= 0,
    );
    const failure = seasonFourFailedChallenges.find(
        (challenge) =>
            challenge.team === window.team &&
            challenge.challenge === window.challenge &&
            compareTimestamps(seasonFour, challenge, window.start) >= 0,
    );

    if (completion && failure) {
        return compareTimestamps(seasonFour, completion, failure) <= 0
            ? completion
            : failure;
    }
    if (completion) return completion;
    if (failure) return failure;

    throw new Error(
        `Challenge window for "${window.challenge.title}" has no claim, failure, or explicit end time.`,
    );
}

export type ActiveChallenge = ChallengeWindow & ChallengeCard;

type TeamChallengeState = {
    active: ActiveChallenge | null;
    failed: readonly FailedChallenge[];
};

export type SeasonFourChallengeState = Readonly<
    Record<TeamId, TeamChallengeState>
>;

const challengeChangeBoundaries = [
    ...seasonFourChallengeWindows.flatMap(({ start, end }) => [start, end]),
    ...seasonFourFailedChallenges.map(({ episode, at }) => ({ episode, at })),
];

export const getChallengeState = createTimestampProjection({
    season: seasonFour,
    boundaries: challengeChangeBoundaries,
    project: (timestamp): SeasonFourChallengeState => ({
        "sam-brian": getTeamChallengeState("sam-brian", timestamp),
        "ben-adam": getTeamChallengeState("ben-adam", timestamp),
    }),
});

function getTeamChallengeState(
    team: TeamId,
    timestamp: SeasonFourEpisodeTimestamp,
): TeamChallengeState {
    const window = seasonFourChallengeWindows.find(
        (candidate) =>
            candidate.team === team &&
            isTimestampInRange(
                seasonFour,
                timestamp,
                candidate.start,
                candidate.end,
            ),
    );
    const failed = seasonFourFailedChallenges.filter(
        (challenge) =>
            challenge.team === team &&
            compareTimestamps(seasonFour, challenge, timestamp) <= 0,
    );

    return {
        active: window ? { ...window, ...window.challenge } : null,
        failed,
    };
}
