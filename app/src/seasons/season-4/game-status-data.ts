import { seasonFourEpisodeOrder, type TeamId } from "./state-claims";

export type BattlePhase = "countdown" | "active" | "concluded";

export type BattleStatus = {
    state: string;
    phase: BattlePhase;
    attacker: TeamId;
    defender: TeamId;
    challenge?: string;
    description?: string;
    winner?: TeamId;
};

type EpisodeSlug = (typeof seasonFourEpisodeOrder)[number];

type VideoTimestamp = {
    episode: EpisodeSlug;
    at: number;
};

type BattleDefinition = {
    state: string;
    attacker: TeamId;
    defender: TeamId;
    challenge: string;
    description: string;
    winner: TeamId;
    declared: VideoTimestamp;
    revealed: VideoTimestamp;
    concluded: VideoTimestamp;
    hidden: VideoTimestamp;
};

const battleDefinitions: BattleDefinition[] = [
    {
        state: "Maryland",
        attacker: "ben-adam",
        defender: "sam-brian",
        challenge: "Find the Most Foreign License Plates",
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
        challenge: "Photograph the Most Birds",
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
        challenge: "Draw George Washington",
        description: "Each team must select one player to draw a portrait of George Washington. That player has 30 minutes to gather materials and create the portrait in any way possible. At the end of the 30 minutes, the portraits are judged by an anonymous poll posted on Sam's Twitter account.",
        winner: "ben-adam",
        declared: { episode: "finale", at: 8 * 60 + 32 },
        revealed: { episode: "finale", at: 10 * 60 + 57 },
        concluded: { episode: "finale", at: 17 * 60 + 55 },
        hidden: { episode: "finale", at: 18 * 60 + 37 },
    },
];

function compareVideoPosition(
    episodeSlug: string,
    currentTime: number,
    timestamp: VideoTimestamp,
) {
    const currentEpisodeIndex = seasonFourEpisodeOrder.indexOf(
        episodeSlug as EpisodeSlug,
    );
    const timestampEpisodeIndex = seasonFourEpisodeOrder.indexOf(
        timestamp.episode,
    );

    if (currentEpisodeIndex !== timestampEpisodeIndex) {
        return currentEpisodeIndex - timestampEpisodeIndex;
    }

    return currentTime - timestamp.at;
}

/** Returns the battle state visible at a given point in the Season 4 videos. */
export function getBattleStatus(
    episodeSlug: string,
    currentTime: number,
): BattleStatus | undefined {
    if (!seasonFourEpisodeOrder.includes(episodeSlug as EpisodeSlug)) {
        return undefined;
    }

    const battle = battleDefinitions.find(
        (candidate) =>
            compareVideoPosition(episodeSlug, currentTime, candidate.declared) >= 0 &&
            compareVideoPosition(episodeSlug, currentTime, candidate.hidden) < 0,
    );

    if (!battle) return undefined;

    const isRevealed = compareVideoPosition(
        episodeSlug,
        currentTime,
        battle.revealed,
    ) >= 0;
    const isConcluded = compareVideoPosition(
        episodeSlug,
        currentTime,
        battle.concluded,
    ) >= 0;

    return {
        state: battle.state,
        phase: isConcluded ? "concluded" : isRevealed ? "active" : "countdown",
        attacker: battle.attacker,
        defender: battle.defender,
        challenge: isRevealed ? battle.challenge : undefined,
        description: isRevealed ? battle.description : undefined,
        winner: isConcluded ? battle.winner : undefined,
    };
}
