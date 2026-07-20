import { seasonFour } from "@/data/season-4";
import {
    compareTimestamps,
    isTimestampInRange,
    type EpisodeTimestamp,
} from "@/lib/timestamps";
import { seasonFourBattles } from "./battle-status-data";
import { seasonFourCards, type ChallengeCard } from "./hand-data";
import {
    seasonFourEpisodeOrder,
    seasonFourStateClaims,
} from "./state-claims";
import type { TeamId } from "./team-data";

type ChallengeWindowBase = {
    episode: (typeof seasonFourEpisodeOrder)[number];
    team: TeamId;
    start: number;
    challenge: ChallengeCard;
    displayTitle?: string;
    subtitle?: string;
};

type ChallengeWindowDefinition = ChallengeWindowBase & {
    // Only interrupted or abandoned attempts define their own end.
    end?: EpisodeTimestamp;
};

export type ChallengeWindow = ChallengeWindowBase & {
    end: EpisodeTimestamp;
};

type FailedChallengeBase = {
    episode: string;
    team: TeamId;
    at: number;
    state: string;
    challenge: ChallengeCard;
};

type FailedBattleChallenge = FailedChallengeBase & {
    originalClaim: {
        team: TeamId;
    };
};

export type FailedChallenge = FailedBattleChallenge;

export const seasonFourFailedChallenges: FailedChallenge[] =
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
    { episode: "episode-1", team: "ben-adam", start: 100, challenge: seasonFourCards.praiseBuilding },
    { episode: "episode-1", team: "sam-brian", start: 1176, challenge: seasonFourCards.spiritHalloween },
    { episode: "episode-1", team: "ben-adam", start: 1010, challenge: seasonFourCards.pawnShop },
    { episode: "episode-1", team: "sam-brian", start: 1715, challenge: seasonFourCards.geodeticMarker },
    { episode: "episode-1", team: "ben-adam", start: 2167, challenge: seasonFourCards.highFive },
    { episode: "episode-1", team: "sam-brian", start: 2152, challenge: seasonFourCards.photographPartner },

    // Episode 2
    { episode: "episode-2", team: "ben-adam", start: 794.49, challenge: seasonFourCards.roadsideAttraction },
    { episode: "episode-2", team: "sam-brian", start: 1185, challenge: seasonFourCards.clawMachine },
    { episode: "episode-2", team: "ben-adam", start: 1304.985, challenge: seasonFourCards.getDrunk },
    {
        episode: "episode-2",
        team: "sam-brian",
        start: 1441.365,
        end: { episode: "episode-2", at: 1881.92 },
        challenge: seasonFourCards.spendBucees,
    },

    // Episode 3
    { episode: "episode-3", team: "sam-brian", start: 338, challenge: seasonFourCards.spendBucees },
    { episode: "episode-3", team: "ben-adam", start: 455, challenge: seasonFourCards.chevyLevee },
    { episode: "episode-3", team: "ben-adam", start: 1169, challenge: seasonFourCards.criticizePlace },
    { episode: "episode-3", team: "sam-brian", start: 1554, challenge: seasonFourCards.eatInNOut },
    {
        episode: "episode-3",
        team: "ben-adam",
        start: 1869,
        challenge: seasonFourCards.breakLaw,
        displayTitle: "Seduce and Debauch an Unmarried Woman (Mich.)",
        subtitle: seasonFourCards.breakLaw.title,
    },

    // Episode 4
    { episode: "episode-4", team: "sam-brian", start: 543, challenge: seasonFourCards.fourLeafClover },
    { episode: "episode-4", team: "sam-brian", start: 1822, challenge: seasonFourCards.soupHelicopter },
    { episode: "episode-4", team: "ben-adam", start: 1289, challenge: seasonFourCards.forgeArt },
    {
        episode: "episode-4",
        team: "ben-adam",
        start: 1792,
        end: { episode: "finale", at: 266 },
        challenge: seasonFourCards.cleanPark,
    },

    // Finale
    { episode: "finale", team: "sam-brian", start: 1624, challenge: seasonFourCards.miniGolf },
    { episode: "finale", team: "sam-brian", start: 1998, challenge: seasonFourCards.advertise },
    { episode: "finale", team: "ben-adam", start: 2138, challenge: seasonFourCards.spellHelp },
];

const standardChallengeWindows: ChallengeWindow[] =
    challengeWindowDefinitions.map((window) => ({
        ...window,
        end: resolveChallengeWindowEnd(window),
    }));

const battleChallengeWindows: ChallengeWindow[] = seasonFourBattles.flatMap(
    (battle) => [battle.attacker, battle.defender].map((team) => ({
        episode: battle.revealed.episode,
        team,
        start: battle.revealed.at,
        challenge: battle.challenge,
        end: battle.concluded,
    })),
);

export const seasonFourChallengeWindows: ChallengeWindow[] = [
    ...standardChallengeWindows,
    ...battleChallengeWindows,
].sort((left, right) => compareTimestamps(
    seasonFour,
    { episode: left.episode, at: left.start },
    { episode: right.episode, at: right.start },
));

export function getActiveChallenge(
    episode: string,
    currentTime: number,
    team: TeamId,
) {
    if (!seasonFourEpisodeOrder.includes(
        episode as (typeof seasonFourEpisodeOrder)[number],
    )) {
        return undefined;
    }

    const currentTimestamp = { episode, at: currentTime };
    const window = seasonFourChallengeWindows.find(
        (candidate) =>
            candidate.team === team &&
            isTimestampInRange(
                seasonFour,
                currentTimestamp,
                { episode: candidate.episode, at: candidate.start },
                candidate.end,
            ),
    );

    if (!window) return undefined;

    return {
        ...window,
        ...window.challenge,
    };
}

function resolveChallengeWindowEnd(window: ChallengeWindowDefinition) {
    if (window.end) return window.end;

    const start = { episode: window.episode, at: window.start };
    const completion = seasonFourStateClaims.find(
        (claim) =>
            claim.team === window.team &&
            claim.challenge === window.challenge &&
            compareTimestamps(seasonFour, claim, start) >= 0,
    );
    const failure = seasonFourFailedChallenges.find(
        (challenge) =>
            challenge.team === window.team &&
            challenge.challenge === window.challenge &&
            compareTimestamps(seasonFour, challenge, start) >= 0,
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

export function getFailedChallenges(
    episode: string,
    currentTime: number,
    team: TeamId,
) {
    if (!seasonFourEpisodeOrder.includes(
        episode as (typeof seasonFourEpisodeOrder)[number],
    )) {
        return [];
    }

    const currentTimestamp = { episode, at: currentTime };

    return seasonFourFailedChallenges.filter(
        (challenge) =>
            challenge.team === team &&
            compareTimestamps(seasonFour, challenge, currentTimestamp) <= 0,
    );
}
