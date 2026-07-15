import { seasonFour } from "@/data/season-4";
import { compareTimestamps } from "@/lib/timestamps";
import type { StateClaim } from "./state-claims";
import type { TeamId } from "./team-data";

export type ChallengeCard = {
    id: string;
    title: string;
    description: string;
    kind?: "battle";
    powerUpTokens?: 1 | 2;
    doubleClaim?: boolean;
};

type EpisodeSlug = (typeof seasonFour.episodes)[number]["slug"];

type HandChange = {
    episode: EpisodeSlug;
    at: number;
    team: TeamId;
    add?: ChallengeCardKey[];
    remove?: ChallengeCardKey[];
};

export const seasonFourCards = {
    praiseBuilding: {
        id: "praise-building",
        title: "Praise the ugliest building",
        description: "Find the ugliest building you can and sincerely praise three things about it.",
    },
    pawnShop: {
        id: "pawn-shop",
        title: "Sell something from one pawn shop to another",
        description: "Purchase an item at a pawn shop, then sell it for at least half its purchase price at a pawn shop in another state.",
        doubleClaim: true,
    },
    roadsideAttraction: {
        id: "roadside-attraction",
        title: "Respect the weirdest roadside attraction",
        description: "Visit the state's weirdest roadside attraction and salute it for the entire national anthem.",
        powerUpTokens: 1,
    },
    cleanPark: {
        id: "clean-park",
        title: "Clean up a national park",
        description: "Pick up at least five separate pieces of litter in a national park and properly dispose of them.",
        powerUpTokens: 1,
    },
    criticizePlace: {
        id: "criticize-place",
        title: "Criticize the most beautiful place",
        description: "Travel to the state's most beautiful location and list three things you hate about it.",
        powerUpTokens: 1,
    },
    chevyLevee: {
        id: "chevy-levee",
        title: "Take a Chevy to a levee and eat pie",
        description: "Arrive at a levee in a Chevrolet, then fully consume at least one slice of pie between both teammates.",
        powerUpTokens: 1,
    },
    photographPartner: {
        id: "photograph-partner",
        title: "Photograph your partner from far away",
        description: "From at least half a mile away, photograph your teammate so they are visible in the image.",
    },
    geodeticMarker: {
        id: "geodetic-marker",
        title: "File a Geodetic Mark Recovery Form",
        description: "Find a geodetic survey mark and submit an official recovery report for it.",
    },
    highFive: {
        id: "high-five",
        title: "High five at the highest point",
        description: "Photograph both teammates jumping and high fiving at the state's highest publicly accessible point.",
        powerUpTokens: 1,
    },
    carnivalPrize: {
        id: "carnival-prize",
        title: "Win a top-tier prize at a carnival game",
        description: "Win the most difficult-to-win prize at a human-administered carnival or amusement park game.",
        powerUpTokens: 1,
    },
    grandCanyon: {
        id: "grand-canyon",
        title: "Go to the Grand Canyon",
        description: "Enter Grand Canyon National Park and get a clear view of the Grand Canyon.",
        powerUpTokens: 2,
    },
    shipCard: {
        id: "ship-card",
        title: "Ship this card",
        description: "Ship this card to another state, then retrieve it there to claim the state where it arrived.",
        powerUpTokens: 1,
    },
    spiritHalloween: {
        id: "spirit-halloween",
        title: "Visit every Spirit Halloween",
        description: "Visit every Spirit Halloween in the state, buy one costume item at each, and wear the assembled costume.",
        powerUpTokens: 1,
    },
    eatInNOut: {
        id: "eat-in-n-out",
        title: "Eat at In-N-Out",
        description: "Visit any In-N-Out restaurant and have both teammates finish at least one menu item each.",
    },
    soupHelicopter: {
        id: "soup-helicopter",
        title: "Eat soup in a helicopter",
        description: "Consume any amount of any kind of soup while the helicopter is in the air.",
        powerUpTokens: 2,
    },
    fourLeafClover: {
        id: "four-leaf-clover",
        title: "Find a four leaf clover as a leprechaun",
        description: "Dress as a leprechaun, then find and present a genuine four leaf clover.",
        powerUpTokens: 1,
    },
    spendBucees: {
        id: "spend-bucees",
        title: "Spend $100 at Buc-ee's",
        description: "Spend at least $100 in one visit to a Buc-ee's store.",
    },
    clawMachine: {
        id: "claw-machine",
        title: "Win a prize from a claw machine",
        description: "Successfully retrieve any prize from a claw machine.",
    },
    miniGolf: {
        id: "mini-golf",
        title: "Get a hole in one in mini golf",
        description: "Score a hole in one on any hole at a miniature golf course.",
        powerUpTokens: 1,
    },
    roulette: {
        id: "roulette",
        title: "Bet on roulette",
        description: "Place a bet on a roulette spin at a casino.",
    },
    advertise: {
        id: "advertise",
        title: "Ineffectively advertise Jet Lag: The Game",
        description: "Create an advertisement for Jet Lag that is visible but deliberately ineffective.",
        powerUpTokens: 1,
    },
    getDrunk: {
        id: "get-drunk",
        title: "Get Drunk, Again",
        description: "Have one teammate become legally intoxicated after asking the bartender or server which liquor they recommend and ordering shots of it.",
    },
    breakLaw: {
        id: "break-law",
        title: "Break a law from Crime Spree",
        description: "Recreate one of the harmless law-breaking challenges from Crime Spree.",
    },
    forgeArt: {
        id: "forge-art",
        title: "Forge great American art",
        description: "Make a convincing copy of a recognizable piece of American art.",
        powerUpTokens: 1,
    },
    spellHelp: {
        id: "spell-help",
        title: "Spell “HELP” in rocks on an island",
        description: "While on an island, arrange rocks into a clearly legible HELP sign.",
    },
    skyDiving: {
        id: "sky-diving",
        title: "Go skydiving",
        description: "Complete a skydive with a licensed operator.",
        powerUpTokens: 2,
    },
    touchOceans: {
        id: "touch-oceans",
        title: "Touch both oceans on the same day",
        description: "Have both teammates touch the Atlantic and Pacific Oceans during the same game day.",
        doubleClaim: true,
    },
    bullseye: {
        id: "bullseye",
        title: "Shoot a bullseye",
        description: "Hit the bullseye of a target using a bow and arrow.",
    },
    snowman: {
        id: "snowman",
        title: "Build a Snowman",
        description: "Build a freestanding snowman from real snow.",
        powerUpTokens: 1,
    },
    buildRaft: {
        id: "build-raft",
        title: "Build a Raft",
        description: "Construct a multi-part raft for no more than $50 and have both teammates travel at least 10 feet across safe, still water.",
    },
    skipStone: {
        id: "skip-stone",
        title: "Skip a stone over a sunken town",
        description: "Skip a stone across water above the remains of a submerged town.",
        powerUpTokens: 1,
    },
    smores: {
        id: "smores",
        title: "Make s'mores over an open fire",
        description: "Toast the marshmallows over an open flame and assemble two complete s'mores.",
    },
    foreignLicensePlateBattle: {
        id: "foreign-license-plate-battle",
        title: "Find the most foreign license plate",
        description: "Find a license plate from the country farthest from your current location before the other team does.",
        kind: "battle",
    },
    photographBirdsBattle: {
        id: "photograph-birds-battle",
        title: "Photograph the most birds",
        description: "Photograph more distinct birds than the other team before the battle ends.",
        kind: "battle",
    },
    drawGeorgeWashingtonBattle: {
        id: "draw-george-washington-battle",
        title: "Draw George Washington",
        description: "Create the better drawing of George Washington before the battle ends.",
        kind: "battle",
    },
} as const satisfies Record<string, ChallengeCard>;

