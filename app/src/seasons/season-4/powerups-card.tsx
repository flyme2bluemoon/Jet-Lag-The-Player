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
    getTeamBalance,
    getVisiblePowerupTransactions,
    seasonFourTeams,
    type PowerupTransaction,
} from "./budget-data";
import { seasonFourEpisodeOrder, type TeamId } from "./state-claims";
import { TeamHistory } from "./team-history";

type PowerupsCardProps = {
    episodeSlug: string;
    currentTime: number;
};

type PowerupName = "Border Pass" | "Card Swap" | "Reshuffle" | "Tracker";

const teamIds: TeamId[] = ["sam-brian", "ben-adam"];

const episodeLabels: Record<(typeof seasonFourEpisodeOrder)[number], string> = {
    "episode-1": "EP 1",
    "episode-2": "EP 2",
    "episode-3": "EP 3",
    "episode-4": "EP 4",
    finale: "FINALE",
};

const powerupIcons: Record<PowerupName, LucideIcon> = {
    "Border Pass": LockKeyholeOpen,
    "Card Swap": ArrowRightLeft,
    Reshuffle: Shuffle,
    Tracker: Target,
};

function formatTimestamp(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function PowerupToken({ color, size = "small" }: { color: string; size?: "small" | "large" }) {
    return (
        <span
            className={`relative grid shrink-0 place-items-center ${size === "large" ? "size-9" : "size-8"}`}
            aria-hidden="true"
        >
            <Hexagon
                className="absolute size-full fill-current"
                style={{ color }}
                strokeWidth={1.75}
            />
            <Star
                className={size === "large" ? "relative size-4 fill-white text-white" : "relative size-3.5 fill-white text-white"}
                strokeWidth={2.5}
            />
        </span>
    );
}

function PowerupHistoryContent({ transaction }: { transaction: PowerupTransaction }) {
    const isGain = transaction.amount > 0;
    const amount = Math.abs(transaction.amount);
    const Icon = powerupIcons[transaction.title as PowerupName] ?? ArrowRightLeft;
    const action = isGain
        ? `Earned ${amount === 1 ? "token" : `${amount} tokens`} by completing ${transaction.title}`
        : `Bought ${transaction.title}${transaction.detail ? ` for ${transaction.detail}` : ""}`;

    return (
        <>
            {isGain ? (
                <PowerupToken color={seasonFourTeams[transaction.team].color} />
            ) : (
                <span
                    className="grid size-8 place-items-center rounded-full"
                    style={{
                        backgroundColor: `${seasonFourTeams[transaction.team].color}26`,
                        color: seasonFourTeams[transaction.team].color,
                    }}
                >
                    <Icon className="size-4" aria-hidden="true" />
                </span>
            )}
            <div className="min-w-0">
                <p className="break-words text-xs leading-snug font-bold whitespace-normal">
                    {action}
                </p>
                <p className="text-card-meta text-4xs mt-0.5 font-mono font-bold tracking-wider uppercase">
                    {episodeLabels[transaction.episode]} · {formatTimestamp(transaction.at)}
                </p>
            </div>
            <span
                className={`font-mono text-sm font-bold tabular-nums ${isGain ? "text-budget-credit" : "text-budget-debit"}`}
                aria-label={`${isGain ? "gained" : "spent"} ${amount} powerup ${amount === 1 ? "token" : "tokens"}`}
            >
                {isGain ? "+" : "−"}{amount}
            </span>
        </>
    );
}

export function PowerupsCard({ episodeSlug, currentTime }: PowerupsCardProps) {
    const visibleTransactions = useMemo(
        () => getVisiblePowerupTransactions(episodeSlug, currentTime),
        [currentTime, episodeSlug],
    );
    const powerupHistory = useMemo(
        () => visibleTransactions.toSorted((left, right) => {
            const episodeDifference =
                seasonFourEpisodeOrder.indexOf(right.episode) -
                seasonFourEpisodeOrder.indexOf(left.episode);
            return episodeDifference || right.at - left.at;
        }),
        [visibleTransactions],
    );
    const teamPowerupHistory = useMemo(
        () => Object.fromEntries(
            teamIds.map((team) => [
                team,
                powerupHistory.filter((transaction) => transaction.team === team),
            ]),
        ) as Record<TeamId, PowerupTransaction[]>,
        [powerupHistory],
    );

    return (
        <section
            className="border-paper/25 bg-panel @container w-full border"
            aria-labelledby="powerups-title"
        >
            <header className="px-6 pt-6 pb-4 sm:px-8 sm:pt-7">
                <h2
                    id="powerups-title"
                    className="font-display text-3xl leading-none font-black tracking-tight uppercase"
                >
                    Powerups
                </h2>
            </header>

            <div
                className="grid grid-cols-2 px-2 sm:px-4 @min-[44rem]:px-0"
                aria-label="Powerup token balances"
            >
                {teamIds.map((team, index) => {
                    const balance = getTeamBalance(visibleTransactions, team);

                    return (
                        <article
                            key={team}
                            className={`min-w-0 px-3 py-4 sm:px-4 @min-[44rem]:px-8 ${index === 0 ? "border-paper/15 border-r" : ""}`}
                            aria-label={`${seasonFourTeams[team].name}: ${balance} powerup ${balance === 1 ? "token" : "tokens"}`}
                        >
                            <div className="mb-3 flex min-w-0 items-center gap-2.5">
                                <PowerupToken color={seasonFourTeams[team].color} size="large" />
                                <h3 className="truncate font-heading text-xs font-bold">
                                    {seasonFourTeams[team].name}
                                </h3>
                            </div>
                            <p className="font-display text-3xl leading-none tabular-nums sm:text-4xl">
                                {balance}
                            </p>
                        </article>
                    );
                })}
            </div>

            <TeamHistory
                emptyLabel="No powerup activity yet"
                histories={teamPowerupHistory}
                id="powerup-history-title"
                renderItem={(transaction) => (
                    <PowerupHistoryContent transaction={transaction} />
                )}
                title="Powerup History"
            />
        </section>
    );
}
