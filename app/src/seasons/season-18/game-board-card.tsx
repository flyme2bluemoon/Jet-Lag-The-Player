"use client";

import type MapLibreGL from "maplibre-gl";
import { useEffect, useId, useMemo, useState } from "react";
import { Check, Hexagon, LockKeyhole, Star } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Map,
    MapGeoJSON,
    useMap,
    type MapFillColor,
    type MapFillOpacity,
    type MapLineColor,
} from "@/components/ui/map";
import {
    MAPLIBRE_COLORS,
    MAPLIBRE_SCOREBOARD_COLORS,
} from "@/components/ui/map-colors";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEpisodeLabel, formatTimestamp } from "@/lib/timestamps";
import {
    getGameBoardState,
    seasonEighteenCards,
    type BoardRegion,
    type Claim,
    type GameBoardState,
    type GameCard,
    type PrivateCardSlot,
    type TeamScore,
} from "./game-data";
import {
    seasonEighteenTeamIds,
    seasonEighteenTeams,
    type TeamId,
} from "./team-data";

const US_STATES_GEOJSON = "/geojson/us-states.geojson";
const CANADA_GEOJSON = "/geojson/canada.geojson";
const PUBLIC_HAND_SIZE = 6;
const PRIVATE_OVERLAP_PATTERN_ID = "season-eighteen-private-overlap";
const TRANSPARENT_PATTERN_ID = "season-eighteen-transparent";
const FINAL_SCORE_REVEALED_AT = 42 * 60 + 43;
const AREA_TIEBREAK_WINNER: TeamId = "sam-amy";

type GameBoardCardProps = {
    episodeSlug: string;
    currentTime: number;
};

type RegionStatus =
    | { kind: "claimed"; team: TeamId }
    | { kind: "private"; team: TeamId }
    | { kind: "public" }
    | { kind: "striped" };

type StateOutlinePaths = Partial<Record<BoardRegion, string>>;
type MapFillPattern = NonNullable<
    NonNullable<MapLibreGL.FillLayerSpecification["paint"]>["fill-pattern"]
>;

export function GameBoardCard({
    episodeSlug,
    currentTime,
}: GameBoardCardProps) {
    const titleId = useId();
    const game = useMemo(
        () => getGameBoardState(episodeSlug, currentTime),
        [currentTime, episodeSlug],
    );
    const stateOutlinePaths = useStateOutlinePaths();

    return (
        <section
            className="border-paper/25 bg-panel @container flex min-h-0 w-full flex-col overflow-hidden rounded-lg border"
            aria-labelledby={titleId}
        >
            <header className="border-paper/20 border-b p-6">
                <h2
                    id={titleId}
                    className="font-heading text-3xl leading-none font-bold tracking-tight uppercase"
                >
                    Game Board
                </h2>
            </header>

            <div className="bg-map-canvas relative h-72 min-h-72 overflow-hidden">
                <Map
                    blank
                    center={[-116, 48]}
                    zoom={1.55}
                    minZoom={1.25}
                    maxZoom={5}
                    attributionControl={false}
                    dragRotate={false}
                    touchPitch={false}
                >
                    <GameBoardMapLayers game={game} />
                </Map>
            </div>

            <Scoreboard
                scores={game.scores}
                showFinalScore={
                    episodeSlug === "finale"
                    && currentTime >= FINAL_SCORE_REVEALED_AT
                }
                showAreaTiebreak={
                    episodeSlug === "finale"
                    || (episodeSlug === "episode-5" && currentTime >= 29)
                }
            />
            <ClaimPanels claims={game.activeClaims} />
            <ClaimedStates game={game} />
            <Hands game={game} stateOutlinePaths={stateOutlinePaths} />
        </section>
    );
}

