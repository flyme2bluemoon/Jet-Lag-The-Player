"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Hexagon, Lock } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Map,
    MapGeoJSON,
    MapMarker,
    MarkerContent,
    useMap,
    type MapFillColor,
    type MapLineColor,
} from "@/components/ui/map";
import {
    MAPLIBRE_COLORS,
    MAPLIBRE_SCOREBOARD_COLORS,
} from "@/components/ui/map-colors";
import { seasonOne } from "@/data/season-1";
import {
    compareTimestamps,
    formatEpisodeLabel,
    formatTimestamp,
} from "@/lib/timestamps";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getActiveChallenge} from "./challenge-data";
import {
    getStateClaims,
    type StateClaim,
} from "./state-claims";
import { seasonOneTeamIds, seasonOneTeams, type TeamId } from "./team-data";

const US_STATES_GEOJSON = "/geojson/us-states.geojson";
const CANADA_GEOJSON = "/geojson/canada.geojson";
const FINAL_SCORE_REVEALED_AT = 1338;


type ClaimsCardProps = {
    episodeSlug: string;
    currentTime: number;
};

function ClaimedStates({ claims, expandedState, onExpandedStateChange, team }: ClaimedStatesProps) {
    return (
        <div>
            <h3
                className="border-paper/20 text-paper border-b px-5 py-3 font-heading text-base leading-none font-bold uppercase sm:px-6"
                style={{ backgroundColor: `color-mix(in srgb, ${seasonOneTeams[team].color} 7%, transparent)` }}
            >
                States claimed
            </h3>
            <div className="px-5 py-4 sm:px-6 sm:py-5">
                {claims.length ? (
                    <Accordion
                        type="single"
                        collapsible
                        value={expandedState ?? ""}
                        onValueChange={(value) => onExpandedStateChange(value || null)}
                        className="text-card-meta text-xs leading-tight"
                    >
                        {claims.map((claim) => {
                            const disclosureId = `${team}:${claim.state}`;

                            return (
                                <StateDisclosure
                                    key={claim.state}
                                    disclosureId={disclosureId}
                                    state={claim.state}
                                >
                                    <DisclosureEvent
                                        episode={claim.episode}
                                        at={claim.at}
                                        title={claim.challenge.title}
                                    />
                                </StateDisclosure>
                            );
                        })}
                    </Accordion>
                ) : (
                    <EmptyDisclosureRow>No states yet</EmptyDisclosureRow>
                )}
            </div>
        </div>
    );
}

export function ClaimsCard({ episodeSlug, currentTime }: ClaimsCardProps) {
    const [expandedState, setExpandedState] = useState<string | null>(null);
    const isFinalScore = isFinalScoreVisible(episodeSlug, currentTime);
    const claims = useMemo(
        () => getStateClaims(episodeSlug, currentTime),
        [currentTime, episodeSlug],
    );
    const statesByTeam = useMemo(() => {
        const result: Record<TeamId, StateClaim[]> = { "sam-brian": [], "ben-adam": [] };
        for (const claim of claims.values()) result[claim.team].push(claim);
        result["sam-brian"].sort(compareClaims);
        result["ben-adam"].sort(compareClaims);
        return result;
    }, [claims]);

    return (
        <section className="border-paper/25 bg-panel @container flex min-h-0 w-full flex-col overflow-hidden rounded-lg border" aria-labelledby="claims-title">
            <header className="border-paper/20 border-b p-6">
                <h2 id="claims-title" className="font-heading text-3xl leading-none font-bold tracking-tight uppercase">Scoreboard</h2>
            </header>
            <div className="bg-map-canvas relative h-64 min-h-64 overflow-hidden">
                <Map
                    blank
                    center={[-105, 39]}
                    zoom={2.5}
                    minZoom={1.25}
                    maxZoom={5}
                    attributionControl={false}
                    dragRotate={false}
                    touchPitch={false}
                >
                    <ScoreboardMapLayers claims={claims} />
                </Map>
            </div>
            <div className="border-paper/20 grid flex-1 border-t md:grid-cols-2">
                {seasonOneTeamIds.map((team, index) => (
                    <article
                        key={team}
                        className={`grid min-w-0 md:row-start-1 md:grid-rows-subgrid ${isFinalScore ? "md:row-span-2" : "md:row-span-3"} ${index === 0 ? "border-paper/20 border-b md:border-r md:border-b-0" : ""}`}
                    >
                        {!isFinalScore && (
                            <div className="border-paper/15 border-b p-4 sm:p-5">
                                <ActiveChallenge
                                    episodeSlug={episodeSlug}
                                    currentTime={currentTime}
                                    team={team}
                                />
                            </div>
                        )}

                        <ClaimedStates
                            claims={statesByTeam[team]}
                            expandedState={expandedState}
                            onExpandedStateChange={setExpandedState}
                            team={team}
                        />
                    </article>
                ))}
            </div>
        </section>
    );
}