export type ChallengeCardKey = keyof typeof seasonFourCards;

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

export function getCurrentHand(
    episode: string,
    currentTime: number,
    team: TeamId,
    stateClaims: Iterable<StateClaim>,
) {
    if (!seasonFour.episodes.some((candidate) => candidate.slug === episode)) {
        return [];
    }

    const currentTimestamp = { episode, at: currentTime };
    const visibleChanges = handChanges.filter(
        (change) =>
            change.team === team &&
            compareTimestamps(seasonFour, change, currentTimestamp) <= 0,
    );

    if (!visibleChanges.length) return [];

    const hand: ChallengeCardKey[] = [];

    for (const change of visibleChanges) {
        for (const card of change.remove ?? []) {
            removeCard(hand, card);
        }
        hand.push(...(change.add ?? []));
    }

    const claimedCardIds = new Set(
        [...stateClaims]
            .filter(
                (claim) =>
                    claim.team === team &&
                    compareTimestamps(seasonFour, claim, currentTimestamp) <= 0,
            )
            .map((claim) => claim.challenge.id),
    );

    for (const card of [...hand]) {
        if (claimedCardIds.has(seasonFourCards[card].id)) {
            removeCard(hand, card);
        }
    }

    const currentHand: Array<ChallengeCard | null> = hand.map(
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

function removeCard(hand: ChallengeCardKey[], card: ChallengeCardKey) {
    const index = hand.indexOf(card);
    if (index !== -1) hand.splice(index, 1);
}
