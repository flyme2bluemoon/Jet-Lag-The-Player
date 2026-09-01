export type ChallengeCard = {
    id: string;
    title: string;
    description: string;
    kind?: "battle";
    powerUpTokens?: 1 | 2;
    doubleClaim?: boolean;
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

type ChallengeCardKey = keyof typeof seasonFourCards;

type BattleCardKey = {
    [Key in ChallengeCardKey]: (typeof seasonFourCards)[Key] extends { kind: "battle" }
        ? Key
        : never;
}[ChallengeCardKey];

export type HandCardKey = Exclude<ChallengeCardKey, BattleCardKey>;
