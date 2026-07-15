"use client";

import { type ReactNode, useId } from "react";
import { seasonFour } from "@/data/season-4";
import { compareTimestamps } from "@/lib/timestamps";
import { seasonFourEpisodeOrder } from "./state-claims";
import { seasonFourTeamIds, seasonFourTeams, type TeamId } from "./team-data";
import { TeamHistory } from "./team-history";

type LedgerItem = {
    id: string;
    episode: (typeof seasonFourEpisodeOrder)[number];
    at: number;
    amount: number;
    team?: TeamId;
};

type TeamLedgerCardProps<Item extends LedgerItem> = {
    emptyLabel: string;
    formatBalanceLabel: (balance: number) => string;
    historyTitle: string;
    items: Item[];
    renderBalance: (balance: number) => ReactNode;
    renderHistoryItem: (item: Item, team: TeamId) => ReactNode;
    renderTeamIcon: (team: TeamId) => ReactNode;
    summaryLabel: string;
    title: string;
};

export function TeamLedgerCard<Item extends LedgerItem>({
    emptyLabel,
    formatBalanceLabel,
    historyTitle,
    items,
    renderBalance,
    renderHistoryItem,
    renderTeamIcon,
    summaryLabel,
    title,
}: TeamLedgerCardProps<Item>) {
    const titleId = useId();
    const sortedItems = items.toSorted(
        (left, right) => compareTimestamps(seasonFour, right, left),
    );
    const histories = Object.fromEntries(
        seasonFourTeamIds.map((team) => [
            team,
            sortedItems.filter((item) => !item.team || item.team === team),
        ]),
    ) as Record<TeamId, Item[]>;
    const balances = Object.fromEntries(
        seasonFourTeamIds.map((team) => [
            team,
            histories[team].reduce((total, item) => total + item.amount, 0),
        ]),
    ) as Record<TeamId, number>;

    return (
        <section
            className="border-paper/25 bg-panel @container w-full overflow-hidden rounded-lg border"
            aria-labelledby={titleId}
        >
            <header className="border-paper/20 border-b px-5 py-5 sm:px-6">
                <h2
                    id={titleId}
                    className="font-heading text-3xl leading-none font-bold tracking-tight uppercase"
                >
                    {title}
                </h2>
            </header>

            <div
                className="grid grid-cols-1 @min-[36rem]:grid-cols-2"
                aria-label={summaryLabel}
            >
                {seasonFourTeamIds.map((team, index) => {
                    const balance = balances[team];
                    const balanceLabel = formatBalanceLabel(balance);

                    return (
                        <article
                            key={team}
                            className={`flex min-h-32 min-w-0 items-center gap-3 px-5 py-5 sm:gap-4 sm:px-6 ${index === 0 ? "border-paper/20 border-b @min-[36rem]:border-r @min-[36rem]:border-b-0" : ""}`}
                            style={{
                                backgroundImage: `linear-gradient(110deg, ${seasonFourTeams[team].color}24, ${seasonFourTeams[team].color}0a)`,
                            }}
                            aria-label={`${seasonFourTeams[team].name}: ${balanceLabel}`}
                        >
                            {renderTeamIcon(team)}
                            <div className="min-w-0">
                                <h3
                                    className="truncate font-heading text-base leading-none font-bold uppercase sm:text-lg"
                                    style={{ color: seasonFourTeams[team].color }}
                                >
                                    {seasonFourTeams[team].name}
                                </h3>
                                <p
                                    className="mt-2 font-display text-4xl leading-none font-bold tracking-tight tabular-nums @min-[52rem]:text-5xl"
                                    aria-label={balanceLabel}
                                >
                                    {renderBalance(balance)}
                                </p>
                            </div>
                        </article>
                    );
                })}
            </div>

            <TeamHistory
                emptyLabel={emptyLabel}
                histories={histories}
                renderItem={renderHistoryItem}
                title={historyTitle}
            />
        </section>
    );
}
