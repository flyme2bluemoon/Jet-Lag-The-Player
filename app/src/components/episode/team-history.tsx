"use client";

import { Tabs } from "radix-ui";
import {
    type ReactNode,
    useEffect,
    useEffectEvent,
    useId,
    useRef,
    useState,
} from "react";

const HISTORY_ENTRY_ANIMATION_MS = 320;

type HistoryItem = {
    id: string;
};

export type LedgerTeam = {
    name: string;
    color: string;
};

type TeamHistoryProps<TeamId extends string, Item extends HistoryItem> = {
    emptyLabel: string;
    histories: Record<TeamId, Item[]>;
    renderItem: (item: Item, team: TeamId) => ReactNode;
    teamIds: readonly TeamId[];
    teams: Record<TeamId, LedgerTeam>;
    title: string;
};

type HistoryViewProps<TeamId extends string, Item extends HistoryItem> = Pick<
    TeamHistoryProps<TeamId, Item>,
    "emptyLabel" | "histories" | "renderItem" | "teamIds" | "teams"
>;

type MobileHistoryProps<TeamId extends string, Item extends HistoryItem> =
    HistoryViewProps<TeamId, Item> & {
        title: string;
    };

function HistoryList<TeamId extends string, Item extends HistoryItem>({
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
    const itemIds = items.map((item) => item.id);
    const itemIdsKey = itemIds.join("\u0000");
    const getItemIds = useEffectEvent(() => itemIds);
    const previousItemIdsRef = useRef(new Set(itemIds));
    const animationTimeoutsRef = useRef(new Map<string, number>());
    const [animatingItemIds, setAnimatingItemIds] = useState<Set<string>>(
        () => new Set(),
    );

    useEffect(() => {
        const currentItemIds = getItemIds();
        const nextItemIds = new Set(currentItemIds);
        const newItemIds = currentItemIds.filter(
            (itemId) => !previousItemIdsRef.current.has(itemId),
        );
        previousItemIdsRef.current = nextItemIds;

        if (newItemIds.length === 0) return;

        setAnimatingItemIds((currentIds) => new Set([
            ...currentIds,
            ...newItemIds,
        ]));

        newItemIds.forEach((itemId) => {
            const existingTimeout = animationTimeoutsRef.current.get(itemId);
            if (existingTimeout !== undefined) {
                window.clearTimeout(existingTimeout);
            }

            const timeout = window.setTimeout(() => {
                animationTimeoutsRef.current.delete(itemId);
                setAnimatingItemIds((currentIds) => {
                    const nextIds = new Set(currentIds);
                    nextIds.delete(itemId);
                    return nextIds;
                });
            }, HISTORY_ENTRY_ANIMATION_MS);

            animationTimeoutsRef.current.set(itemId, timeout);
        });
    }, [itemIdsKey]);

    useEffect(() => () => {
        animationTimeoutsRef.current.forEach((timeout) => {
            window.clearTimeout(timeout);
        });
    }, []);

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
                <HistoryRow
                    key={item.id}
                    animate={animatingItemIds.has(item.id)}
                >
                    {renderItem(item, team)}
                </HistoryRow>
            ))}
        </ol>
    );
}

function HistoryRow({
    animate,
    children,
}: {
    animate: boolean;
    children: ReactNode;
}) {
    return (
        <li className={animate ? "ledger-history-entry--new grid" : "grid"}>
            <div className="min-h-0 overflow-hidden">
                <div className="border-paper/10 grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b px-5 py-2.5 sm:px-6">
                    {children}
                </div>
            </div>
        </li>
    );
}

