import { seasonOne } from "@/data/season-1";
import { compareTimestamps } from "@/lib/timestamps";
import { seasonOneEpisodeOrder } from "./state-claims";
import type { TeamId } from "./team-data";

export type TravelBudgetCredit = {
    id: string;
    episode: (typeof seasonOneEpisodeOrder)[number];
    at: number;
    amount: number;
    title: string;
    team: TeamId;
    transportMode?: TransportMode
};

export type TransportMode =
    | "flight"
    | "car"

export const seasonOneTravelBudgetCredits: TravelBudgetCredit[] = [
    {
        id: "starting-budget",
        episode: "episode-1",
        at: 0,
        amount: 5000,
        title: "Starting budget",
        team: "sam-brian"
    },
    {
        id: "starting-budget",
        episode: "episode-1",
        at: 0,
        amount: 5000,
        title: "Starting budget",
        team: "ben-adam"
    },
    {
        id: "ba-flight-to-denver",
        episode: "episode-1",
        at: 170,
        amount: -485.96,
        title: "Flight to denver",
        team: "ben-adam",
        transportMode: "flight"
    },
    {
        id: "sb-flight-to-san-francisco",
        episode: "episode-1",
        at: 183,
        amount: -703.30,
        title: "Flight to San Francisco",
        team: "sam-brian",
        transportMode: "flight"
    },
    {
        id: "ba-rental-car-to-cheyenne",
        episode: "episode-1",
        at: 283,
        amount: -341.25,
        title: "Rental car to Cheyenne",
        team: "ben-adam",
        transportMode: "car"
    },
    {
        id: "ba-vodka",
        episode: "episode-1",
        at: 765,
        amount: -20,
        title: "Vodka",
        team: "ben-adam",
    },
    {
        id: "ba-flight-to-arizona",
        episode: "episode-1",
        at: 1382,
        amount: -841.96,
        title: "Screwing Sam",
        team: "ben-adam",
        transportMode: "flight"
    },
    {
        id: "ba-arizona-hotel",
        episode: "episode-2",
        at: 87,
        amount: -271.22,
        title: "Arizona hotel",
        team: "ben-adam",
    },
    {
        id: "sb-reno-hotel",
        episode: "episode-2",
        at: 102,
        amount: -260,
        title: "Reno hotel",
        team: "sam-brian"
    },
    {
        id:"sb-gambling-losses",
        episode: "episode-2",
        at: 135,
        amount: -100,
        title: "Gambling",
        team: "sam-brian"
    },
    {
        id: "sb-gambling-wins",
        episode: "episode-2",
        at: 157,
        amount: 200,
        title: "Luck",
        team: "sam-brian"
    },
    {
        id: "ba-flight-to-phoenix",
        episode: "episode-2",
        at: 303,
        amount: -507.20,
        title: "Flight to Phoenix",
        team: "sam-brian",
        transportMode: "flight"
    },
    {
        id: "ba-flight-to-portland",
        episode: "episode-2",
        at: 371,
        amount: -296.98,
        title: "Flight to Portland",
        team: "ben-adam",
        transportMode: "flight"
    },
    {
        id: "sb-flight-to-boise",
        episode: "episode-2",
        at: 591,
        amount: -519.96,
        title: "Flight to Boise",
        team: "sam-brian",
        transportMode: "flight"
    },
    {
        id: "ba-flight-to-salt-lake-city",
        episode: "episode-2",
        at: 1293,
        amount: -988.22,
        title: "Plane tickets",
        team: "ben-adam",
        transportMode: "flight"
    },
    {
        id: "sb-flight-to-salt-lake-city",
        episode: "episode-2",
        at: 1547,
        amount:-648.20,
        title: "Flight to Salt Lake City",
        team: "sam-brian",
        transportMode: "flight"
    },
    {
        id: "sb-salt-lake-city-hotel",
        episode: "finale",
        at:251,
        amount: -475.78,
        title: "Salt Lake City hotel",
        team: "sam-brian",
    },
    {
        id: "ba-salt-lake-city-hotel",
        episode: "finale",
        at:251,
        amount: -605.04,
        title: "Salt Lake City hotel",
        team: "ben-adam",
    },
    {
        id: "sb-uber-to-utah-capitol",
        episode: "finale",
        at: 296,
        amount: -15.99,
        title: "Uber to Utah capitol",
        team: "sam-brian",
        transportMode: "car"
    },
    {
        id: "ba-uber-to-utah-capitol",
        episode: "finale",
        at: 301,
        amount: -13.20,
        title: "Uber to Utah capitol",
        team: "ben-adam",
        transportMode: "car"
    },
    {
        id: "ba-uber-to-sal-lake-city-airport",
        episode: "finale",
        at: 590,
        amount: -16.60,
        title: "Uber to Salt Lake City Airport",
        team: "ben-adam",
        transportMode: "car"
    },
    {
        id: "sb-uber-to-sal-lake-city-airport",
        episode: "finale",
        at: 614,
        amount: -17.72,
        title: "Uber to Salt Lake City Airport",
        team: "sam-brian",
        transportMode: "car"
    },
    {
        id: "sb-montana-car-rental",
        episode: "finale",
        at: 738,
        amount: -120.73,
        title: "Montana car rental",
        team: "sam-brian",
        transportMode: "car"
    },
    {
        id: "ba-montana-car-rental",
        episode: "finale",
        at: 777,
        amount: -196.33,
        title: "Montana car rental",
        team: "ben-adam",
        transportMode: "car"
    }
];


const visibleTravelBudgetCreditsCache = new Map<
    number,
    TravelBudgetCredit[]
>();

function getVisibleItemCount(
    items: readonly { episode: string; at: number }[],
    episode: string,
    currentTime: number,
) {
    const currentTimestamp = { episode, at: currentTime };

    return items.reduce(
        (count, item) => count + Number(
            compareTimestamps(seasonOne, item, currentTimestamp) <= 0,
        ),
        0,
    );
}

export function getVisibleTravelBudgetCredits(
    episode: string,
    currentTime: number,
) {
    if (!seasonOneEpisodeOrder.includes(
        episode as (typeof seasonOneEpisodeOrder)[number],
    )) {
        return [];
    }

    const visibleCount = getVisibleItemCount(
        seasonOneTravelBudgetCredits,
        episode,
        currentTime,
    );
    const cachedCredits = visibleTravelBudgetCreditsCache.get(visibleCount);
    if (cachedCredits) return cachedCredits;

    const currentTimestamp = { episode, at: currentTime };
    const visibleCredits = seasonOneTravelBudgetCredits.filter(
        (credit) => compareTimestamps(seasonOne, credit, currentTimestamp) <= 0,
    );
    visibleTravelBudgetCreditsCache.set(visibleCount, visibleCredits);
    return visibleCredits;
}