function GameBoardMapLayers({ game }: { game: GameBoardState }) {
    const { isLoaded, map, resolvedTheme } = useMap();
    const colors = MAPLIBRE_SCOREBOARD_COLORS[resolvedTheme];
    const statuses = useMemo(() => getRegionStatuses(game), [game]);
    const stripedRegions = useMemo(
        () => [...statuses]
            .filter(([, status]) => status.kind === "striped")
            .map(([region]) => region),
        [statuses],
    );
    const stripeFillPattern = useMemo(() => [
        "case",
        ["in", ["get", "name"], ["literal", stripedRegions]],
        PRIVATE_OVERLAP_PATTERN_ID,
        TRANSPARENT_PATTERN_ID,
    ] as MapFillPattern, [stripedRegions]);

    useEffect(() => {
        if (!isLoaded || !map) return;

        if (!map.hasImage(PRIVATE_OVERLAP_PATTERN_ID)) {
            map.addImage(
                PRIVATE_OVERLAP_PATTERN_ID,
                createStripePatternImage(),
                { pixelRatio: 2 },
            );
        }
        if (!map.hasImage(TRANSPARENT_PATTERN_ID)) {
            map.addImage(
                TRANSPARENT_PATTERN_ID,
                createTransparentPatternImage(),
                { pixelRatio: 2 },
            );
        }
    }, [isLoaded, map]);

    const fillColor = useMemo(() => {
        const expression: unknown[] = [
            "match",
            ["get", "name"],
            "Puerto Rico",
            MAPLIBRE_COLORS.transparent,
        ];

        for (const [region, status] of statuses) {
            if (region === "Canada") continue;
            expression.push(
                region,
                getStatusColor(status),
            );
        }
        expression.push(colors.unclaimedRegion);
        return expression as MapFillColor;
    }, [colors.unclaimedRegion, statuses]);
    const fillOpacity = useMemo(() => {
        const expression: unknown[] = [
            "match",
            ["get", "name"],
            "Puerto Rico",
            0,
        ];

        for (const [region, status] of statuses) {
            if (region === "Canada") continue;
            expression.push(region, getStatusOpacity(status));
        }
        expression.push(0.96);
        return expression as MapFillOpacity;
    }, [statuses]);
    const stateLineColor = [
        "case",
        ["==", ["get", "name"], "Puerto Rico"],
        MAPLIBRE_COLORS.transparent,
        colors.line,
    ] as MapLineColor;
    const canadaStatus = statuses.get("Canada");

    return (
        <>
            <MapGeoJSON
                id="season-eighteen-canada"
                data={CANADA_GEOJSON}
                fillPaint={{
                    "fill-color": canadaStatus
                        ? getStatusColor(canadaStatus)
                        : colors.unavailableRegion,
                    "fill-opacity": canadaStatus
                        ? getStatusOpacity(canadaStatus)
                        : 1,
                }}
                linePaint={canadaStatus
                    ? {
                        "line-color": colors.line,
                        "line-width": 1,
                    }
                    : false}
            />
            <MapGeoJSON
                id="season-eighteen-states"
                data={US_STATES_GEOJSON}
                fillPaint={{
                    "fill-color": fillColor,
                    "fill-opacity": fillOpacity,
                }}
                linePaint={{ "line-color": stateLineColor, "line-width": 1 }}
            />
            <MapGeoJSON
                id="season-eighteen-private-overlap"
                data={US_STATES_GEOJSON}
                fillPaint={{
                    "fill-pattern": stripeFillPattern,
                    "fill-opacity": 0.96,
                }}
                linePaint={false}
            />
        </>
    );
}

function createStripePatternImage() {
    const size = 24;
    const stripeWidth = 6;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to create team stripe pattern.");

    for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
            const stripe = Math.floor((x + y) / stripeWidth) % 2;
            context.fillStyle = stripe === 0
                ? MAPLIBRE_COLORS.jetLagRed
                : MAPLIBRE_COLORS.jetLagYellow;
            context.fillRect(x, y, 1, 1);
        }
    }

    return context.getImageData(0, 0, size, size);
}

function createTransparentPatternImage() {
    return new ImageData(new Uint8ClampedArray(4), 1, 1);
}

function getRegionStatuses(game: GameBoardState) {
    const statuses = new globalThis.Map<BoardRegion, RegionStatus>();
    const privateCoverage = new globalThis.Map<BoardRegion, Set<TeamId>>();

    // Public cards override single-team private coverage. Shared private
    // coverage stays striped, while completed claims override either state.
    for (const team of seasonEighteenTeamIds) {
        for (const card of game.cardsByLocation[team]) {
            for (const region of card.targets) {
                const teams = privateCoverage.get(region) ?? new Set<TeamId>();
                teams.add(team);
                privateCoverage.set(region, teams);
            }
        }
    }

    for (const [region, teams] of privateCoverage) {
        const [team] = teams;
        statuses.set(
            region,
            teams.size > 1
                ? { kind: "striped" }
                : { kind: "private", team },
        );
    }

    for (const card of game.cardsByLocation.public) {
        for (const region of card.targets) {
            if (statuses.get(region)?.kind !== "striped") {
                statuses.set(region, { kind: "public" });
            }
        }
    }
    for (const [region, claim] of game.claims) {
        statuses.set(region, { kind: "claimed", team: claim.team });
    }

    return statuses;
}

