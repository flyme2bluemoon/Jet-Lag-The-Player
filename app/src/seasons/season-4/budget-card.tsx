"use client";

import {
    Banknote,
    BanknoteArrowDown,
    BanknoteArrowUp,
    Bike,
    Car,
    CarTaxiFront,
    Plane,
    Scooter,
    TrainFront,
    TramFront,
    type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";
import {
    getTravelBudgetAllocation,
    getVisibleTravelBudgetCredits,
    seasonFourTeams,
    type TransportMode,
    type TravelBudgetCredit,
} from "./budget-data";
import {
    seasonFourEpisodeOrder,
    type TeamId,
} from "./state-claims";
import { AnimatedBudgetAmount } from "./animated-budget-amount";
import { TeamHistory } from "./team-history";

const episodeLabels: Record<(typeof seasonFourEpisodeOrder)[number], string> = {
    "episode-1": "EP 1",
    "episode-2": "EP 2",
    "episode-3": "EP 3",
    "episode-4": "EP 4",
    finale: "FINALE",
};

type BudgetCardProps = {
    episodeSlug: string;
    currentTime: number;
};

const teamIds = Object.keys(seasonFourTeams) as TeamId[];

const transportModeIcons: Record<TransportMode, LucideIcon> = {
    metro: TramFront,
    "intercity-rail": TrainFront,
    rideshare: CarTaxiFront,
    car: Car,
    flight: Plane,
    "bike-share": Bike,
    "scooter-share": Scooter,
};

function formatTimestamp(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function TransactionContent({ transaction }: { transaction: TravelBudgetCredit }) {
    const isCredit = transaction.amount > 0;
    const Icon = transaction.transportMode
        ? transportModeIcons[transaction.transportMode]
        : isCredit
          ? BanknoteArrowUp
          : BanknoteArrowDown;

    return (
        <>
            <span
                className={`grid size-8 place-items-center rounded-full ${isCredit ? "bg-team-sam-brian/15 text-budget-credit" : "bg-team-ben-adam/15 text-budget-debit"}`}
            >
                <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="truncate text-xs font-bold">
                    {transaction.title}
                </p>
                <p className="text-card-meta text-4xs mt-0.5 font-mono font-bold tracking-wider uppercase">
                    {episodeLabels[transaction.episode]} · {formatTimestamp(transaction.at)}
                </p>
            </div>
            <span
                className={`font-mono text-sm font-bold tabular-nums ${isCredit ? "text-budget-credit" : "text-budget-debit"}`}
            >
                {transaction.amount > 0 ? "+$" : "−$"}
                {Math.abs(transaction.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
            </span>
        </>
    );
}

export function BudgetCard({ episodeSlug, currentTime }: BudgetCardProps) {
    const visibleTravelCredits = useMemo(
        () => getVisibleTravelBudgetCredits(episodeSlug, currentTime),
        [currentTime, episodeSlug],
    );
    const transactionHistory = useMemo(
        () => visibleTravelCredits.toSorted((left, right) => {
            const episodeDifference =
                seasonFourEpisodeOrder.indexOf(right.episode) -
                seasonFourEpisodeOrder.indexOf(left.episode);
            return episodeDifference || right.at - left.at;
        }),
        [visibleTravelCredits],
    );
    const teamTransactionHistory = useMemo(
        () => Object.fromEntries(
            teamIds.map((team) => [
                team,
                transactionHistory.filter(
                    (transaction) => !transaction.team || transaction.team === team,
                ),
            ]),
        ) as Record<TeamId, TravelBudgetCredit[]>,
        [transactionHistory],
    );
    return (
        <section
            className="border-paper/25 bg-panel @container w-full border"
            aria-labelledby="budget-title"
        >
            <header className="px-6 pt-6 pb-4 sm:px-8 sm:pt-7">
                <h2
                    id="budget-title"
                    className="font-display text-3xl leading-none font-black tracking-tight uppercase"
                >
                    Travel budgets
                </h2>
            </header>

            <div
                className="grid grid-cols-2 px-2 sm:px-4 @min-[44rem]:px-0"
                aria-label="Team travel budget totals"
            >
                {teamIds.map((team, index) => {
                    const travelBudget = getTravelBudgetAllocation(
                        visibleTravelCredits,
                        team,
                    );

                    return (
                        <article
                            key={team}
                            className={`min-w-0 px-3 py-4 sm:px-4 @min-[44rem]:px-8 ${index === 0 ? "border-paper/15 border-r" : ""}`}
                            aria-label={`${seasonFourTeams[team].name} travel budget`}
                        >
                            <div className="mb-3 flex min-w-0 items-center gap-2.5">
                                <span
                                    className="grid size-8 shrink-0 place-items-center rounded-full"
                                    style={{ backgroundColor: seasonFourTeams[team].color }}
                                >
                                    <Banknote className="size-4 text-white" aria-hidden="true" />
                                </span>
                                <h3 className="truncate font-heading text-xs font-bold">
                                    {seasonFourTeams[team].name}
                                </h3>
                            </div>
                            <p
                                className="font-display text-3xl leading-none tabular-nums sm:text-4xl"
                                aria-label={`$${travelBudget.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`}
                            >
                                $<AnimatedBudgetAmount value={travelBudget} />
                            </p>
                        </article>
                    );
                })}
            </div>

            <TeamHistory
                emptyLabel="No transactions yet"
                histories={teamTransactionHistory}
                id="transaction-history-title"
                renderItem={(transaction) => (
                    <TransactionContent transaction={transaction} />
                )}
                title="Transaction History"
            />
        </section>
    );
}