const HIDDEN_STATES = ["Alaska", "Puerto Rico", "New Hampshire", "Vermont", "Massachusetts", "Rhode Island", "Connecticut", "New Jersey",
     "Delaware", "Maryland", "West Virginia", "Maine", "New York", "Pennsylvania", "Virginia", "North Carolina", "South Carolina",
     "Georgia", "Florida", "Alabama", "Tennesee", "Kentucky", "Ohio", "Michigan", "Indiana", "Tennessee", "Mississippi", "Illinois", "Wisconsin", "Hawaii"
]

function ScoreboardMapLayers({ claims }: { claims: ReadonlyMap<string, StateClaim> }) {
    const { resolvedTheme } = useMap();
    const colors = MAPLIBRE_SCOREBOARD_COLORS[resolvedTheme];
    const fillColor = useMemo(() => {
        const expression: unknown[] = [
            "case",
            ["in", ["get", "name"], ["literal", HIDDEN_STATES]],
            MAPLIBRE_COLORS.transparent,
        ];
        for (const [state, claim] of claims) {
            if (state !== "District of Columbia") expression.push(["==", ["get", "name"], state], seasonOneTeams[claim.team].mapColor);
        }
        expression.push(colors.unclaimedRegion);
        return expression as MapFillColor;
    }, [claims, colors.unclaimedRegion]);
    const stateLineColor = [
        "case",
        ["==", ["get", "name"], "Puerto Rico"],
        MAPLIBRE_COLORS.transparent,
        colors.line,
    ] as MapLineColor;
    const districtClaim = claims.get("District of Columbia");

    return (
        <>
            <MapGeoJSON
                id="season-one-canada"
                data={CANADA_GEOJSON}
                fillPaint={{
                    "fill-color": [
                        "case",
                        ["==", ["get", "ADM0_A3"], "CAN"],
                        MAPLIBRE_COLORS.transparent,
                        MAPLIBRE_COLORS.transparent,
                    ],
                    "fill-opacity": 1,
                }}
                linePaint={false}
            />
            <MapGeoJSON
                id="season-one-states"
                data={US_STATES_GEOJSON}
                fillPaint={{ "fill-color": fillColor, "fill-opacity": 0.96 }}
                linePaint={{ "line-color": stateLineColor, "line-width": 1 }}
            />
            {districtClaim && (
                <MapMarker longitude={-77.0369} latitude={38.9072}>
                    <MarkerContent>
                        <span
                            className="block size-2.5 rounded-full border-2 shadow"
                            style={{
                                backgroundColor: seasonOneTeams[districtClaim.team].color,
                                borderColor: colors.line,
                            }}
                            aria-label="District of Columbia"
                        />
                    </MarkerContent>
                </MapMarker>
            )}
        </>
    );
}

