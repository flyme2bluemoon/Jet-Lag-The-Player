import { seasonFour } from "@/data/season-4";
import {
    compareTimestamps,
    createTimestampProjection,
    isTimestampInRange,
} from "@/lib/timestamps";
import { seasonFourCards, type ChallengeCard } from "./challenge-card-data";
import type { TeamId } from "./team-data";
import type { SeasonFourEpisodeTimestamp } from "./types";

type BattleStatusBase = {
    state: string;
    attacker: TeamId;
    defender: TeamId;
};

export type BattleStatus = BattleStatusBase & (
    | { phase: "countdown" }
    | {
        phase: "active";
        challenge: string;
        description: string;
    }
    | {
        phase: "concluded";
        challenge: string;
        description: string;
        winner: TeamId;
    }
);

export type BattlePhase = BattleStatus["phase"];

type BattleChallengeCard = ChallengeCard & {
    kind: "battle";
};

type BattleDefinition = {
    state: string;
    attacker: TeamId;
    defender: TeamId;
    challenge: BattleChallengeCard;
    description: string;
    winner: TeamId;
    declared: SeasonFourEpisodeTimestamp;
    revealed: SeasonFourEpisodeTimestamp;
    concluded: SeasonFourEpisodeTimestamp;
    hidden: SeasonFourEpisodeTimestamp;
};

/** Authoritative records for every Season 4 battle and its lifecycle. */
export const seasonFourBattles: BattleDefinition[] = [
    {
        state: "Maryland",
        attacker: "ben-adam",
        defender: "sam-brian",
        challenge: seasonFourCards.foreignLicensePlateBattle,
        description: "At the end of 15 minutes, the team that finds a license plate from the state or country farthest from their current location wins. Distance is measured from the location where the plate was spotted to the closest point in that state or country.",
        winner: "ben-adam",
        declared: { episode: "episode-1", at: 42 * 60 + 39 },
        revealed: { episode: "episode-2", at: 33 },
        concluded: { episode: "episode-2", at: 4 * 60 + 13 },
        hidden: { episode: "episode-2", at: 4 * 60 + 28 },
    },
    {
        state: "Massachusetts",
        attacker: "ben-adam",
        defender: "sam-brian",
        challenge: seasonFourCards.photographBirdsBattle,
        description: "You have 15 minutes. All photographed birds must be clearly visible and must be actual birds. You cannot intentionally photograph the same bird twice.",
        winner: "sam-brian",
        declared: { episode: "episode-2", at: 29 * 60 + 15 },
        revealed: { episode: "episode-2", at: 31 * 60 + 35 },
        concluded: { episode: "episode-3", at: 1 * 60 + 56 },
        hidden: { episode: "episode-3", at: 2 * 60 + 39 },
    },
    {
        state: "Nevada",
        attacker: "sam-brian",
        defender: "ben-adam",
        challenge: seasonFourCards.drawGeorgeWashingtonBattle,
        description: "Each team must select one player to draw a portrait of George Washington. That player has 30 minutes to gather materials and create the portrait in any way possible. At the end of the 30 minutes, the portraits are judged by an anonymous poll posted on Sam's Twitter account.",
        winner: "ben-adam",
        declared: { episode: "finale", at: 8 * 60 + 32 },
        revealed: { episode: "finale", at: 10 * 60 + 57 },
        concluded: { episode: "finale", at: 17 * 60 + 55 },
        hidden: { episode: "finale", at: 18 * 60 + 37 },
    },
];

const battleChangeBoundaries = seasonFourBattles.flatMap(
    ({ declared, revealed, concluded, hidden }) => [
        declared,
        revealed,
        concluded,
        hidden,
    ],
);

/** Returns the Battle visible at a given Season 4 Episode timestamp. */
export const getBattleStatus = createTimestampProjection({
    season: seasonFour,
    boundaries: battleChangeBoundaries,
    project: (timestamp): BattleStatus | null => {
        const battle = seasonFourBattles.find(
            (candidate) => isTimestampInRange(
                seasonFour,
                timestamp,
                candidate.declared,
                candidate.hidden,
            ),
        );

        if (!battle) return null;

        const isRevealed = compareTimestamps(
            seasonFour,
            timestamp,
            battle.revealed,
        ) >= 0;
        const isConcluded = compareTimestamps(
            seasonFour,
            timestamp,
            battle.concluded,
        ) >= 0;

        const participants = {
            state: battle.state,
            attacker: battle.attacker,
            defender: battle.defender,
        };

        if (!isRevealed) {
            return { ...participants, phase: "countdown" };
        }

        const challenge = {
            challenge: battle.challenge.title,
            description: battle.description,
        };

        if (!isConcluded) {
            return { ...participants, ...challenge, phase: "active" };
        }

        return {
            ...participants,
            ...challenge,
            phase: "concluded",
            winner: battle.winner,
        };
    },
});
