import { seasonFourEpisodeOrder, type TeamId } from "./state-claims";

export type PowerupTransaction = {
    id: string;
    episode: (typeof seasonFourEpisodeOrder)[number];
    at: number;
    team: TeamId;
    amount: number;
    title: string;
    detail?: string;
};

export type TravelBudgetCredit = {
    id: string;
    episode: (typeof seasonFourEpisodeOrder)[number];
    at: number;
    amount: number;
    title: string;
    transportMode?: TransportMode;
    team?: TeamId;
};

export type TransportMode =
    | "metro"
    | "intercity-rail"
    | "rideshare"
    | "car"
    | "flight"
    | "bike-share"
    | "scooter-share";

export const seasonFourTeams: Record<TeamId, { name: string; color: string }> = {
    "sam-brian": { name: "Sam & Brian", color: "#63A26B" },
    "ben-adam": { name: "Ben & Adam", color: "#DC4742" },
};

// Each team starts with $3,000 and receives another $1,000 when each
// subsequent game day begins. Most individual fares are not spoken in the
// episodes, so this is intentionally presented as allocated budget rather
// than an invented remaining balance.
export const seasonFourTravelBudgetCredits: TravelBudgetCredit[] = [
    {
        id: "day-one-budget",
        episode: "episode-1",
        at: 0,
        amount: 3000,
        title: "Starting budget",
    },
    {
        id: "ba-citibike",
        episode: "episode-1",
        at: 170,
        amount: -8.72,
        title: "Citi Bike",
        transportMode: "bike-share",
        team: "ben-adam",
    },
    {
        id: "ba-nyc-subway",
        episode: "episode-1",
        at: 465,
        amount: -5.5,
        title: "NYC Subway",
        transportMode: "metro",
        team: "ben-adam",
    },
    {
        id: "ba-train-to-philadelphia",
        episode: "episode-1",
        at: 719,
        amount: -424,
        title: "Train to Philadelphia",
        transportMode: "intercity-rail",
        team: "ben-adam",
    },
    {
        id: "sb-train-to-dc",
        episode: "episode-1",
        at: 723,
        amount: -674,
        title: "Train to DC",
        transportMode: "intercity-rail",
        team: "sam-brian",
    },
    {
        id: "ba-bikes",
        episode: "episode-1",
        at: 1012,
        amount: -32.4,
        title: "Bikes",
        transportMode: "bike-share",
        team: "ben-adam",
    },
    {
        id: "ba-metro-to-new-jersey",
        episode: "episode-1",
        at: 1208,
        amount: -6,
        title: "Metro to New Jersey",
        transportMode: "metro",
        team: "ben-adam",
    },
    {
        id: "sb-metro-day-passes",
        episode: "episode-1",
        at: 1249,
        amount: -26,
        title: "Metro Day Passes",
        transportMode: "metro",
        team: "sam-brian",
    },
    {
        id: "ba-uber",
        episode: "episode-1",
        at: 1294,
        amount: -14.06,
        title: "Uber",
        transportMode: "rideshare",
        team: "ben-adam",
    },
    {
        id: "ba-uber-to-philly",
        episode: "episode-1",
        at: 1749,
        amount: -29.9,
        title: "Uber to Philly",
        transportMode: "rideshare",
        team: "ben-adam",
    },
    {
        id: "ba-train-to-wilmington",
        episode: "episode-1",
        at: 2050,
        amount: -66,
        title: "Train to Wilmington",
        transportMode: "intercity-rail",
        team: "ben-adam",
    },
    {
        id: "ba-uber-to-highest-point",
        episode: "episode-1",
        at: 2128,
        amount: -35.88,
        title: "Uber to Highest Point",
        transportMode: "rideshare",
        team: "ben-adam",
    },
    {
        id: "ba-train-to-baltimore",
        episode: "episode-1",
        at: 2523,
        amount: -131.99,
        title: "Train to Baltimore",
        transportMode: "intercity-rail",
        team: "ben-adam",
    },
    {
        id: "ba-train-to-nyc",
        episode: "episode-2",
        at: 432,
        amount: -422,
        title: "Train to NYC",
        transportMode: "intercity-rail",
        team: "ben-adam",
    },
    {
        id: "sb-uber-to-union-station",
        episode: "episode-2",
        at: 524,
        amount: -30,
        title: "Uber to Union Station",
        transportMode: "rideshare",
        team: "sam-brian",
    },
    {
        id: "sb-marc-train-to-bwi",
        episode: "episode-2",
        at: 531,
        amount: -16,
        title: "MARC Train to BWI",
        transportMode: "intercity-rail",
        team: "sam-brian",
    },
    {
        id: "day-two-budget",
        episode: "episode-2",
        at: 691.215,
        amount: 1000,
        title: "Day 2 Budget Infusion",
    },
    {
        id: "ba-metro-north-train-to-new-haven",
        episode: "episode-2",
        at: 738,
        amount: -47,
        title: "Metro-North Train to New Haven",
        transportMode: "intercity-rail",
        team: "ben-adam",
    },
    {
        id: "sb-flight-bwi-bdl",
        episode: "episode-2",
        at: 784,
        amount: -426,
        title: "Flight BWI-BDL",
        transportMode: "flight",
        team: "sam-brian",
    },
    {
        id: "ba-uber-to-pez-museum",
        episode: "episode-2",
        at: 836,
        amount: -11,
        title: "Uber to PEZ Museum",
        transportMode: "rideshare",
        team: "ben-adam",
    },
    {
        id: "ba-uber-to-new-haven-station",
        episode: "episode-2",
        at: 998,
        amount: -14,
        title: "Uber to New Haven Station",
        transportMode: "rideshare",
        team: "ben-adam",
    },
    {
        id: "ba-amtrak-to-providence",
        episode: "episode-2",
        at: 1097,
        amount: -264,
        title: "Amtrak to Providence, RI",
        transportMode: "intercity-rail",
        team: "ben-adam",
    },
    {
        id: "sb-amtrak-to-springfield",
        episode: "episode-2",
        at: 1173,
        amount: -10,
        title: "Amtrak to Springfield, MA",
        transportMode: "intercity-rail",
        team: "sam-brian",
    },
    {
        id: "sb-uber-to-springfield-mall",
        episode: "episode-2",
        at: 1196,
        amount: -13,
        title: "Uber to Springfield Mall",
        transportMode: "rideshare",
        team: "sam-brian",
    },
    {
        id: "sb-uber-to-amtrak-station",
        episode: "episode-2",
        at: 1603,
        amount: -13,
        title: "Uber to Amtrak Station",
        transportMode: "rideshare",
        team: "sam-brian",
    },
    {
        id: "sb-amtrak-to-windsor-locks",
        episode: "episode-2",
        at: 1811,
        amount: -8,
        title: "Amtrak to Windsor Locks",
        transportMode: "intercity-rail",
        team: "sam-brian",
    },
    {
        id: "sb-uber-to-bdl",
        episode: "episode-3",
        at: 267,
        amount: -16,
        title: "Uber to BDL",
        transportMode: "rideshare",
        team: "sam-brian",
    },
    {
        id: "sb-flight-to-nashville",
        episode: "episode-3",
        at: 292,
        amount: -340,
        title: "Flight to Nashville",
        transportMode: "flight",
        team: "sam-brian",
    },
    {
        id: "ba-flight-to-chicago",
        episode: "episode-3",
        at: 296,
        amount: -345,
        title: "Flight to Chicago",
        transportMode: "flight",
        team: "ben-adam",
    },
    {
        id: "sb-rental-car",
        episode: "episode-3",
        at: 333,
        amount: -155,
        title: "Rental Car",
        transportMode: "car",
        team: "sam-brian",
    },
    {
        id: "ba-chevy-rental",
        episode: "episode-3",
        at: 772,
        amount: -264,
        title: "Chevy Rental",
        transportMode: "car",
        team: "ben-adam",
    },
    {
        id: "day-three-budget",
        episode: "episode-3",
        at: 820.405,
        amount: 1000,
        title: "Day 3 Budget Infusion",
    },
    {
        id: "sb-flight-to-austin",
        episode: "episode-3",
        at: 1265,
        amount: -1038,
        title: "Flight to Austin, TX",
        transportMode: "flight",
        team: "sam-brian",
    },
    {
        id: "sb-uber-to-aus",
        episode: "episode-4",
        at: 133,
        amount: -16,
        title: "Uber to AUS",
        transportMode: "rideshare",
        team: "sam-brian",
    },
    {
        id: "sb-flight-to-lax",
        episode: "episode-4",
        at: 433,
        amount: -677,
        title: "Flight to LAX",
        transportMode: "flight",
        team: "sam-brian",
    },
    {
        id: "ba-flight-to-las-vegas",
        episode: "episode-4",
        at: 625,
        amount: -745,
        title: "Flight to Las Vegas",
        transportMode: "flight",
        team: "ben-adam",
    },
    {
        id: "sb-scooter",
        episode: "episode-4",
        at: 640,
        amount: -7.3,
        title: "Scooter",
        transportMode: "scooter-share",
        team: "sam-brian",
    },
    {
        id: "sb-flight-to-las-vegas",
        episode: "episode-4",
        at: 1132,
        amount: -257,
        title: "Flight to Las Vegas",
        transportMode: "flight",
        team: "sam-brian",
    },
    {
        id: "ba-uber-to-martin-lawrence-gallery",
        episode: "episode-4",
        at: 1428,
        amount: -11,
        title: "Uber to Martin Lawrence Gallery",
        transportMode: "rideshare",
        team: "ben-adam",
    },
    {
        id: "day-four-budget",
        episode: "episode-4",
        at: 1765,
        amount: 1000,
        title: "Day 4 Budget Infusion",
    },
    {
        id: "ba-uber-to-grand-canyon",
        episode: "episode-4",
        at: 1842,
        amount: -151,
        title: "Uber to Grand Canyon",
        transportMode: "rideshare",
        team: "ben-adam",
    },
    {
        id: "sb-uber-to-soup",
        episode: "episode-4",
        at: 1862,
        amount: -14,
        title: "Uber to Soup",
        transportMode: "rideshare",
        team: "sam-brian",
    },
    {
        id: "sb-uber-to-boulder-city",
        episode: "episode-4",
        at: 2062,
        amount: -55,
        title: "Uber to Boulder City",
        transportMode: "rideshare",
        team: "sam-brian",
    },
    {
        id: "ba-uber-to-harry-reid-airport",
        episode: "finale",
        at: 573,
        amount: -200,
        title: "Uber to Harry Reid Intl Airport",
        transportMode: "rideshare",
        team: "ben-adam",
    },
    {
        id: "ba-big-flight",
        episode: "finale",
        at: 1367,
        amount: -1988,
        title: "Big Flight",
        transportMode: "flight",
        team: "ben-adam",
    },
    {
        id: "sb-flight-to-denver",
        episode: "finale",
        at: 1411,
        amount: -451.2,
        title: "Flight to Denver",
        transportMode: "flight",
        team: "sam-brian",
    },
    {
        id: "sb-finale-rental-car",
        episode: "finale",
        at: 1469,
        amount: -95.5,
        title: "Rental Car",
        transportMode: "car",
        team: "sam-brian",
    },
];

