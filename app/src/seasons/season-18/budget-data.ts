import { seasonEighteen } from "@/data/season-18";
import { compareTimestamps } from "@/lib/timestamps";
import type { TeamId } from "./team-data";

export type TransportMode = "flight" | "rental-car" | "rideshare";

export type BudgetTransaction = {
    id: string;
    episode: (typeof seasonEighteen.episodes)[number]["slug"];
    at: number;
    amount: number;
    title: string;
    transportMode?: TransportMode;
    team?: TeamId;
};

const seasonEighteenBudgetTransactions: BudgetTransaction[] = [
    {
        id: "starting-budget",
        episode: "episode-1",
        at: 0,
        amount: 3500,
        title: "Starting budget",
    },
    {
        id: "sam-amy-flight-lga-ord",
        episode: "episode-1",
        at: 4 * 60 + 14,
        amount: -558,
        title: "Flight from LGA to ORD",
        transportMode: "flight",
        team: "sam-amy",
    },
    {
        id: "ben-adam-flight-lga-mem",
        episode: "episode-1",
        at: 4 * 60 + 43,
        amount: -847,
        title: "Flight from LGA to MEM",
        transportMode: "flight",
        team: "ben-adam",
    },
    {
        id: "ben-adam-rental-car-mem",
        episode: "episode-1",
        at: 13 * 60 + 13,
        amount: -141,
        title: "Rental Car (MEM Airport)",
        transportMode: "rental-car",
        team: "ben-adam",
    },
    {
        id: "sam-amy-rideshare-ord",
        episode: "episode-1",
        at: 17 * 60 + 19,
        amount: -52,
        title: "Rideshare (ORD Airport)",
        transportMode: "rideshare",
        team: "sam-amy",
    },
    {
        id: "sam-amy-flight-ord-dtw",
        episode: "episode-1",
        at: 41 * 60 + 44,
        amount: -741,
        title: "Flight from ORD to DTW",
        transportMode: "flight",
        team: "sam-amy",
    },
    {
        id: "ben-adam-rental-car-drop-off-change",
        episode: "episode-2",
        at: 3 * 60 + 48,
        amount: -448,
        title: "Rental Car Drop-Off Change",
        transportMode: "rental-car",
        team: "ben-adam",
    },
    {
        id: "sam-amy-rental-car-dtw",
        episode: "episode-2",
        at: 4 * 60 + 5,
        amount: -118,
        title: "Rental Car (DTW Airport)",
        transportMode: "rental-car",
        team: "sam-amy",
    },
    {
        id: "new-day-bonus-day-2",
        episode: "episode-2",
        at: 18 * 60 + 28,
        amount: 1000,
        title: "New Day Bonus",
    },
    {
        id: "sam-amy-flight-dtw-bos",
        episode: "episode-2",
        at: 24 * 60 + 56,
        amount: -1100,
        title: "Flight from DTW to BOS",
        transportMode: "flight",
        team: "sam-amy",
    },
    {
        id: "ben-adam-flight-atl-stl",
        episode: "episode-2",
        at: 36 * 60 + 9,
        amount: -730,
        title: "Flight from ATL to STL",
        transportMode: "flight",
        team: "ben-adam",
    },
    {
        id: "sam-amy-rental-car-bos",
        episode: "episode-2",
        at: 40 * 60 + 6,
        amount: -126,
        title: "Rental Car (BOS Airport)",
        transportMode: "rental-car",
        team: "sam-amy",
    },
    {
        id: "ben-adam-rideshare-stl",
        episode: "episode-3",
        at: 3 * 60 + 3,
        amount: -108,
        title: "Rideshare (STL Airport)",
        transportMode: "rideshare",
        team: "ben-adam",
    },
    {
        id: "ben-adam-rental-car-st-louis",
        episode: "episode-3",
        at: 18 * 60 + 25,
        amount: -248,
        title: "Rental Car (Downtown St. Louis)",
        transportMode: "rental-car",
        team: "ben-adam",
    },
    {
        id: "sam-amy-new-day-bonus-day-3",
        episode: "episode-3",
        at: 29 * 60 + 50,
        amount: 1000,
        title: "New Day Bonus",
        team: "sam-amy",
    },
    {
        id: "ben-adam-new-day-bonus-day-3",
        episode: "episode-3",
        at: 29 * 60 + 50,
        amount: 1000,
        title: "New Day Bonus",
        team: "ben-adam",
    },
    {
        id: "sam-amy-flight-bos-stl",
        episode: "episode-3",
        at: 36 * 60 + 52,
        amount: -847,
        title: "Flight from BOS to STL",
        transportMode: "flight",
        team: "sam-amy",
    },
    {
        id: "ben-adam-flight-stl-dca",
        episode: "episode-3",
        at: 37 * 60 + 51,
        amount: -921,
        title: "Flight from STL to DCA",
        transportMode: "flight",
        team: "ben-adam",
    },
    {
        id: "sam-amy-rental-car-stl",
        episode: "episode-4",
        at: 5 * 60 + 31,
        amount: -288,
        title: "Rental Car (STL Airport)",
        transportMode: "rental-car",
        team: "sam-amy",
    },
    {
        id: "ben-adam-rental-car-dca",
        episode: "episode-4",
        at: 8 * 60 + 30,
        amount: -182,
        title: "Rental Car (DCA Airport)",
        transportMode: "rental-car",
        team: "ben-adam",
    },
    {
        id: "sam-amy-new-day-bonus-day-4",
        episode: "episode-4",
        at: 26 * 60 + 50,
        amount: 1000,
        title: "New Day Bonus",
        team: "sam-amy",
    },
    {
        id: "ben-adam-new-day-bonus-day-4",
        episode: "episode-4",
        at: 26 * 60 + 50,
        amount: 1000,
        title: "New Day Bonus",
        team: "ben-adam",
    },
    {
        id: "sam-amy-rental-car-drop-off-change-day-4",
        episode: "episode-5",
        at: 2 * 60 + 19,
        amount: -274,
        title: "Rental Car Drop-Off Change",
        transportMode: "rental-car",
        team: "sam-amy",
    },
    {
        id: "ben-adam-rideshare-philadelphia-30th",
        episode: "episode-5",
        at: 8 * 60 + 21,
        amount: -24,
        title: "Rideshare (30th Street Station)",
        transportMode: "rideshare",
        team: "ben-adam",
    },
    {
        id: "ben-adam-rideshare-downtown-philadelphia",
        episode: "episode-5",
        at: 18 * 60 + 51,
        amount: -68,
        title: "Rideshare (Downtown Philadelphia)",
        transportMode: "rideshare",
        team: "ben-adam",
    },
    {
        id: "sam-amy-new-day-bonus-day-5",
        episode: "episode-5",
        at: 45 * 60 + 57,
        amount: 1000,
        title: "New Day Bonus",
        team: "sam-amy",
    },
    {
        id: "ben-adam-new-day-bonus-day-5",
        episode: "episode-5",
        at: 45 * 60 + 57,
        amount: 1000,
        title: "New Day Bonus",
        team: "ben-adam",
    },
];

export function getVisibleBudgetTransactions(
    episode: string,
    currentTime: number,
) {
    if (!seasonEighteen.episodes.some(({ slug }) => slug === episode)) {
        return [];
    }

    const currentTimestamp = { episode, at: currentTime };

    return seasonEighteenBudgetTransactions.filter(
        (transaction) =>
            compareTimestamps(seasonEighteen, transaction, currentTimestamp) <= 0,
    );
}
