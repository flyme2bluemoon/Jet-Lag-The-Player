"use client";

import { Tabs } from "radix-ui";
import { type ReactNode, useId } from "react";
import { seasonFourTeamIds, seasonFourTeams, type TeamId } from "./team-data";

type HistoryItem = {
    id: string;
};

type TeamHistoryProps<Item extends HistoryItem> = {
    emptyLabel: string;
    histories: Record<TeamId, Item[]>;
    renderItem: (item: Item, team: TeamId) => ReactNode;
    title: string;
};

type HistoryViewProps<Item extends HistoryItem> = Pick<
    TeamHistoryProps<Item>,
    "emptyLabel" | "histories" | "renderItem"
>;

type MobileHistoryProps<Item extends HistoryItem> = HistoryViewProps<Item> & {
    title: string;
};

function HistoryList<Item extends HistoryItem>({
    emptyLabel,
    items,
    label,
    renderItem,
    team,
}: {
    emptyLabel: string;
    items: Item[];
    label: string;
    renderItem: (item: Item, team: TeamId) => ReactNode;
    team: TeamId;
}) {
    if (items.length === 0) {
        return (
            <div className="grid h-28 place-items-center px-5 text-center sm:px-6">
                <p className="text-card-meta font-display text-base leading-none font-bold uppercase">
                    {emptyLabel}
                </p>
            </div>
        );
    }

    return (
        <ol aria-label={label}>
            {items.map((item) => (
                <li
                    key={item.id}
                    className="border-paper/10 grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b px-5 py-2.5 last:border-0 sm:px-6"
                >
                    {renderItem(item, team)}
                </li>
            ))}
        </ol>
    );
}

function DesktopHistory<Item extends HistoryItem>({
    emptyLabel,
    histories,
    renderItem,
}: HistoryViewProps<Item>) {
    return (
        <div className="border-paper/20 hidden grid-cols-2 border-t @min-[44rem]:grid">
            {seasonFourTeamIds.map((team, index) => (
                <div
                    key={team}
                    className={`max-h-88 min-w-0 overflow-y-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper ${index === 0 ? "border-paper/20 border-r" : ""}`}
                    aria-label={`${seasonFourTeams[team].name} history`}
                    tabIndex={0}
                >
                    <h4
                        className="border-paper/20 bg-panel sticky top-0 z-10 flex items-center gap-2.5 border-b px-5 py-3 font-heading text-base leading-none font-bold uppercase sm:px-6"
                        style={{
                            backgroundImage: `linear-gradient(color-mix(in srgb, ${seasonFourTeams[team].color} 7%, transparent), color-mix(in srgb, ${seasonFourTeams[team].color} 7%, transparent))`,
                            color: seasonFourTeams[team].color,
                        }}
                    >
                        <span
                            className="size-2.5 shrink-0"
                            style={{ backgroundColor: seasonFourTeams[team].color }}
                            aria-hidden="true"
                        />
                        {seasonFourTeams[team].name}
                    </h4>
                    <HistoryList
                        emptyLabel={emptyLabel}
                        items={histories[team]}
                        label={`${seasonFourTeams[team].name} history`}
                        renderItem={renderItem}
                        team={team}
                    />
                </div>
            ))}
        </div>
    );
}

function MobileHistory<Item extends HistoryItem>({
    emptyLabel,
    histories,
    renderItem,
    title,
}: MobileHistoryProps<Item>) {
    const historyLabel = title.toLowerCase();

    return (
        <Tabs.Root
            className="border-paper/20 border-t @min-[44rem]:hidden"
            defaultValue={seasonFourTeamIds[0]}
        >
            <Tabs.List
                className="border-paper/20 bg-panel sticky top-0 z-10 grid grid-cols-2 border-b"
                aria-label={`Choose a team for ${historyLabel}`}
            >
                {seasonFourTeamIds.map((team) => (
                    <Tabs.Trigger
                        key={team}
                        value={team}
                        className="bg-paper/8 text-card-meta hover:text-paper data-[state=active]:bg-panel data-[state=active]:text-paper dark:bg-transparent dark:data-[state=active]:bg-paper/8 flex min-w-0 items-center justify-center gap-2 px-4 py-3 font-heading text-base leading-none font-bold uppercase whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper"
                    >
                        <span
                            className="size-2.5 shrink-0"
                            style={{
                                backgroundColor: seasonFourTeams[team].color,
                            }}
                        />
                        {seasonFourTeams[team].name}
                    </Tabs.Trigger>
                ))}
            </Tabs.List>

            {seasonFourTeamIds.map((team) => (
                <Tabs.Content
                    key={team}
                    value={team}
                    className="max-h-88 min-w-0 overflow-y-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper"
                    aria-label={`${seasonFourTeams[team].name} ${historyLabel}`}
                    tabIndex={0}
                >
                    <HistoryList
                        emptyLabel={emptyLabel}
                        items={histories[team]}
                        label={`${seasonFourTeams[team].name} ${historyLabel}`}
                        renderItem={renderItem}
                        team={team}
                    />
                </Tabs.Content>
            ))}
        </Tabs.Root>
    );
}

export function TeamHistory<Item extends HistoryItem>({
    emptyLabel,
    histories,
    renderItem,
    title,
}: TeamHistoryProps<Item>) {
    const titleId = useId();

    return (
        <section
            className="border-paper/20 border-t"
            aria-labelledby={titleId}
        >
            <h3
                id={titleId}
                className="px-5 py-4 font-heading text-2xl leading-none font-bold uppercase sm:px-6 sm:text-3xl"
            >
                {title}
            </h3>

            <DesktopHistory
                emptyLabel={emptyLabel}
                histories={histories}
                renderItem={renderItem}
            />
            <MobileHistory
                emptyLabel={emptyLabel}
                histories={histories}
                renderItem={renderItem}
                title={title}
            />
        </section>
    );
}
