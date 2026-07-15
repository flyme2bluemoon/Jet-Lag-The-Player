import { seasonFour } from "@/data/season-4";
import { compareTimestamps } from "@/lib/timestamps";
import {
    seasonFourEpisodeOrder,
    seasonFourStateClaims,
    type StateClaim,
} from "./state-claims";
import type { TeamId } from "./team-data";

export type PowerupTransaction = {
    id: string;
    episode: (typeof seasonFourEpisodeOrder)[number];
    at: number;
    team: TeamId;
    amount: number;
    title: string;
    detail?: string;
    claim?: StateClaim;
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

const seasonFourPowerupPurchases: PowerupTransaction[] = [
    {
        id: "sb-first-card-swap",
        episode: "episode-1",
        at: 1413,
        team: "sam-brian",
        amount: -1,
        title: "Card Swap",
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
        id: "ba-michigan-border",
        episode: "episode-3",
        at: 1778,
        team: "ben-adam",
        amount: -1,
        title: "Border Pass",
        detail: "Indiana-Michigan",
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
        id: "ba-arizona-border",
        episode: "episode-4",
        at: 1917,
        team: "ben-adam",
        amount: -1,
        title: "Border Pass",
        detail: "Nevada-Arizona",
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
];

const seasonFourPowerupRewards: PowerupTransaction[] =
    seasonFourStateClaims.flatMap((claim) => {
        const amount = claim.challenge.powerUpTokens;

        if (!amount) return [];
        if (!seasonFourEpisodeOrder.includes(
            claim.episode as (typeof seasonFourEpisodeOrder)[number],
        )) {
            throw new RangeError(
                `Powerup reward claim belongs to unknown episode "${claim.episode}".`,
            );
        }

        return [{
            id: `reward-${claim.episode}-${claim.at}-${claim.team}`,
            episode: claim.episode as (typeof seasonFourEpisodeOrder)[number],
            at: claim.at,
            team: claim.team,
            amount,
            title: claim.challenge.title,
            claim,
        }];
    });

export const seasonFourPowerupTransactions: PowerupTransaction[] = [
    ...seasonFourPowerupPurchases,
    ...seasonFourPowerupRewards,
].toSorted((left, right) => compareTimestamps(seasonFour, left, right));

export function getVisiblePowerupTransactions(
    episode: string,
    currentTime: number,
) {
    if (!seasonFourEpisodeOrder.includes(
        episode as (typeof seasonFourEpisodeOrder)[number],
    )) {
        return [];
    }

    const currentTimestamp = { episode, at: currentTime };

    return seasonFourPowerupTransactions.filter(
        (transaction) =>
            compareTimestamps(seasonFour, transaction, currentTimestamp) <= 0,
    );
}

export function getVisibleTravelBudgetCredits(
    episode: string,
    currentTime: number,
) {
    if (!seasonFourEpisodeOrder.includes(
        episode as (typeof seasonFourEpisodeOrder)[number],
    )) {
        return [];
    }

    const currentTimestamp = { episode, at: currentTime };

    return seasonFourTravelBudgetCredits.filter(
        (credit) => compareTimestamps(seasonFour, credit, currentTimestamp) <= 0,
    );
}
