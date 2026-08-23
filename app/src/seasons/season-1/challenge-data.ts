import { seasonOne } from "@/data/season-1";
import {
    isTimestampInRange,
    type EpisodeTimestamp,
} from "@/lib/timestamps";
import { seasonOneCards, type ChallengeCard } from "./card-data";
import {
    seasonOneEpisodeOrder,
} from "./state-claims";
import type { TeamId } from "./team-data";

type ChallengeWindowBase = {
    episode: (typeof seasonOneEpisodeOrder)[number];
    team: TeamId;
    start: number;
    end: EpisodeTimestamp;
    challenge: ChallengeCard;
};

export type ChallengeWindow = ChallengeWindowBase & {
    end: EpisodeTimestamp;
};


export const seasonOneChallengeWindows: ChallengeWindow[] = [
    // Episode 1
    {
        episode: "episode-1",
        team: "ben-adam",
        start: 418,
        end: {episode: "episode-1", at: 591},
        challenge: seasonOneCards.catchBugs,
    },
    {
        episode: "episode-1",
        team: "ben-adam",
        start: 725,
        end: {episode: "episode-1", at: 841},
        challenge: seasonOneCards.getIntoxicated,
    },
    {
        episode: "episode-1",
        team: "sam-brian",
        start: 918,
        end: {episode: "episode-1", at: 1046},
        challenge: seasonOneCards.eatSpicyFood,
    },
    {
        episode: "episode-1",
        team: "sam-brian",
        start: 1253,
        end: {episode: "episode-1", at: 1428},
        challenge: seasonOneCards.bowlAStrike,
    },
    {
        episode: "episode-2",
        team: "ben-adam",
        start: 52,
        end: {episode: "episode-2", at: 363},
        challenge: seasonOneCards.solvePuzzle,
    },
    {
        episode: "episode-2",
        team: "ben-adam",
        start: 680,
        end: {episode: "episode-2", at: 817},
        challenge: seasonOneCards.buryTreasure,
    },
    {
        episode: "episode-2",
        team: "sam-brian",
        start: 878,
        end: {episode: "episode-2", at: 1133},
        challenge: seasonOneCards.recreateStatue
    },
    {
        episode: "finale",
        team: "ben-adam",
        start: 390,
        end: {episode: "finale", at: 436},
        challenge: seasonOneCards.paintTeammate
    },
    {
        episode: "finale",
        team: "ben-adam",
        start: 442,
        end: {episode: "finale", at: 567},
        challenge: seasonOneCards.busk
    },
    {
        episode: "finale",
        team: "sam-brian",
        start: 470,
        end: {episode: "finale", at: 567},
        challenge: seasonOneCards.stateDessert
    },
    {
        episode: "finale",
        team: "ben-adam",
        start: 1306,
        end: {episode: "finale", at: 1338},
        challenge: seasonOneCards.stateDish
    },
    {
        episode: "finale",
        team: "sam-brian",
        start: 1327,
        end: {episode: "finale", at: 1338},
        challenge: seasonOneCards.claimImmidiately
    }
];

export function getActiveChallenge(
    episode: string,
    currentTime: number,
    team: TeamId,
) {
    if (!seasonOneEpisodeOrder.includes(
        episode as (typeof seasonOneEpisodeOrder)[number],
    )) {
        return undefined;
    }

    const currentTimestamp = { episode, at: currentTime };
    const window = seasonOneChallengeWindows.find(
        (candidate) =>
            candidate.team === team &&
            isTimestampInRange(
                seasonOne,
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
