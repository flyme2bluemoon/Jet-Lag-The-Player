"use client";

import {
    ArrowRightLeft,
    Hexagon,
    LockKeyholeOpen,
    Shuffle,
    Star,
    Target,
    type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";
import {
    getVisiblePowerupTransactions,
    type PowerupTransaction,
} from "./budget-data";
import { seasonFourTeams, type TeamId } from "./team-data";
import { TeamLedgerCard } from "./team-ledger-card";
import { TeamLedgerHistoryItem } from "./team-ledger-history-item";

type PowerupsCardProps = {
    episodeSlug: string;
    currentTime: number;
};

type PowerupName = "Border Pass" | "Card Swap" | "Reshuffle" | "Tracker";

const powerupIcons: Record<PowerupName, LucideIcon> = {
    "Border Pass": LockKeyholeOpen,
    "Card Swap": ArrowRightLeft,
    Reshuffle: Shuffle,
    Tracker: Target,
};

function PowerupToken({ color, size = "small" }: { color: string; size?: "small" | "large" }) {
    return (
        <span
            className={`relative grid shrink-0 place-items-center ${size === "large" ? "size-14" : "size-8"}`}
            aria-hidden="true"
        >
            <Hexagon
                className="absolute size-full fill-current"
                style={{ color }}
                strokeWidth={1.75}
            />
            <Star
                className={size === "large" ? "fill-challenge-card-paper text-challenge-card-paper relative size-6" : "fill-challenge-card-paper text-challenge-card-paper relative size-3.5"}
                strokeWidth={2.5}
            />
        </span>
    );
}

function PowerupHistoryContent({
    team,
    transaction,
}: {
    team: TeamId;
    transaction: PowerupTransaction;
}) {
    const isGain = transaction.amount > 0;
    const amount = Math.abs(transaction.amount);
    const teamColor = seasonFourTeams[team].color;
    const Icon = powerupIcons[transaction.title as PowerupName] ?? ArrowRightLeft;
    const action = isGain
        ? `Earned ${amount === 1 ? "token" : `${amount} tokens`} by completing ${transaction.title}`
        : `Bought ${transaction.title}${transaction.detail ? ` for ${transaction.detail}` : ""}`;

    return (
        <TeamLedgerHistoryItem
            amount={<>{isGain ? "+" : "−"}{amount}</>}
            amountLabel={`${isGain ? "gained" : "spent"} ${amount} powerup ${amount === 1 ? "token" : "tokens"}`}
            at={transaction.at}
            description={action}
            episode={transaction.episode}
            icon={isGain ? (
                <PowerupToken color={teamColor} />
            ) : (
                <span
                    className="grid size-8 place-items-center rounded-full"
                    style={{
                        backgroundColor: `color-mix(in srgb, ${teamColor} 15%, transparent)`,
                        color: teamColor,
                    }}
                >
                    <Icon className="size-4" aria-hidden="true" />
                </span>
            )}
            isCredit={isGain}
            wrapDescription
        />
    );
}

export function PowerupsCard({ episodeSlug, currentTime }: PowerupsCardProps) {
    const visibleTransactions = useMemo(
        () => getVisiblePowerupTransactions(episodeSlug, currentTime),
        [currentTime, episodeSlug],
    );

    return (
        <TeamLedgerCard
            emptyLabel="No powerup activity yet"
            formatBalanceLabel={(balance) =>
                `${balance} powerup ${balance === 1 ? "token" : "tokens"}`
            }
            historyTitle="Powerup History"
            items={visibleTransactions}
            renderBalance={(balance) => balance}
            renderHistoryItem={(transaction, team) => (
                <PowerupHistoryContent team={team} transaction={transaction} />
            )}
            renderTeamIcon={(team) => (
                <PowerupToken color={seasonFourTeams[team].color} size="large" />
            )}
            summaryLabel="Powerup token balances"
            title="Powerups"
        />
    );
}