function DesktopHistory<TeamId extends string, Item extends HistoryItem>({
    emptyLabel,
    histories,
    renderItem,
    teamIds,
    teams,
}: HistoryViewProps<TeamId, Item>) {
    return (
        <div
            className="border-paper/20 hidden border-t @min-[44rem]:grid"
            style={{ gridTemplateColumns: `repeat(${teamIds.length}, minmax(0, 1fr))` }}
        >
            {teamIds.map((team, index) => (
                <div
                    key={team}
                    className={`max-h-88 min-w-0 overflow-y-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper ${index < teamIds.length - 1 ? "border-paper/20 border-r" : ""}`}
                    aria-label={`${teams[team].name} history`}
                    tabIndex={0}
                >
                    <h4
                        className="border-paper/20 bg-panel sticky top-0 z-10 flex items-center gap-2.5 border-b px-5 py-3 font-heading text-base leading-none font-bold uppercase sm:px-6"
                        style={{
                            backgroundImage: `linear-gradient(color-mix(in srgb, ${teams[team].color} 7%, transparent), color-mix(in srgb, ${teams[team].color} 7%, transparent))`,
                            color: teams[team].color,
                        }}
                    >
                        <span
                            className="size-2.5 shrink-0"
                            style={{ backgroundColor: teams[team].color }}
                            aria-hidden="true"
                        />
                        {teams[team].name}
                    </h4>
                    <HistoryList
                        emptyLabel={emptyLabel}
                        items={histories[team]}
                        label={`${teams[team].name} history`}
                        renderItem={renderItem}
                        team={team}
                    />
                </div>
            ))}
        </div>
    );
}

function MobileHistory<TeamId extends string, Item extends HistoryItem>({
    emptyLabel,
    histories,
    renderItem,
    teamIds,
    teams,
    title,
}: MobileHistoryProps<TeamId, Item>) {
    const historyLabel = title.toLowerCase();

    return (
        <Tabs.Root
            className="border-paper/20 border-t @min-[44rem]:hidden"
            defaultValue={teamIds[0]}
        >
            <Tabs.List
                className="border-paper/20 bg-panel sticky top-0 z-10 grid border-b"
                style={{ gridTemplateColumns: `repeat(${teamIds.length}, minmax(0, 1fr))` }}
                aria-label={`Choose a team for ${historyLabel}`}
            >
                {teamIds.map((team) => (
                    <Tabs.Trigger
                        key={team}
                        value={team}
                        className="bg-paper/8 text-card-meta hover:text-paper data-[state=active]:bg-panel data-[state=active]:text-paper dark:bg-transparent dark:data-[state=active]:bg-paper/8 flex min-w-0 items-center justify-center gap-2 px-4 py-3 font-heading text-base leading-none font-bold uppercase whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper"
                    >
                        <span
                            className="size-2.5 shrink-0"
                            style={{ backgroundColor: teams[team].color }}
                        />
                        {teams[team].name}
                    </Tabs.Trigger>
                ))}
            </Tabs.List>

            {teamIds.map((team) => (
                <Tabs.Content
                    key={team}
                    value={team}
                    forceMount
                    className="max-h-88 min-w-0 overflow-y-auto data-[state=inactive]:hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper"
                    aria-label={`${teams[team].name} ${historyLabel}`}
                    tabIndex={0}
                >
                    <HistoryList
                        emptyLabel={emptyLabel}
                        items={histories[team]}
                        label={`${teams[team].name} ${historyLabel}`}
                        renderItem={renderItem}
                        team={team}
                    />
                </Tabs.Content>
            ))}
        </Tabs.Root>
    );
}

export function TeamHistory<TeamId extends string, Item extends HistoryItem>({
    emptyLabel,
    histories,
    renderItem,
    teamIds,
    teams,
    title,
}: TeamHistoryProps<TeamId, Item>) {
    const titleId = useId();
    return (
        <section className="border-paper/20 border-t" aria-labelledby={titleId}>
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
                teamIds={teamIds}
                teams={teams}
            />
            <MobileHistory
                emptyLabel={emptyLabel}
                histories={histories}
                renderItem={renderItem}
                teamIds={teamIds}
                teams={teams}
                title={title}
            />
        </section>
    );
}