// Powerup token transactions are taken from the timestamped Season 4
// transcripts. Challenge rewards appear when the challenge is completed;
// purchases appear when the team commits to using the powerup.
export const seasonFourPowerupTransactions: PowerupTransaction[] = [
    {
        id: "sb-dc-reward",
        episode: "episode-1",
        at: 1343,
        team: "sam-brian",
        amount: 1,
        title: "Visit every Spirit Halloween",
    },
    {
        id: "sb-first-card-swap",
        episode: "episode-1",
        at: 1413,
        team: "sam-brian",
        amount: -1,
        title: "Card Swap",
    },
    {
        id: "ba-delaware-reward",
        episode: "episode-1",
        at: 2340,
        team: "ben-adam",
        amount: 1,
        title: "High five at the highest point",
    },
    {
        id: "ba-connecticut-reward",
        episode: "episode-2",
        at: 985,
        team: "ben-adam",
        amount: 1,
        title: "Respect the weirdest roadside attraction",
    },
    {
        id: "ba-illinois-reward",
        episode: "episode-3",
        at: 1024,
        team: "ben-adam",
        amount: 1,
        title: "Take a Chevy to a levee and eat pie",
    },
    {
        id: "ba-indiana-border",
        episode: "episode-3",
        at: 1159,
        team: "ben-adam",
        amount: -1,
        title: "Border Pass",
        detail: "Illinois-Indiana",
    },
    {
        id: "ba-indiana-reward",
        episode: "episode-3",
        at: 1491,
        team: "ben-adam",
        amount: 1,
        title: "Criticize the most beautiful place",
    },
    {
        id: "ba-michigan-border",
        episode: "episode-3",
        at: 1778,
        team: "ben-adam",
        amount: -1,
        title: "Border Pass",
        detail: "Indiana-Michigan",
    },
    {
        id: "sb-california-reward",
        episode: "episode-4",
        at: 895,
        team: "sam-brian",
        amount: 1,
        title: "Find a four leaf clover as a leprechaun",
    },
    {
        id: "sb-second-card-swap",
        episode: "episode-4",
        at: 1075,
        team: "sam-brian",
        amount: -1,
        title: "Card Swap",
    },
    {
        id: "ba-return-card-swap",
        episode: "episode-4",
        at: 1191,
        team: "ben-adam",
        amount: -1,
        title: "Card Swap",
    },
    {
        id: "ba-nevada-reward",
        episode: "episode-4",
        at: 1587,
        team: "ben-adam",
        amount: 1,
        title: "Forge great American art",
    },
    {
        id: "ba-arizona-border",
        episode: "episode-4",
        at: 1917,
        team: "ben-adam",
        amount: -1,
        title: "Border Pass",
        detail: "Nevada-Arizona",
    },
    {
        id: "sb-arizona-reward",
        episode: "finale",
        at: 266,
        team: "sam-brian",
        amount: 2,
        title: "Eat soup in a helicopter",
    },
    {
        id: "sb-tracker",
        episode: "finale",
        at: 1327,
        team: "sam-brian",
        amount: -1,
        title: "Tracker",
    },
    {
        id: "sb-colorado-reward",
        episode: "finale",
        at: 1779,
        team: "sam-brian",
        amount: 1,
        title: "Get a hole in one in mini golf",
    },
    {
        id: "sb-finale-card-swap",
        episode: "finale",
        at: 1917,
        team: "sam-brian",
        amount: -1,
        title: "Card Swap",
    },
    {
        id: "ba-finale-card-swap",
        episode: "finale",
        at: 2083,
        team: "ben-adam",
        amount: -1,
        title: "Card Swap",
    },
    {
        id: "sb-wyoming-border",
        episode: "finale",
        at: 1991,
        team: "sam-brian",
        amount: -1,
        title: "Border Pass",
        detail: "Colorado-Wyoming",
    },
    {
        id: "sb-wyoming-reward",
        episode: "finale",
        at: 2409,
        team: "sam-brian",
        amount: 1,
        title: "Ineffectively advertise Jet Lag: The Game",
    },
];

