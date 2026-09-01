import { seasonFour } from "@/data/season-4";
import {
    compareTimestamps,
    createTimestampProjection,
} from "@/lib/timestamps";
import {
    seasonFourCards,
    type ChallengeCard,
    type HandCardKey,
} from "./challenge-card-data";
import {
    getStateClaimState,
    seasonFourStateClaims,
    type StateClaim,
} from "./state-claims";
import type { TeamId } from "./team-data";
import type { SeasonFourEpisodeTimestamp } from "./types";

type HandChange = SeasonFourEpisodeTimestamp & {
    team: TeamId;
    add?: HandCardKey[];
    remove?: HandCardKey[];
};


// Successful challenge cards are removed through seasonFourStateClaims. These
// changes only describe the initial hands, replacement draws, and card trades.
const handChanges: HandChange[] = [
    { episode: "episode-1", at: 62, team: "ben-adam", add: ["photographPartner", "praiseBuilding", "pawnShop", "roadsideAttraction", "cleanPark", "criticizePlace", "chevyLevee"] },
    { episode: "episode-1", at: 73, team: "sam-brian", add: ["grandCanyon", "shipCard", "spiritHalloween", "eatInNOut", "carnivalPrize", "highFive", "soupHelicopter"] },
    { episode: "episode-1", at: 376, team: "ben-adam", add: ["geodeticMarker"] },
    { episode: "episode-1", at: 1400, team: "sam-brian", add: ["clawMachine"] },
    { episode: "episode-1", at: 1472, team: "sam-brian", remove: ["carnivalPrize", "highFive"], add: ["geodeticMarker", "photographPartner"] },
    { episode: "episode-1", at: 1472, team: "ben-adam", remove: ["photographPartner", "geodeticMarker"], add: ["highFive", "carnivalPrize"] },
    { episode: "episode-1", at: 1702, team: "ben-adam", add: ["touchOceans"] },
    { episode: "episode-1", at: 2076, team: "sam-brian", add: ["spendBucees"] },
    { episode: "episode-1", at: 2490, team: "sam-brian", add: ["snowman"] },
    { episode: "episode-1", at: 2499, team: "ben-adam", add: ["getDrunk"] },
    { episode: "episode-2", at: 1009, team: "ben-adam", add: ["breakLaw"] },
    { episode: "episode-2", at: 1341, team: "sam-brian", add: ["buildRaft"] },
    { episode: "episode-2", at: 1628, team: "ben-adam", add: ["spellHelp"] },
    { episode: "episode-3", at: 641, team: "sam-brian", add: ["advertise"] },
    { episode: "episode-3", at: 1143, team: "ben-adam", add: ["bullseye"] },
    { episode: "episode-3", at: 1594, team: "ben-adam", add: ["skyDiving"] },
    { episode: "episode-4", at: 82, team: "sam-brian", add: ["fourLeafClover"] },
    { episode: "episode-4", at: 399, team: "ben-adam", add: ["forgeArt"] },
    { episode: "episode-4", at: 1061, team: "sam-brian", add: ["smores"] },
    { episode: "episode-4", at: 1137, team: "sam-brian", remove: ["shipCard", "snowman"], add: ["forgeArt", "spellHelp"] },
    { episode: "episode-4", at: 1137, team: "ben-adam", remove: ["forgeArt", "spellHelp"], add: ["snowman", "shipCard"] },
    { episode: "episode-4", at: 1249, team: "sam-brian", remove: ["forgeArt", "spellHelp"], add: ["touchOceans", "shipCard"] },
    { episode: "episode-4", at: 1249, team: "ben-adam", remove: ["touchOceans", "shipCard"], add: ["forgeArt", "spellHelp"] },
    { episode: "episode-4", at: 1654, team: "ben-adam", add: ["skipStone"] },
    { episode: "finale", at: 557, team: "sam-brian", add: ["miniGolf"] },
    { episode: "finale", at: 1818, team: "sam-brian", add: ["roulette"] },
    { episode: "finale", at: 2068, team: "sam-brian", remove: ["grandCanyon", "shipCard"], add: ["snowman", "spellHelp"] },
    { episode: "finale", at: 2068, team: "ben-adam", remove: ["snowman", "spellHelp"], add: ["grandCanyon", "shipCard"] },
    { episode: "finale", at: 2083, team: "sam-brian", remove: ["smores", "spellHelp"], add: ["grandCanyon", "shipCard"] },
    { episode: "finale", at: 2083, team: "ben-adam", remove: ["grandCanyon", "shipCard"], add: ["smores", "spellHelp"] },
];

const HAND_SIZE = 7;

export type Hand = readonly (ChallengeCard | null)[];

export type SeasonFourHands = Readonly<Record<TeamId, Hand>>;

const handChangeBoundaries = [
    ...handChanges.map(({ episode, at }) => ({ episode, at })),
    ...seasonFourStateClaims
        .filter((claim) => claim.challenge.kind !== "battle")
        .map(({ episode, at }) => ({ episode, at })),
];

export const getHands = createTimestampProjection({
    season: seasonFour,
    boundaries: handChangeBoundaries,
    project: (timestamp): SeasonFourHands => {
        const { historyByTeam } = getStateClaimState(timestamp);

        return {
            "sam-brian": deriveHand(
                timestamp,
                "sam-brian",
                historyByTeam["sam-brian"],
            ),
            "ben-adam": deriveHand(
                timestamp,
                "ben-adam",
                historyByTeam["ben-adam"],
            ),
        };
    },
});

function deriveHand(
    timestamp: SeasonFourEpisodeTimestamp,
    team: TeamId,
    claimHistory: readonly StateClaim[],
): Hand {
    const visibleChanges = handChanges.filter(
        (change) =>
            change.team === team &&
            compareTimestamps(seasonFour, change, timestamp) <= 0,
    );

    if (!visibleChanges.length) return [];

    const hand: HandCardKey[] = [];

    for (const change of visibleChanges) {
        for (const card of change.remove ?? []) {
            removeCard(hand, card);
        }
        hand.push(...(change.add ?? []));
    }

    const claimedCardIds = new Set(
        claimHistory
            .map((claim) => claim.challenge.id),
    );

    for (const card of [...hand]) {
        if (claimedCardIds.has(seasonFourCards[card].id)) {
            removeCard(hand, card);
        }
    }

    const currentHand: Hand = hand.map(
        (card) => seasonFourCards[card],
    );

    return [
        ...currentHand,
        ...Array.from(
            { length: Math.max(0, HAND_SIZE - currentHand.length) },
            () => null,
        ),
    ];
}

function removeCard(hand: HandCardKey[], card: HandCardKey) {
    const index = hand.indexOf(card);
    if (index !== -1) hand.splice(index, 1);
}
