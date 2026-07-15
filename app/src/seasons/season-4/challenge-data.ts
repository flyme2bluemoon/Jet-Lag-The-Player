import {
    MARYLAND_BATTLE_RESOLVED_AT,
    seasonFourEpisodeOrder,
    type TeamId,
} from "./state-claims";

export type ChallengeWindow = {
    episode: string;
    team: TeamId;
    start: number;
    end: number;
    title: string;
    displayTitle?: string;
    subtitle?: string;
    kind?: "battle";
};

const challengeDescriptions: Record<string, string> = {
    "Praise the ugliest building": "Find the ugliest building you can and sincerely praise three things about it.",
    "Visit every Spirit Halloween": "Visit every Spirit Halloween in the state, buy one costume item at each, and wear the assembled costume.",
    "Sell something from one pawn shop to another": "Purchase an item at a pawn shop, then sell it for at least half its purchase price at a pawn shop in another state.",
    "File a Geodetic Mark Recovery Form": "Find a geodetic survey mark and submit an official recovery report for it.",
    "High five at the highest point": "Photograph both teammates jumping and high fiving at the state's highest publicly accessible point.",
    "Photograph your partner from far away": "From at least half a mile away, photograph your teammate so they are visible in the image.",
    "Find the most foreign license plate": "Find a license plate from the country farthest from your current location before the other team does.",
    "Ship this card": "Ship this card to another state, then retrieve it there to claim the state where it arrived.",
    "Respect the weirdest roadside attraction": "Visit the state's weirdest roadside attraction and salute it for the entire national anthem.",
    "Win a prize from a claw machine": "Successfully retrieve any prize from a claw machine.",
    "Get Drunk, Again": "Have one teammate become legally intoxicated after asking the bartender or server which liquor they recommend and ordering shots of it.",
    "Spend $100 at Buc-ee's": "Spend at least $100 in one visit to a Buc-ee's store.",
    "Photograph the most birds": "Photograph more distinct birds than the other team before the battle ends.",
    "Take a Chevy to a levee and eat pie": "Arrive at a levee in a Chevrolet, then fully consume at least one slice of pie between both teammates.",
    "Criticize the most beautiful place": "Travel to the state's most beautiful location and list three things you hate about it.",
    "Eat at In-N-Out": "Visit any In-N-Out restaurant and have both teammates finish at least one menu item each.",
    "Break a law from Crime Spree": "Recreate one of the harmless law-breaking challenges from Crime Spree.",
    "Find a four leaf clover as a leprechaun": "Dress as a leprechaun, then find and present a genuine four leaf clover.",
    "Eat soup in a helicopter": "Consume any amount of any kind of soup while the helicopter is in the air.",
    "Forge great American art": "Make a convincing copy of a recognizable piece of American art.",
    "Clean up a national park": "Pick up at least five separate pieces of litter in a national park and properly dispose of them.",
    "Draw George Washington": "Create the better drawing of George Washington before the battle ends.",
    "Get a hole in one in mini golf": "Score a hole in one on any hole at a miniature golf course.",
    "Ineffectively advertise Jet Lag: The Game": "Create an advertisement for Jet Lag that is visible but deliberately ineffective.",
    "Spell “HELP” in rocks on an island": "While on an island, arrange rocks into a clearly legible HELP sign.",
};

type FailedChallengeBase = {
    episode: string;
    team: TeamId;
    at: number;
    state: string;
    title: string;
};

type FailedBattleChallenge = FailedChallengeBase & {
    kind: "battle";
    originalClaim: {
        episode: string;
        at: number;
        team: TeamId;
    };
    originalChallenge?: string;
};

type FailedStandardChallenge = FailedChallengeBase & {
    kind?: undefined;
    originalClaim?: never;
    originalChallenge?: never;
};

export type FailedChallenge = FailedBattleChallenge | FailedStandardChallenge;

