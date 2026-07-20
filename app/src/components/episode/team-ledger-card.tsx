"use client";

import { type CSSProperties, type ReactNode, useId, useMemo } from "react";
import { compareTimestamps } from "@/lib/timestamps";
import { type LedgerTeam, TeamHistory } from "./team-history";

type SeasonWithEpisodes = {
    slug?: string;
    episodes: readonly { slug: string }[];
};

type LedgerItem<TeamId extends string> = {
    id: string;
    episode: string;
    at: number;
    amount: number;
    team?: TeamId;
};

type TeamLedgerCardProps<
    TeamId extends string,
    Item extends LedgerItem<TeamId>,
> = {
    emptyLabel: string;
    formatBalanceLabel: (balance: number) => string;
    historyTitle: string;
    items: Item[];
    renderBalance: (balance: number) => ReactNode;
    renderHistoryItem: (item: Item, team: TeamId) => ReactNode;
    renderTeamIcon: (team: TeamId) => ReactNode;
    season: SeasonWithEpisodes;
    summaryLabel: string;
    teamIds: readonly TeamId[];
    teams: Record<TeamId, LedgerTeam>;
    title: string;
};

export function TeamLedgerCard<
    TeamId extends string,
    Item extends LedgerItem<TeamId>,
>({
    emptyLabel,
    formatBalanceLabel,
    historyTitle,
    items,
    renderBalance,
    renderHistoryItem,
    renderTeamIcon,
    season,
    summaryLabel,
    teamIds,
    teams,
    title,
}: TeamLedgerCardProps<TeamId, Item>) {
    const titleId = useId();
    const { balances, histories } = useMemo(() => {
        const sortedItems = items.toSorted(
            (left, right) => compareTimestamps(season, right, left),
        );
        const nextHistories = Object.fromEntries(
            teamIds.map((team) => [
                team,
                sortedItems.filter((item) => !item.team || item.team === team),
            ]),
        ) as Record<TeamId, Item[]>;
        const nextBalances = Object.fromEntries(
            teamIds.map((team) => [
                team,
                nextHistories[team].reduce(
                    (total, item) => total + item.amount,
                    0,
                ),
            ]),
        ) as Record<TeamId, number>;

        return { balances: nextBalances, histories: nextHistories };
    }, [items, season, teamIds]);

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
                className="grid grid-cols-1 @min-[36rem]:grid-cols-[repeat(var(--team-count),minmax(0,1fr))]"
                style={{ "--team-count": teamIds.length } as CSSProperties}
                aria-label={summaryLabel}
            >
                {teamIds.map((team, index) => {
                    const balance = balances[team];
                    const balanceLabel = formatBalanceLabel(balance);

                    return (
                        <article
                            key={team}
                            className={`flex min-h-32 min-w-0 items-center gap-3 px-5 py-5 sm:gap-4 sm:px-6 ${index < teamIds.length - 1 ? "border-paper/20 border-b @min-[36rem]:border-r @min-[36rem]:border-b-0" : ""}`}
                            style={{
                                backgroundImage: `linear-gradient(110deg, color-mix(in srgb, ${teams[team].color} 14%, transparent), color-mix(in srgb, ${teams[team].color} 4%, transparent))`,
                            }}
                            aria-label={`${teams[team].name}: ${balanceLabel}`}
                        >
                            {renderTeamIcon(team)}
                            <div className="min-w-0">
                                <h3
                                    className="truncate font-heading text-base leading-none font-bold uppercase sm:text-lg"
                                    style={{ color: teams[team].color }}
                                >
                                    {teams[team].name}
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
                teamIds={teamIds}
                teams={teams}
                title={historyTitle}
            />
        </section>
    );
}