function getStatusColor(status: RegionStatus) {
    return status.kind === "striped"
        ? MAPLIBRE_COLORS.jetLagRed
        : status.kind === "public"
        ? MAPLIBRE_COLORS.jetLagBlue
        : seasonEighteenTeams[status.team].mapColor;
}

function getStatusOpacity(status: RegionStatus) {
    return status.kind === "claimed" || status.kind === "striped"
        ? 0.96
        : 0.3;
}

function Scoreboard({
    scores,
    showFinalScore,
    showAreaTiebreak,
}: {
    scores: Record<TeamId, TeamScore>;
    showFinalScore: boolean;
    showAreaTiebreak: boolean;
}) {
    const [leftTeam, rightTeam] = seasonEighteenTeamIds;
    const areaLeader = showAreaTiebreak ? AREA_TIEBREAK_WINNER : null;
    const ariaLabel = seasonEighteenTeamIds
        .map((team) => {
            const score = scores[team];
            return `${seasonEighteenTeams[team].name}: score ${score.score}, ${score.statesClaimed} states claimed`;
        })
        .join("; ");

    return (
        <section
            className="border-paper/20 relative border-t px-5 py-5 sm:px-8 sm:py-6"
            style={{
                backgroundImage: `linear-gradient(to right, color-mix(in srgb, ${seasonEighteenTeams[leftTeam].color} 14%, transparent), color-mix(in srgb, ${seasonEighteenTeams[leftTeam].color} 4%, transparent) 42%, transparent 62%), linear-gradient(to left, color-mix(in srgb, ${seasonEighteenTeams[rightTeam].color} 14%, transparent), color-mix(in srgb, ${seasonEighteenTeams[rightTeam].color} 4%, transparent) 42%, transparent 62%)`,
            }}
            aria-label={`Connected-state scores. ${ariaLabel}.${areaLeader ? ` ${seasonEighteenTeams[areaLeader].name} leads the area tiebreak.` : ""}`}
        >
            {showFinalScore && (
                <div className="mb-4 flex justify-center">
                    <span className="border-jet-lag-yellow/50 bg-jet-lag-yellow/10 text-jet-lag-yellow rounded-full border px-3 py-1 font-display text-xs leading-none font-bold uppercase">
                        Final
                    </span>
                </div>
            )}
            <div className="grid grid-cols-[minmax(0,1fr)_9rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_11rem_minmax(0,1fr)] sm:gap-5">
                <div className="min-w-0">
                    <div
                        className={areaLeader === leftTeam
                            ? "mb-2 flex h-6 items-center"
                            : "hidden"}
                    >
                        <AreaTiebreakBadge />
                    </div>
                    <div
                        className="flex min-w-0 items-center gap-2 font-display text-sm leading-none font-bold uppercase"
                        style={{ color: seasonEighteenTeams[leftTeam].color }}
                    >
                        <span
                            className="size-3 shrink-0"
                            style={{ backgroundColor: seasonEighteenTeams[leftTeam].color }}
                            aria-hidden="true"
                        />
                        <span className="truncate">{seasonEighteenTeams[leftTeam].name}</span>
                    </div>
                    <p className="text-card-meta mt-2 font-sans text-3xs tracking-wider uppercase sm:text-xs">
                        States claimed{" "}
                        <span className="text-paper font-bold tabular-nums">
                            {scores[leftTeam].statesClaimed}
                        </span>
                    </p>
                </div>

                <div className="relative text-center">
                    <div className="text-card-meta font-heading text-xs leading-none font-bold tracking-wider uppercase">
                        Score
                    </div>
                    <div className="mt-1 grid grid-cols-2">
                        {seasonEighteenTeamIds.map((team) => (
                            <span
                                key={team}
                                className="font-display text-4xl leading-none font-bold tabular-nums sm:text-5xl"
                            >
                                {scores[team].score}
                            </span>
                        ))}
                    </div>
                    <span
                        className="bg-paper/25 absolute top-5 bottom-0 left-1/2 w-px -translate-x-1/2"
                        aria-hidden="true"
                    />
                </div>

                <div className="min-w-0 text-right">
                    <div
                        className={areaLeader === rightTeam
                            ? "mb-2 flex h-6 items-center justify-end"
                            : "hidden"}
                    >
                        <AreaTiebreakBadge />
                    </div>
                    <div
                        className="flex min-w-0 items-center justify-end gap-2 font-display text-sm leading-none font-bold uppercase"
                        style={{ color: seasonEighteenTeams[rightTeam].color }}
                    >
                        <span className="truncate">{seasonEighteenTeams[rightTeam].name}</span>
                        <span
                            className="size-3 shrink-0"
                            style={{ backgroundColor: seasonEighteenTeams[rightTeam].color }}
                            aria-hidden="true"
                        />
                    </div>
                    <p className="text-card-meta mt-2 font-sans text-3xs tracking-wider uppercase sm:text-xs">
                        States claimed{" "}
                        <span className="text-paper font-bold tabular-nums">
                            {scores[rightTeam].statesClaimed}
                        </span>
                    </p>
                </div>
            </div>
        </section>
    );
}