// Challenge windows are taken from the timestamped Season 4 transcripts.
// A challenge starts once a team commits to completing it and includes travel
// undertaken specifically for that card. It ends when the task is completed,
// becomes impossible, or is superseded by a battle challenge.
export const seasonFourChallengeWindows: ChallengeWindow[] = [
    // Episode 1
    { episode: "episode-1", team: "ben-adam", start: 100, end: 304.415, title: "Praise the ugliest building" },
    { episode: "episode-1", team: "sam-brian", start: 1176, end: 1343, title: "Visit every Spirit Halloween" },
    { episode: "episode-1", team: "ben-adam", start: 1010, end: 1618, title: "Sell something from one pawn shop to another" },
    { episode: "episode-1", team: "sam-brian", start: 1715, end: 1988, title: "File a Geodetic Mark Recovery Form" },
    { episode: "episode-1", team: "ben-adam", start: 2167, end: 2340, title: "High five at the highest point" },
    { episode: "episode-1", team: "sam-brian", start: 2152, end: 2314, title: "Photograph your partner from far away" },

    // Episode 2
    { episode: "episode-2", team: "sam-brian", start: 29.64, end: 242.94, title: "Find the most foreign license plate", kind: "battle" },
    { episode: "episode-2", team: "ben-adam", start: 29.64, end: 242.94, title: "Find the most foreign license plate", kind: "battle" },
    { episode: "episode-2", team: "ben-adam", start: 794.49, end: 985, title: "Respect the weirdest roadside attraction" },
    { episode: "episode-2", team: "sam-brian", start: 1185, end: 1247, title: "Win a prize from a claw machine" },
    { episode: "episode-2", team: "ben-adam", start: 1304.985, end: 1548, title: "Get Drunk, Again" },
    { episode: "episode-2", team: "sam-brian", start: 1441.365, end: 1881.92, title: "Spend $100 at Buc-ee's" },
    { episode: "episode-2", team: "sam-brian", start: 1881.92, end: Number.POSITIVE_INFINITY, title: "Photograph the most birds", kind: "battle" },
    { episode: "episode-2", team: "ben-adam", start: 1881.92, end: Number.POSITIVE_INFINITY, title: "Photograph the most birds", kind: "battle" },

    // Episode 3
    { episode: "episode-3", team: "sam-brian", start: 0, end: 92.384, title: "Photograph the most birds", kind: "battle" },
    { episode: "episode-3", team: "ben-adam", start: 0, end: 92.384, title: "Photograph the most birds", kind: "battle" },
    { episode: "episode-3", team: "sam-brian", start: 338, end: 564, title: "Spend $100 at Buc-ee's" },
    { episode: "episode-3", team: "ben-adam", start: 455, end: 1024, title: "Take a Chevy to a levee and eat pie" },
    { episode: "episode-3", team: "ben-adam", start: 1169, end: 1491, title: "Criticize the most beautiful place" },
    { episode: "episode-3", team: "sam-brian", start: 1554, end: 2005, title: "Eat at In-N-Out" },
    { episode: "episode-3", team: "ben-adam", start: 1869, end: Number.POSITIVE_INFINITY, title: "Break a law from Crime Spree", displayTitle: "Seduce and Debauch an Unmarried Woman (Mich.)", subtitle: "Break a law from Crime Spree" },

    // Episode 4
    { episode: "episode-4", team: "ben-adam", start: 0, end: 377, title: "Break a law from Crime Spree", displayTitle: "Seduce and Debauch an Unmarried Woman (Mich.)", subtitle: "Break a law from Crime Spree" },
    { episode: "episode-4", team: "sam-brian", start: 543, end: 895, title: "Find a four leaf clover as a leprechaun" },
    { episode: "episode-4", team: "sam-brian", start: 1822, end: Number.POSITIVE_INFINITY, title: "Eat soup in a helicopter" },
    { episode: "episode-4", team: "ben-adam", start: 1289, end: 1587, title: "Forge great American art" },
    { episode: "episode-4", team: "ben-adam", start: 1792, end: Number.POSITIVE_INFINITY, title: "Clean up a national park" },

    // Finale
    { episode: "finale", team: "sam-brian", start: 0, end: 266, title: "Eat soup in a helicopter" },
    { episode: "finale", team: "ben-adam", start: 0, end: 266, title: "Clean up a national park" },
    { episode: "finale", team: "sam-brian", start: 654.824, end: 1076.061, title: "Draw George Washington", kind: "battle" },
    { episode: "finale", team: "ben-adam", start: 654.824, end: 1076.061, title: "Draw George Washington", kind: "battle" },
    { episode: "finale", team: "sam-brian", start: 1624, end: 1779, title: "Get a hole in one in mini golf" },
    { episode: "finale", team: "sam-brian", start: 1998, end: 2409, title: "Ineffectively advertise Jet Lag: The Game" },
    { episode: "finale", team: "ben-adam", start: 2138, end: 2204, title: "Spell “HELP” in rocks on an island" },
];

export const seasonFourFailedChallenges: FailedChallenge[] = [
    {
        episode: "episode-2",
        team: "sam-brian",
        at: MARYLAND_BATTLE_RESOLVED_AT,
        state: "Maryland",
        title: "Find the most foreign license plate",
        kind: "battle",
        originalClaim: { episode: "episode-1", at: 1988, team: "sam-brian" },
        originalChallenge: "File a Geodetic Mark Recovery Form",
    },
    {
        episode: "episode-3",
        team: "ben-adam",
        at: 92.384,
        state: "Massachusetts",
        title: "Photograph the most birds",
        kind: "battle",
        originalClaim: { episode: "episode-2", at: 1247, team: "sam-brian" },
    },
    {
        episode: "finale",
        team: "sam-brian",
        at: 1076.061,
        state: "Nevada",
        title: "Draw George Washington",
        kind: "battle",
        originalClaim: { episode: "episode-4", at: 1587, team: "ben-adam" },
    },
];

export function getActiveChallenge(
    episode: string,
    currentTime: number,
    team: TeamId,
) {
    const challenge = seasonFourChallengeWindows.find(
        (challenge) =>
            challenge.episode === episode &&
            challenge.team === team &&
            challenge.start <= currentTime &&
            currentTime < challenge.end,
    );

    if (!challenge) return undefined;

    return {
        ...challenge,
        description: challengeDescriptions[challenge.title] ?? "No description available.",
    };
}

export function getFailedChallenges(
    episode: string,
    currentTime: number,
    team: TeamId,
) {
    const episodeIndex = seasonFourEpisodeOrder.indexOf(
        episode as (typeof seasonFourEpisodeOrder)[number],
    );

    if (episodeIndex === -1) return [];

    return seasonFourFailedChallenges.filter((challenge) => {
        const challengeEpisodeIndex = seasonFourEpisodeOrder.indexOf(
            challenge.episode as (typeof seasonFourEpisodeOrder)[number],
        );
        return (
            challenge.team === team &&
            (challengeEpisodeIndex < episodeIndex ||
                (challengeEpisodeIndex === episodeIndex && challenge.at <= currentTime))
        );
    });
}
