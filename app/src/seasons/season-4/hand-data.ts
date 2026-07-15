import { seasonFourEpisodeOrder, type TeamId } from "./state-claims";

export type ChallengeCard = {
    id: string;
    title: string;
    description: string;
    powerUpTokens?: 1 | 2;
    doubleClaim?: boolean;
};

type HandSnapshot = {
    episode: (typeof seasonFourEpisodeOrder)[number];
    at: number;
    team: TeamId;
    cards: Array<string | null>;
};

const cards: Record<string, ChallengeCard> = {
    praiseBuilding: {
        id: "praise-building",
        title: "Praise the ugliest building",
        description: "Find the ugliest building you can and sincerely praise three things about it.",
    },
    pawnShop: {
        id: "pawn-shop",
        title: "Sell something from a pawn shop at a pawn shop",
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
};

const snapshots: HandSnapshot[] = [
    {
        episode: "episode-1",
        at: 73,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", "spiritHalloween", "eatInNOut", "carnivalPrize", "highFive", "soupHelicopter"],
    },
    {
        episode: "episode-1",
        at: 62,
        team: "ben-adam",
        cards: ["photographPartner", "praiseBuilding", "pawnShop", "roadsideAttraction", "cleanPark", "criticizePlace", "chevyLevee"],
    },
    {
        episode: "episode-1",
        at: 304.415,
        team: "ben-adam",
        cards: ["photographPartner", "pawnShop", "roadsideAttraction", "cleanPark", "criticizePlace", "chevyLevee", null],
    },
    {
        episode: "episode-1",
        at: 376,
        team: "ben-adam",
        cards: ["photographPartner", "pawnShop", "roadsideAttraction", "cleanPark", "criticizePlace", "chevyLevee", "geodeticMarker"],
    },
    {
        episode: "episode-1",
        at: 1343,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", "eatInNOut", "carnivalPrize", "highFive", "soupHelicopter", null],
    },
    {
        episode: "episode-1",
        at: 1400,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", "eatInNOut", "carnivalPrize", "highFive", "soupHelicopter", "clawMachine"],
    },
    {
        episode: "episode-1",
        at: 1472,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", "eatInNOut", "soupHelicopter", "clawMachine", "geodeticMarker", "photographPartner"],
    },
    {
        episode: "episode-1",
        at: 1472,
        team: "ben-adam",
        cards: ["pawnShop", "roadsideAttraction", "cleanPark", "criticizePlace", "chevyLevee", "highFive", "carnivalPrize"],
    },
    {
        episode: "episode-1",
        at: 1618,
        team: "ben-adam",
        cards: [null, "roadsideAttraction", "cleanPark", "criticizePlace", "chevyLevee", "highFive", "carnivalPrize"],
    },
    {
        episode: "episode-1",
        at: 1702,
        team: "ben-adam",
        cards: ["touchOceans", "roadsideAttraction", "cleanPark", "criticizePlace", "chevyLevee", "highFive", "carnivalPrize"],
    },
    {
        episode: "episode-1",
        at: 1988,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", "eatInNOut", "soupHelicopter", "clawMachine", null, "photographPartner"],
    },
    {
        episode: "episode-1",
        at: 2076,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", "eatInNOut", "soupHelicopter", "clawMachine", "spendBucees", "photographPartner"],
    },
    {
        episode: "episode-1",
        at: 2314,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", "eatInNOut", "soupHelicopter", "clawMachine", "spendBucees", null],
    },
    {
        episode: "episode-1",
        at: 2340,
        team: "ben-adam",
        cards: ["touchOceans", "roadsideAttraction", "cleanPark", "criticizePlace", "chevyLevee", null, "carnivalPrize"],
    },
    {
        episode: "episode-1",
        at: 2490,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", "eatInNOut", "soupHelicopter", "clawMachine", "spendBucees", "snowman"],
    },
    {
        episode: "episode-1",
        at: 2499,
        team: "ben-adam",
        cards: ["touchOceans", "roadsideAttraction", "cleanPark", "criticizePlace", "chevyLevee", "getDrunk", "carnivalPrize"],
    },
    {
        episode: "episode-2",
        at: 985,
        team: "ben-adam",
        cards: ["touchOceans", null, "cleanPark", "criticizePlace", "chevyLevee", "getDrunk", "carnivalPrize"],
    },
    {
        episode: "episode-2",
        at: 1009,
        team: "ben-adam",
        cards: ["touchOceans", "breakLaw", "cleanPark", "criticizePlace", "chevyLevee", "getDrunk", "carnivalPrize"],
    },
    {
        episode: "episode-2",
        at: 1247,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", "eatInNOut", "soupHelicopter", null, "spendBucees", "snowman"],
    },
    {
        episode: "episode-2",
        at: 1341,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", "eatInNOut", "soupHelicopter", "buildRaft", "spendBucees", "snowman"],
    },
    {
        episode: "episode-2",
        at: 1548,
        team: "ben-adam",
        cards: ["touchOceans", "breakLaw", "cleanPark", "criticizePlace", "chevyLevee", null, "carnivalPrize"],
    },
    {
        episode: "episode-2",
        at: 1628,
        team: "ben-adam",
        cards: ["touchOceans", "breakLaw", "cleanPark", "criticizePlace", "chevyLevee", "spellHelp", "carnivalPrize"],
    },
    {
        episode: "episode-3",
        at: 564,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", "eatInNOut", "soupHelicopter", "buildRaft", null, "snowman"],
    },
    {
        episode: "episode-3",
        at: 641,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", "eatInNOut", "soupHelicopter", "buildRaft", "advertise", "snowman"],
    },
    {
        episode: "episode-3",
        at: 1024,
        team: "ben-adam",
        cards: ["touchOceans", "breakLaw", "cleanPark", "criticizePlace", null, "spellHelp", "carnivalPrize"],
    },
    {
        episode: "episode-3",
        at: 1143,
        team: "ben-adam",
        cards: ["touchOceans", "breakLaw", "cleanPark", "criticizePlace", "bullseye", "spellHelp", "carnivalPrize"],
    },
    {
        episode: "episode-3",
        at: 1491,
        team: "ben-adam",
        cards: ["touchOceans", "breakLaw", "cleanPark", null, "bullseye", "spellHelp", "carnivalPrize"],
    },
    {
        episode: "episode-3",
        at: 1594,
        team: "ben-adam",
        cards: ["touchOceans", "breakLaw", "cleanPark", "skyDiving", "bullseye", "spellHelp", "carnivalPrize"],
    },
    {
        episode: "episode-3",
        at: 2005,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", null, "soupHelicopter", "buildRaft", "advertise", "snowman"],
    },
    {
        episode: "episode-4",
        at: 82,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", "fourLeafClover", "soupHelicopter", "buildRaft", "advertise", "snowman"],
    },
    {
        episode: "episode-4",
        at: 377,
        team: "ben-adam",
        cards: ["touchOceans", null, "cleanPark", "skyDiving", "bullseye", "spellHelp", "carnivalPrize"],
    },
    {
        episode: "episode-4",
        at: 399,
        team: "ben-adam",
        cards: ["touchOceans", "forgeArt", "cleanPark", "skyDiving", "bullseye", "spellHelp", "carnivalPrize"],
    },
    {
        episode: "episode-4",
        at: 895,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", null, "soupHelicopter", "buildRaft", "advertise", "snowman"],
    },
    {
        episode: "episode-4",
        at: 1061,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", "smores", "soupHelicopter", "buildRaft", "advertise", "snowman"],
    },
    {
        episode: "episode-4",
        at: 1075,
        team: "sam-brian",
        cards: ["grandCanyon", "shipCard", "soupHelicopter", "buildRaft", "advertise", "snowman", "smores"],
    },
    {
        episode: "episode-4",
        at: 1137,
        team: "sam-brian",
        cards: ["grandCanyon", "soupHelicopter", "buildRaft", "advertise", "smores", "forgeArt", "spellHelp"],
    },
    {
        episode: "episode-4",
        at: 1137,
        team: "ben-adam",
        cards: ["touchOceans", "cleanPark", "skyDiving", "bullseye", "carnivalPrize", "snowman", "shipCard"],
    },
    {
        episode: "episode-4",
        at: 1249,
        team: "sam-brian",
        cards: ["grandCanyon", "soupHelicopter", "buildRaft", "advertise", "smores", "touchOceans", "shipCard"],
    },
    {
        episode: "episode-4",
        at: 1249,
        team: "ben-adam",
        cards: ["cleanPark", "skyDiving", "bullseye", "carnivalPrize", "snowman", "forgeArt", "spellHelp"],
    },
    {
        episode: "episode-4",
        at: 1587,
        team: "ben-adam",
        cards: ["cleanPark", "skyDiving", "bullseye", "carnivalPrize", "snowman", null, "spellHelp"],
    },
    {
        episode: "episode-4",
        at: 1654,
        team: "ben-adam",
        cards: ["cleanPark", "skyDiving", "bullseye", "carnivalPrize", "snowman", "skipStone", "spellHelp"],
    },
    {
        episode: "finale",
        at: 266,
        team: "sam-brian",
        cards: ["grandCanyon", null, "buildRaft", "advertise", "smores", "touchOceans", "shipCard"],
    },
    {
        episode: "finale",
        at: 557,
        team: "sam-brian",
        cards: ["grandCanyon", "miniGolf", "buildRaft", "advertise", "smores", "touchOceans", "shipCard"],
    },
    {
        episode: "finale",
        at: 1779,
        team: "sam-brian",
        cards: ["grandCanyon", null, "buildRaft", "advertise", "smores", "touchOceans", "shipCard"],
    },
    {
        episode: "finale",
        at: 1818,
        team: "sam-brian",
        cards: ["grandCanyon", "roulette", "buildRaft", "advertise", "smores", "touchOceans", "shipCard"],
    },
    {
        episode: "finale",
        at: 2068,
        team: "sam-brian",
        cards: ["roulette", "buildRaft", "advertise", "smores", "touchOceans", "snowman", "spellHelp"],
    },
    {
        episode: "finale",
        at: 2068,
        team: "ben-adam",
        cards: ["cleanPark", "skyDiving", "bullseye", "carnivalPrize", "skipStone", "grandCanyon", "shipCard"],
    },
    {
        episode: "finale",
        at: 2083,
        team: "sam-brian",
        cards: ["roulette", "buildRaft", "advertise", "touchOceans", "snowman", "grandCanyon", "shipCard"],
    },
    {
        episode: "finale",
        at: 2083,
        team: "ben-adam",
        cards: ["cleanPark", "skyDiving", "bullseye", "carnivalPrize", "skipStone", "smores", "spellHelp"],
    },
    {
        episode: "finale",
        at: 2204,
        team: "ben-adam",
        cards: ["cleanPark", "skyDiving", "bullseye", "carnivalPrize", "skipStone", "smores", null],
    },
    {
        episode: "finale",
        at: 2409,
        team: "sam-brian",
        cards: ["roulette", "buildRaft", null, "touchOceans", "snowman", "grandCanyon", "shipCard"],
    },
];

export function getCurrentHand(episode: string, currentTime: number, team: TeamId) {
    const episodeIndex = seasonFourEpisodeOrder.indexOf(
        episode as (typeof seasonFourEpisodeOrder)[number],
    );

    if (episodeIndex === -1) return [];

    const snapshot = snapshots
        .filter((candidate) => {
            const candidateEpisodeIndex = seasonFourEpisodeOrder.indexOf(candidate.episode);
            return candidate.team === team && (
                candidateEpisodeIndex < episodeIndex ||
                (candidateEpisodeIndex === episodeIndex && candidate.at <= currentTime)
            );
        })
        .at(-1);

    const hand = snapshot?.cards.map((card) => card ? cards[card] : null) ?? [];

    return [
        ...hand.filter((card) => card !== null),
        ...hand.filter((card) => card === null),
    ];
}