function AreaTiebreakBadge() {
    return (
        <span className="border-paper/25 bg-paper/10 text-paper inline-flex shrink-0 items-center rounded-md border px-2 py-1 font-display text-3xs leading-none font-bold tracking-wide uppercase">
            Larger Claimed Area
        </span>
    );
}

function ClaimPanels({ claims }: { claims: Claim[] }) {
    return (
        <section
            className="border-paper/20 grid items-start gap-3 border-t px-5 py-4 sm:grid-cols-2 sm:px-8 sm:py-5 lg:px-5"
            aria-label="Current claim attempts"
        >
            {seasonEighteenTeamIds.map((team) => (
                <ClaimPanel
                    key={team}
                    claim={claims.find((claim) => claim.team === team)}
                    team={team}
                />
            ))}
        </section>
    );
}

function ClaimPanel({ claim, team }: { claim?: Claim; team: TeamId }) {
    const teamDetails = seasonEighteenTeams[team];
    const card = claim ? getGameCard(claim.card) : undefined;

    if (!claim || !card) {
        return (
            <article
                className="border-paper/20 bg-paper/4 flex min-h-28 items-center justify-between gap-4 rounded-lg border px-5 py-4"
                aria-label={`${teamDetails.name}: no claim in progress`}
            >
                <p className="text-card-meta font-display text-lg leading-none font-bold uppercase">
                    No claim in progress
                </p>
                <Hexagon
                    className="text-card-meta size-10 shrink-0"
                    strokeWidth={1.75}
                    aria-hidden="true"
                />
            </article>
        );
    }

    return (
        <Collapsible
            key={claim.id}
            className="border-paper/20 bg-paper/4 rounded-lg border"
            style={{
                borderColor: `color-mix(in srgb, ${teamDetails.color} 55%, transparent)`,
            }}
        >
            <CollapsibleTrigger
                className="flex min-h-28 w-full items-center justify-between gap-4 rounded-lg px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
                aria-label={`${teamDetails.name} claiming ${card.name}: ${card.title ?? card.name}. Show challenge description`}
            >
                <div className="min-w-0">
                    <p className="border-paper/20 bg-paper/5 text-card-meta mb-2 inline-flex rounded-md border px-2.5 py-1 font-display text-xs leading-none font-bold uppercase">
                        {card.name}
                    </p>
                    <p className="font-heading text-lg leading-tight font-bold tracking-tight uppercase">
                        {card.title ?? "Challenge in progress"}
                    </p>
                </div>
                <Hexagon
                    className="size-10 shrink-0"
                    style={{ color: teamDetails.color }}
                    strokeWidth={1.75}
                    aria-hidden="true"
                />
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-closed:animate-collapsible-up data-open:animate-collapsible-down">
                <p className="border-paper/10 text-card-meta border-t px-5 py-4 font-sans text-xs leading-relaxed">
                    {card.description}
                </p>
            </CollapsibleContent>
        </Collapsible>
    );
}