function compareClaims(a: StateClaim, b: StateClaim) {
    return compareTimestamps(seasonOne, a, b);
}

function isFinalScoreVisible(episodeSlug: string, currentTime: number) {
    return compareTimestamps(
        seasonOne,
        { episode: episodeSlug, at: currentTime },
        { episode: "finale", at: FINAL_SCORE_REVEALED_AT },
    ) >= 0;
}

type ClaimedStatesProps = {
    claims: StateClaim[];
    expandedState: string | null;
    onExpandedStateChange: (state: string | null) => void;
    team: TeamId;
};

type StateDisclosureProps = {
    children: ReactNode;
    disclosureId: string;
    locked?: boolean;
    state: string;
};

function StateDisclosure({
    children,
    disclosureId,
    locked = false,
    state,
}: StateDisclosureProps) {
    return (
        <AccordionItem value={disclosureId} className="border-paper/10">
            <AccordionTrigger className="gap-4 rounded-none text-xs font-normal hover:text-paper hover:no-underline focus-visible:border-paper focus-visible:ring-paper/30">
                <span className="flex min-w-0 items-center gap-2">
                    <span>{getStateLabel(state)}</span>
                    {locked && (
                        <Lock
                            className="size-3.5 shrink-0"
                            strokeWidth={2}
                            aria-label="Locked after battle"
                        />
                    )}
                </span>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
                <dl className="border-paper/10 bg-paper/2.5 rounded-md border px-3.5 py-3">
                    {children}
                </dl>
            </AccordionContent>
        </AccordionItem>
    );
}

function DisclosureEvent({
    at,
    episode,
    title,
}: {
    title: string;
    at: number;
    episode: string;
}) {
    return (
        <div>
            {title}
            <dd className="text-card-meta mt-1.5 font-sans text-3xs tracking-wider">
                {formatEpisodeLabel(episode)} · {formatTimestamp(at)}
            </dd>
        </div>
    );
}

function ActiveChallenge({ episodeSlug, currentTime, team }: ClaimsCardProps & { team: TeamId }) {
    const challenge = getActiveChallenge(episodeSlug, currentTime, team);

    if (!challenge) {
        return (
            <div className="border-paper/20 bg-paper/4 flex min-h-16 items-center justify-between gap-4 rounded-lg border px-4 py-3">
                <p className="text-card-meta font-display text-lg leading-none font-bold uppercase">No active challenge</p>
                <Hexagon
                    className="text-card-meta size-8 shrink-0"
                    strokeWidth={1.75}
                    aria-hidden="true"
                />
            </div>
        );
    }

    return (
        <Collapsible
            key={`${challenge.episode}:${challenge.title}`}
            className="border-paper/20 bg-paper/4 rounded-lg border"
            style={{ borderColor: `color-mix(in srgb, ${seasonOneTeams[team].color} 44%, transparent)` }}
        >
            <CollapsibleTrigger className="flex min-h-16 w-full items-center justify-between gap-4 rounded-lg px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper">
                <div className="min-w-0">
                    <p className="font-display text-lg leading-snug font-bold uppercase">
                        {challenge.title}
                    </p>
                </div>
                <span className="shrink-0" style={{ color: seasonOneTeams[team].color }}>
                    <Hexagon className="size-8" strokeWidth={1.75} aria-hidden="true" />
                </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-closed:animate-collapsible-up data-open:animate-collapsible-down">
                <p className="border-paper/10 text-card-meta border-t px-4 py-3 text-xs leading-relaxed">
                    {challenge.description}
                </p>
            </CollapsibleContent>
        </Collapsible>
    );
}

function EmptyDisclosureRow({ children }: { children: ReactNode }) {
    return (
        <p className="text-card-meta flex min-h-9 items-center font-display text-sm leading-none font-bold uppercase">
            {children}
        </p>
    );
}

function getStateLabel(state: string) {
    return state === "District of Columbia" ? "D.C." : state;
}