export function getVisiblePowerupTransactions(
    episode: string,
    currentTime: number,
) {
    const episodeIndex = seasonFourEpisodeOrder.indexOf(
        episode as (typeof seasonFourEpisodeOrder)[number],
    );

    if (episodeIndex === -1) return [];

    return seasonFourPowerupTransactions.filter((transaction) => {
        const transactionEpisodeIndex = seasonFourEpisodeOrder.indexOf(
            transaction.episode,
        );
        return (
            transactionEpisodeIndex < episodeIndex ||
            (transactionEpisodeIndex === episodeIndex && transaction.at <= currentTime)
        );
    });
}

export function getVisibleTravelBudgetCredits(
    episode: string,
    currentTime: number,
) {
    const episodeIndex = seasonFourEpisodeOrder.indexOf(
        episode as (typeof seasonFourEpisodeOrder)[number],
    );

    if (episodeIndex === -1) return [];

    return seasonFourTravelBudgetCredits.filter((credit) => {
        const creditEpisodeIndex = seasonFourEpisodeOrder.indexOf(credit.episode);
        return (
            creditEpisodeIndex < episodeIndex ||
            (creditEpisodeIndex === episodeIndex && credit.at <= currentTime)
        );
    });
}

export function getTravelBudgetAllocation(
    credits: TravelBudgetCredit[],
    team: TeamId,
) {
    return credits.reduce(
        (total, credit) =>
            !credit.team || credit.team === team ? total + credit.amount : total,
        0,
    );
}

export function getTeamBalance(
    transactions: PowerupTransaction[],
    team: TeamId,
) {
    return transactions.reduce(
        (balance, transaction) =>
            transaction.team === team ? balance + transaction.amount : balance,
        0,
    );
}