function ClaimedStates({ game }: { game: GameBoardState }) {
    const claims = [...game.claims.values()];

    return (
        <section
            className="border-paper/20 grid border-t sm:grid-cols-2"
            aria-label="Claimed states"
        >
            {seasonEighteenTeamIds.map((team, index) => {
                const teamDetails = seasonEighteenTeams[team];
                const teamClaims = claims.filter((claim) => claim.team === team);
                const connectedStateSet = new Set(game.scores[team].connectedStates);

                return (
                    <article
                        key={team}
                        aria-label={`${teamDetails.name} states claimed`}
                        className={index === 0
                            ? "border-paper/20 border-b sm:border-r sm:border-b-0"
                            : undefined}
                    >
                        <h3
                            className="border-paper/20 text-paper border-b px-5 py-3 font-heading text-base leading-none font-bold uppercase sm:px-6"
                            style={{
                                backgroundColor: `color-mix(in srgb, ${teamDetails.color} 7%, transparent)`,
                            }}
                        >
                            States claimed
                        </h3>

                        <div className="px-5 py-4 sm:px-6 sm:py-5">
                            {teamClaims.length ? (
                                <Accordion
                                    type="single"
                                    collapsible
                                    className="text-card-meta text-xs leading-tight"
                                >
                                    {teamClaims.map((claim) => {
                                        const card = getGameCard(claim.card);
                                        const isConnected = connectedStateSet.has(claim.state);

                                        return (
                                            <AccordionItem
                                                key={claim.state}
                                                value={`${team}:${claim.state}`}
                                                className="border-paper/10"
                                            >
                                                <AccordionTrigger className="gap-3 rounded-none text-xs font-normal hover:text-paper hover:no-underline focus-visible:border-paper focus-visible:ring-paper/30">
                                                    <span className="flex min-w-0 flex-1 items-center gap-2 pr-1">
                                                        <span>{claim.state}</span>
                                                        {isConnected && (
                                                            <LargestGroupBadge team={team} />
                                                        )}
                                                    </span>
                                                </AccordionTrigger>
                                                <AccordionContent className="pb-3">
                                                    <dl className="border-paper/10 bg-paper/2.5 rounded-md border px-3.5 py-3">
                                                        <dt className="text-card-meta mb-1 font-heading text-xs leading-none font-bold uppercase">
                                                            Challenge
                                                        </dt>
                                                        <dd className="text-paper font-sans text-xs leading-snug font-semibold">
                                                            {card.title ?? card.name}
                                                        </dd>
                                                        <dd className="text-card-meta mt-1.5 font-sans text-3xs tracking-wider">
                                                            {formatEpisodeLabel(claim.episode)} · {formatTimestamp(claim.claimedAt)}
                                                        </dd>
                                                    </dl>
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                            ) : (
                                <p className="text-card-meta flex min-h-9 items-center font-display text-sm leading-none font-bold uppercase">
                                    No states yet
                                </p>
                            )}
                        </div>
                    </article>
                );
            })}
        </section>
    );
}

function LargestGroupBadge({ team }: { team: TeamId }) {
    const teamDetails = seasonEighteenTeams[team];
    const checkColor = team === "sam-amy"
        ? "var(--color-jet-lag-navy-blue)"
        : "var(--color-challenge-card-paper)";

    return (
        <span
            className="relative size-5 shrink-0"
            aria-label="In largest connected group"
            title="In largest connected group"
        >
            <Hexagon
                className="absolute inset-0 size-full fill-current"
                style={{ color: teamDetails.color }}
                strokeWidth={1.5}
                aria-hidden="true"
            />
            <Check
                className="absolute inset-0 m-auto size-3"
                style={{ color: checkColor }}
                strokeWidth={3}
                aria-hidden="true"
            />
        </span>
    );
}

function Hands({
    game,
    stateOutlinePaths,
}: {
    game: GameBoardState;
    stateOutlinePaths: StateOutlinePaths;
}) {
    return (
        <section className="border-paper/20 border-t" aria-label="Card hands">
            <div className="px-5 py-4 sm:px-8 sm:py-5 lg:px-5">
                <PublicHand
                    cards={game.cardsByLocation.public}
                    stateOutlinePaths={stateOutlinePaths}
                />
            </div>

            <div className="grid @3xl:grid-cols-2">
                {seasonEighteenTeamIds.map((team, index) => (
                    <PrivateHand
                        key={team}
                        showColumnDivider={index === 0}
                        slots={game.privateSlots[team]}
                        stateOutlinePaths={stateOutlinePaths}
                        team={team}
                    />
                ))}
            </div>
        </section>
    );
}

function PublicHand({
    cards,
    stateOutlinePaths,
}: {
    cards: GameCard[];
    stateOutlinePaths: StateOutlinePaths;
}) {
    const visibleCards = cards.slice(0, PUBLIC_HAND_SIZE);
    const emptySlots = PUBLIC_HAND_SIZE - visibleCards.length;

    return (
        <ol aria-label="Public hand" className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {visibleCards.map((card) => (
                <li key={card.id}>
                    <GameCardArtwork
                        card={card}
                        stateOutlinePaths={stateOutlinePaths}
                    />
                </li>
            ))}
            {Array.from({ length: emptySlots }, (_, index) => (
                <li key={`empty-public-${index}`}>
                    <PublicCardSkeleton />
                </li>
            ))}
        </ol>
    );
}

function PrivateHand({
    slots,
    stateOutlinePaths,
    team,
    showColumnDivider,
}: {
    showColumnDivider: boolean;
    slots: PrivateCardSlot[];
    stateOutlinePaths: StateOutlinePaths;
    team: TeamId;
}) {
    const teamDetails = seasonEighteenTeams[team];

    return (
        <div className={`border-paper/15 border-t px-5 py-4 sm:px-8 sm:py-5 lg:px-5 ${showColumnDivider ? "@3xl:border-r" : ""}`}>
            <h3
                className="mb-3 flex items-center gap-2 font-heading text-sm leading-none font-bold uppercase"
                style={{ color: teamDetails.color }}
            >
                <LockKeyhole className="size-3.5" aria-hidden="true" />
                {teamDetails.name} Private Hand
            </h3>
            <ol className="grid grid-cols-5 gap-2">
                {slots.map((slot) => (
                    <li key={slot.day}>
                        {slot.card ? (
                            <GameCardArtwork
                                card={slot.card}
                                compact
                                day={slot.day}
                                muted={slot.used}
                                stateOutlinePaths={stateOutlinePaths}
                            />
                        ) : (
                            <PrivateCardSkeleton day={slot.day} />
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
}

function GameCardArtwork({
    card,
    compact = false,
    day,
    muted = false,
    stateOutlinePaths,
}: {
    card: GameCard;
    compact?: boolean;
    day?: number;
    muted?: boolean;
    stateOutlinePaths: StateOutlinePaths;
}) {
    const outlinePath = stateOutlinePaths[card.targets[0]];

    return (
        <article
            className={`border-jet-lag-navy-blue/30 bg-challenge-card-paper text-jet-lag-navy-blue dark:border-paper/20 dark:bg-surface dark:text-paper flex min-h-32 flex-col items-center justify-between rounded-md border px-2 py-2.5 text-center shadow-sm ${muted ? "opacity-35 grayscale" : ""}`}
            aria-label={`${day ? `Day ${day}: ` : ""}${card.name}${muted ? ", used" : ""}`}
        >
            {day ? (
                <span className="self-start font-display text-3xs leading-none font-bold uppercase opacity-60">
                    Day {day}
                </span>
            ) : (
                <span aria-hidden="true" />
            )}

            {card.wildcard ? (
                <Star className="size-12 fill-current" strokeWidth={1.5} aria-hidden="true" />
            ) : outlinePath ? (
                <svg
                    className="h-14 w-full"
                    viewBox="0 0 100 64"
                    role="img"
                    aria-label={`${card.name} outline`}
                >
                    <path d={outlinePath} fill="currentColor" />
                </svg>
            ) : (
                <Skeleton className="h-12 w-4/5 bg-jet-lag-navy-blue/15 dark:bg-paper/15" aria-hidden="true" />
            )}

            <span
                className={`max-w-full font-heading leading-tight font-bold tracking-tight uppercase ${compact ? "text-xs sm:text-sm" : "text-xs @4xl:text-sm"}`}
            >
                {compact ? (
                    card.label
                ) : (
                    <>
                        <span className="@xl:hidden">{card.label}</span>
                        <span className="hidden @xl:inline">{card.name}</span>
                    </>
                )}
            </span>
        </article>
    );
}

function PublicCardSkeleton() {
    return (
        <div
            className="border-paper/10 bg-paper/4 flex min-h-32 flex-col justify-between rounded-md border p-2.5"
            role="status"
            aria-label="Empty public card slot"
        >
            <Skeleton className="mx-auto mt-4 h-12 w-4/5 bg-paper/10" />
            <Skeleton className="mx-auto h-3 w-3/5 bg-paper/10" />
        </div>
    );
}

function PrivateCardSkeleton({ day }: { day: number }) {
    return (
        <div
            className="border-paper/10 bg-paper/4 text-card-meta grid min-h-32 place-items-center rounded-md border font-display text-sm leading-none font-bold uppercase"
            role="status"
            aria-label={`Day ${day} private card not yet revealed`}
        >
            Day {day}
        </div>
    );
}

function getGameCard(cardKey: Claim["card"]): GameCard {
    return seasonEighteenCards[cardKey];
}

function useStateOutlinePaths() {
    const [paths, setPaths] = useState<StateOutlinePaths>({});

    useEffect(() => {
        let cancelled = false;

        async function loadOutlines() {
            try {
                const response = await fetch(US_STATES_GEOJSON);
                if (!response.ok) return;
                const geojson = await response.json() as OutlineGeoJSON;
                const nextPaths: StateOutlinePaths = {};

                for (const feature of geojson.features) {
                    const name = feature.properties.name as BoardRegion;
                    if (name in regionCardNames) {
                        nextPaths[name] = geometryToSvgPath(feature.geometry);
                    }
                }

                if (!cancelled) setPaths(nextPaths);
            } catch {
                if (!cancelled) setPaths({});
            }
        }

        void loadOutlines();
        return () => {
            cancelled = true;
        };
    }, []);

    return paths;
}

type Position = [number, number];
type PolygonCoordinates = Position[][];
type OutlineGeometry =
    | { type: "Polygon"; coordinates: PolygonCoordinates }
    | { type: "MultiPolygon"; coordinates: PolygonCoordinates[] };
type OutlineGeoJSON = {
    features: Array<{
        properties: { name: string };
        geometry: OutlineGeometry;
    }>;
};

const regionCardNames = Object.fromEntries(
    Object.values(seasonEighteenCards)
        .flatMap((card) => card.targets)
        .filter((region) => region !== "Canada")
        .map((region) => [region, true]),
) as Partial<Record<BoardRegion, boolean>>;

function geometryToSvgPath(geometry: OutlineGeometry) {
    const polygons = geometry.type === "Polygon"
        ? [geometry.coordinates]
        : geometry.coordinates;
    const projectedPositions = polygons
        .flatMap((polygon) => polygon.flat())
        .map(projectPosition);
    const xCoordinates = projectedPositions.map(([x]) => x);
    const yCoordinates = projectedPositions.map(([, y]) => y);
    const minX = Math.min(...xCoordinates);
    const maxX = Math.max(...xCoordinates);
    const minY = Math.min(...yCoordinates);
    const maxY = Math.max(...yCoordinates);
    const width = Math.max(maxX - minX, 0.001);
    const height = Math.max(maxY - minY, 0.001);
    const scale = Math.min(88 / width, 54 / height);
    const offsetX = (100 - width * scale) / 2;
    const offsetY = (64 - height * scale) / 2;

    return polygons.map((polygon) => polygon.map((ring) => {
        const points = ring.map((position) => {
            const [projectedX, projectedY] = projectPosition(position);
            const x = offsetX + (projectedX - minX) * scale;
            const y = offsetY + (maxY - projectedY) * scale;
            return `${x.toFixed(2)} ${y.toFixed(2)}`;
        });
        return `M ${points.join(" L ")} Z`;
    }).join(" ")).join(" ");
}

function projectPosition([longitude, latitude]: Position): Position {
    const longitudeRadians = longitude * Math.PI / 180;
    const latitudeRadians = latitude * Math.PI / 180;

    return [
        longitudeRadians,
        Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2)),
    ];
}
