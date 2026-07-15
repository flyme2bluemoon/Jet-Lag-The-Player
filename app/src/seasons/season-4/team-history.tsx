"use client";

import { Tabs } from "radix-ui";
import type { ReactNode } from "react";
import { seasonFourTeams } from "./budget-data";
import type { TeamId } from "./state-claims";

type HistoryItem = {
    id: string;
};

type TeamHistoryProps<Item extends HistoryItem> = {
    emptyLabel: string;
    histories: Record<TeamId, Item[]>;
    id: string;
    renderItem: (item: Item) => ReactNode;
    title: string;
};

const teamIds: TeamId[] = ["sam-brian", "ben-adam"];

function HistoryList<Item extends HistoryItem>({
    emptyLabel,
    items,
    renderItem,
}: {
    emptyLabel: string;
    items: Item[];
    renderItem: (item: Item) => ReactNode;
}) {
    if (!items.length) {
        return (
            <div className="border-paper/10 grid h-24 place-items-center border border-dashed text-center">
                <p className="text-card-meta text-xs">{emptyLabel}</p>
            </div>
        );
    }

    return (
        <ol className="max-h-80 overflow-y-auto pr-1">
            {items.map((item) => (
                <li
                    key={item.id}
                    className="border-paper/10 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b py-3 first:pt-1 last:border-0 last:pb-1"
                >
                    {renderItem(item)}
                </li>
            ))}
        </ol>
    );
}

export function TeamHistory<Item extends HistoryItem>({
    emptyLabel,
    histories,
    id,
    renderItem,
    title,
}: TeamHistoryProps<Item>) {
    const rowCount = Math.max(1, ...teamIds.map((team) => histories[team].length));

    return (
        <section
            className="px-5 pt-5 pb-5 sm:px-7 @min-[44rem]:px-8"
            aria-labelledby={id}
        >
            <div
                className="border-paper/15 -mx-5 border-t sm:-mx-7 @min-[44rem]:-mx-8"
                aria-hidden="true"
            />
            <h3 id={id} className="py-6 font-heading text-lg font-black">
                {title}
            </h3>

            <div className="border-paper/15 -mx-8 -mb-5 hidden max-h-96 w-[calc(100%+4rem)] overflow-y-auto border-t @min-[44rem]:block">
                <table className="w-full table-fixed border-collapse text-left">
                    <colgroup>
                        <col className="w-1/2" />
                        <col className="w-1/2" />
                    </colgroup>
                    <thead className="bg-panel sticky top-0 z-10">
                        <tr className="border-paper/15 border-b">
                            {teamIds.map((team, index) => (
                                <th
                                    key={team}
                                    className={`px-8 py-2.5 ${index === 0 ? "border-paper/15 border-r" : ""}`}
                                >
                                    <span className="flex items-center gap-2.5 font-heading text-sm font-black">
                                        <span
                                            className="size-3 shrink-0 rounded-full"
                                            style={{ backgroundColor: seasonFourTeams[team].color }}
                                        />
                                        {seasonFourTeams[team].name}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rowCount }, (_, rowIndex) => (
                            <tr
                                key={teamIds.map((team) => histories[team][rowIndex]?.id ?? "empty").join(":")}
                                className="border-paper/10 border-b last:border-0"
                            >
                                {teamIds.map((team, index) => {
                                    const item = histories[team][rowIndex];

                                    return (
                                        <td
                                            key={team}
                                            className={`align-middle ${index === 0 ? "border-paper/15 border-r" : ""}`}
                                        >
                                            {item ? (
                                                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-8 py-3">
                                                    {renderItem(item)}
                                                </div>
                                            ) : rowIndex === 0 ? (
                                                <p className="text-card-meta px-8 py-6 text-xs">
                                                    {emptyLabel}
                                                </p>
                                            ) : null}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Tabs.Root className="@min-[44rem]:hidden" defaultValue="sam-brian">
                <Tabs.List
                    className="bg-paper/8 mb-4 inline-flex max-w-full items-center gap-1 rounded-lg p-1"
                    aria-label={`Choose a team for ${title.toLowerCase()}`}
                >
                    {teamIds.map((team) => (
                        <Tabs.Trigger
                            key={team}
                            value={team}
                            className="text-card-meta hover:text-paper data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:shadow-sm flex min-w-32 items-center justify-center gap-2 rounded-md px-4 py-1.5 font-heading text-xs font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper sm:min-w-36"
                        >
                            <span
                                className="size-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: seasonFourTeams[team].color }}
                            />
                            {seasonFourTeams[team].name}
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>

                {teamIds.map((team) => (
                    <Tabs.Content
                        key={team}
                        value={team}
                        className="min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
                        aria-label={`${seasonFourTeams[team].name} ${title.toLowerCase()}`}
                    >
                        <HistoryList
                            emptyLabel={emptyLabel}
                            items={histories[team]}
                            renderItem={renderItem}
                        />
                    </Tabs.Content>
                ))}
            </Tabs.Root>
        </section>
    );
}
