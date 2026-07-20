"use client";

import { Banknote, Car, CarTaxiFront, Plane, type LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { AnimatedNumber } from "@/components/episode/animated-number";
import { TeamLedgerCard } from "@/components/episode/team-ledger-card";
import { TeamLedgerHistoryItem } from "@/components/episode/team-ledger-history-item";
import { seasonEighteen } from "@/data/season-18";
import { formatBudgetAmount } from "@/lib/formatters";
import {
    getVisibleBudgetTransactions,
    type BudgetTransaction,
    type TransportMode,
} from "./budget-data";
import {
    seasonEighteenTeamIds,
    seasonEighteenTeams,
    type TeamId,
} from "./team-data";

type BudgetCardProps = {
    episodeSlug: string;
    currentTime: number;
};

const transportModeIcons: Record<TransportMode, LucideIcon> = {
    flight: Plane,
    "rental-car": Car,
    rideshare: CarTaxiFront,
};

function TransactionContent({
    team,
    transaction,
}: {
    team: TeamId;
    transaction: BudgetTransaction;
}) {
    const isCredit = transaction.amount > 0;
    const teamColor = seasonEighteenTeams[team].color;
    const Icon = transaction.transportMode
        ? transportModeIcons[transaction.transportMode]
        : Banknote;

    return (
        <TeamLedgerHistoryItem
            amount={(
                <>
                    {isCredit ? "+$" : "−$"}
                    {Math.abs(transaction.amount).toLocaleString("en-US")}
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
    const visibleTransactions = useMemo(
        () => getVisibleBudgetTransactions(episodeSlug, currentTime),
        [currentTime, episodeSlug],
    );

    return (
        <TeamLedgerCard
            emptyLabel="No transactions yet"
            formatBalanceLabel={(balance) => `$${formatBudgetAmount(balance)}`}
            historyTitle="Transaction History"
            items={visibleTransactions}
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
                        backgroundColor: `color-mix(in srgb, ${seasonEighteenTeams[team].color} 73%, transparent)`,
                        borderColor: seasonEighteenTeams[team].color,
                    }}
                    aria-hidden="true"
                >
                    <Banknote className="text-challenge-card-paper size-6" />
                </span>
            )}
            season={seasonEighteen}
            summaryLabel="Team budget totals"
            teamIds={seasonEighteenTeamIds}
            teams={seasonEighteenTeams}
            title="Team Budgets"
        />
    );
}
