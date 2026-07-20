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
    getVisibleTravelBudgetCredits,
    type TransportMode,
    type TravelBudgetCredit,
} from "./budget-data";
import { AnimatedNumber } from "@/components/episode/animated-number";
import { TeamLedgerCard } from "@/components/episode/team-ledger-card";
import { TeamLedgerHistoryItem } from "@/components/episode/team-ledger-history-item";
import { seasonFour } from "@/data/season-4";
import { formatBudgetAmount } from "@/lib/formatters";
import { seasonFourTeamIds, seasonFourTeams, type TeamId } from "./team-data";

type BudgetCardProps = {
    episodeSlug: string;
    currentTime: number;
};

const transportModeIcons: Record<TransportMode, LucideIcon> = {
    metro: TramFront,
    "intercity-rail": TrainFront,
    rideshare: CarTaxiFront,
    car: Car,
    flight: Plane,
    "bike-share": Bike,
    "scooter-share": Scooter,
};

function TransactionContent({
    team,
    transaction,
}: {
    team: TeamId;
    transaction: TravelBudgetCredit;
}) {
    const isCredit = transaction.amount > 0;
    const teamColor = seasonFourTeams[team].color;
    const Icon = transaction.transportMode
        ? transportModeIcons[transaction.transportMode]
        : isCredit
          ? BanknoteArrowUp
          : BanknoteArrowDown;

    return (
        <TeamLedgerHistoryItem
            amount={(
                <>
                    {transaction.amount > 0 ? "+$" : "−$"}
                    {formatBudgetAmount(Math.abs(transaction.amount))}
                </>
            )}
            at={transaction.at}
            description={transaction.title}
            episode={transaction.episode}
            icon={(
                <span
                    className="grid size-9 place-items-center rounded-full"
                    style={{
                        backgroundColor: `color-mix(in srgb, ${teamColor} 15%, transparent)`,
                        color: teamColor,
                    }}
                >
                    <Icon className="size-4" aria-hidden="true" />
                </span>
            )}
            isCredit={isCredit}
        />
    );
}

export function BudgetCard({ episodeSlug, currentTime }: BudgetCardProps) {
    const visibleTravelCredits = useMemo(
        () => getVisibleTravelBudgetCredits(episodeSlug, currentTime),
        [currentTime, episodeSlug],
    );

    return (
        <TeamLedgerCard
            emptyLabel="No transactions yet"
            formatBalanceLabel={(balance) => `$${formatBudgetAmount(balance)}`}
            historyTitle="Transaction History"
            items={visibleTravelCredits}
            renderBalance={(balance) => (
                <>
                    $
                    <AnimatedNumber
                        value={balance}
                        formatValue={formatBudgetAmount}
                        aria-hidden="true"
                    />
                </>
            )}
            renderHistoryItem={(transaction, team) => (
                <TransactionContent team={team} transaction={transaction} />
            )}
            renderTeamIcon={(team) => (
                <span
                    className="shadow-team-icon grid size-14 shrink-0 place-items-center rounded-full border"
                    style={{
                        backgroundColor: `color-mix(in srgb, ${seasonFourTeams[team].color} 73%, transparent)`,
                        borderColor: seasonFourTeams[team].color,
                    }}
                    aria-hidden="true"
                >
                    <Banknote className="text-challenge-card-paper size-6" />
                </span>
            )}
            season={seasonFour}
            summaryLabel="Team travel budget totals"
            teamIds={seasonFourTeamIds}
            teams={seasonFourTeams}
            title="Travel budgets"
        />
    );
}
