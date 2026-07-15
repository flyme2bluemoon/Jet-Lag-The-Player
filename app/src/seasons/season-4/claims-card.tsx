"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Hexagon, Lock } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Map, MapGeoJSON, MapMarker, MarkerContent } from "@/components/ui/map";
import { seasonFour } from "@/data/season-4";
import { compareTimestamps } from "@/lib/timestamps";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    getAreaBonusScores,
    isAreaBonusVisible,
    type AreaBonusScore,
} from "./area-bonus-data";
import { getActiveChallenge, getFailedChallenges } from "./challenge-data";
import { HandDrawer } from "./hand-drawer";
import {
    getPreviousStateClaim,
    getStateClaims,
    type StateClaim,
} from "./state-claims";
import { seasonFourTeamIds, seasonFourTeams, type TeamId } from "./team-data";

const US_STATES_GEOJSON = "/seasons/season-4/geojson/us-states.geojson";
const CANADA_GEOJSON = "/seasons/season-4/geojson/canada.geojson";
const FINAL_SCORE_REVEALED_AT = 40 * 60 + 50;

type ClaimsCardProps = {
    episodeSlug: string;
    currentTime: number;
};

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

    const fillColor = useMemo(() => {
        const expression: unknown[] = [
            "match",
            ["get", "name"],
            "Puerto Rico",
            "rgba(0, 0, 0, 0)",
        ];
        for (const [state, claim] of claims) {
            if (state !== "District of Columbia") expression.push(state, seasonFourTeams[claim.team].color);
        }
        expression.push("#233744");
        return expression as never;
    }, [claims]);

    const stateLineColor = [
        "case",
        ["==", ["get", "name"], "Puerto Rico"],
        "rgba(0, 0, 0, 0)",
        "#071722",
    ] as never;

    return (
        <section className="border-paper/25 bg-panel flex min-h-0 w-full flex-col overflow-hidden rounded-lg border" aria-labelledby="claims-title">
            <header className="border-paper/20 border-b px-6 py-6 sm:px-8 sm:py-7">
                <h2 id="claims-title" className="font-heading text-3xl leading-none font-bold tracking-tight uppercase">Scoreboard</h2>
            </header>
            <div className="bg-map-canvas relative h-64 min-h-64 overflow-hidden">
                <Map
                    blank
                    theme="dark"
                    center={[-116, 48]}
                    zoom={1.55}
                    minZoom={1.25}
                    maxZoom={5}
                    attributionControl={false}
                    dragRotate={false}
                    touchPitch={false}
                >
                    <MapGeoJSON
                        id="season-four-canada"
                        data={CANADA_GEOJSON}
                        fillPaint={{
                            "fill-color": [
                                "case",
                                ["==", ["get", "ADM0_A3"], "CAN"],
                                "#0b1a22",
                                "rgba(0, 0, 0, 0)",
                            ],
                            "fill-opacity": 1,
                        }}
                        linePaint={false}
                    />
                    <MapGeoJSON
                        id="season-four-states"
                        data={US_STATES_GEOJSON}
                        fillPaint={{ "fill-color": fillColor, "fill-opacity": 0.96 }}
                        linePaint={{ "line-color": stateLineColor, "line-width": 1 }}
                    />
                    {claims.get("District of Columbia") && (
                        <MapMarker longitude={-77.0369} latitude={38.9072}>
                            <MarkerContent>
                                <span
                                    className="block size-2.5 rounded-full border-2 border-white shadow"
                                    style={{ backgroundColor: seasonFourTeams[claims.get("District of Columbia")!.team].color }}
                                    aria-label="District of Columbia"
                                />
                            </MarkerContent>
                        </MapMarker>
                    )}
                </Map>
            </div>
            <Score
                episodeSlug={episodeSlug}
                currentTime={currentTime}
                claimsByTeam={statesByTeam}
            />
            <div className="border-paper/20 grid flex-1 border-t md:grid-cols-2">
                {seasonFourTeamIds.map((team, index) => (
                    <article
                        key={team}
                        className={`grid min-w-0 md:row-start-1 md:grid-rows-subgrid ${isFinalScore ? "grid-rows-[auto_auto] md:row-span-2" : "grid-rows-[auto_auto_auto] md:row-span-3"} ${index === 0 ? "border-paper/20 border-b md:border-r md:border-b-0" : ""}`}
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

                        <div className="border-paper/15 border-t">
                            <FailedChallenges
                                episodeSlug={episodeSlug}
                                currentTime={currentTime}
                                expandedState={expandedState}
                                onExpandedStateChange={setExpandedState}
                                team={team}
                            />
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

function compareClaims(a: StateClaim, b: StateClaim) {
    return compareTimestamps(seasonFour, a, b);
}

function Score({
    claimsByTeam,
    episodeSlug,
    currentTime,
}: {
    claimsByTeam: Record<TeamId, StateClaim[]>;
    episodeSlug: string;
    currentTime: number;
}) {
    const isFinalScore = isFinalScoreVisible(episodeSlug, currentTime);

    if (isAreaBonusVisible(episodeSlug, currentTime)) {
        const scores = getAreaBonusScores(claimsByTeam);

        return (
            <div
                className="border-paper/20 relative grid grid-cols-2 border-t"
                aria-label={getAreaBonusAriaLabel(scores, isFinalScore)}
            >
                {isFinalScore && (
                    <div className="col-span-2 flex justify-center pt-3">
                        <span className="border-amber-300/50 bg-amber-300/10 rounded-full border px-3 py-1 font-display text-xs leading-none font-bold text-amber-300 uppercase">
                            Final
                        </span>
                    </div>
                )}
                <AreaBonusTeamScore
                    episodeSlug={episodeSlug}
                    currentTime={currentTime}
                    isFinalScore={isFinalScore}
                    score={scores["sam-brian"]}
                    team="sam-brian"
                />
                <AreaBonusTeamScore
                    episodeSlug={episodeSlug}
                    currentTime={currentTime}
                    isFinalScore={isFinalScore}
                    score={scores["ben-adam"]}
                    team="ben-adam"
                    reverse
                />
                <span className="bg-paper/25 absolute top-1/2 left-1/2 h-16 w-px -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
            </div>
        );
    }

    const samBrian = claimsByTeam["sam-brian"].length;
    const benAdam = claimsByTeam["ben-adam"].length;

    return (
        <div className="border-paper/20 relative grid grid-cols-2 border-t" aria-label={`Score: Sam and Brian ${samBrian}, Ben and Adam ${benAdam}`}>
            <div
                className="flex min-w-0 items-center justify-between gap-3 py-5 pr-4 pl-5 sm:gap-4 sm:py-6 sm:pr-8 sm:pl-8"
                style={{
                    backgroundImage: `linear-gradient(to right, ${seasonFourTeams["sam-brian"].color}24, ${seasonFourTeams["sam-brian"].color}0a 68%, transparent)`,
                }}
            >
                <div className="min-w-0">
                    <div className="mb-2 flex min-w-0 items-center gap-2.5">
                        <span className="size-3 shrink-0" style={{ backgroundColor: seasonFourTeams["sam-brian"].color }} />
                        <span className="truncate font-display text-sm leading-none font-bold uppercase">
                            Sam &amp; Brian
                        </span>
                    </div>
                    <HandDrawer episodeSlug={episodeSlug} currentTime={currentTime} team="sam-brian" />
                </div>
                <span className="font-display text-4xl leading-none font-bold sm:text-5xl">
                    {samBrian}
                </span>
            </div>
            <div
                className="flex min-w-0 items-center justify-between gap-3 py-5 pr-5 pl-4 sm:gap-4 sm:py-6 sm:pr-8 sm:pl-8"
                style={{
                    backgroundImage: `linear-gradient(to left, ${seasonFourTeams["ben-adam"].color}24, ${seasonFourTeams["ben-adam"].color}0a 68%, transparent)`,
                }}
            >
                <span className="font-display text-4xl leading-none font-bold sm:text-5xl">
                    {benAdam}
                </span>
                <div className="min-w-0 text-right">
                    <div className="mb-2 flex min-w-0 items-center justify-end gap-2.5">
                        <span className="truncate font-display text-sm leading-none font-bold uppercase">
                            Ben &amp; Adam
                        </span>
                        <span className="size-3 shrink-0" style={{ backgroundColor: seasonFourTeams["ben-adam"].color }} />
                    </div>
                    <HandDrawer episodeSlug={episodeSlug} currentTime={currentTime} team="ben-adam" />
                </div>
            </div>
            <span className="bg-paper/25 absolute top-1/2 left-1/2 h-10 w-px -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
        </div>
    );
}

function AreaBonusTeamScore({
    currentTime,
    episodeSlug,
    isFinalScore,
    reverse = false,
    score,
    team,
}: ClaimsCardProps & {
    isFinalScore: boolean;
    reverse?: boolean;
    score: AreaBonusScore;
    team: TeamId;
}) {
    return (
        <div
            className={`flex min-w-0 items-center justify-between gap-3 py-4 sm:gap-5 sm:py-5 ${reverse ? "pr-5 pl-4 sm:pr-8 sm:pl-6" : "pr-4 pl-5 sm:pr-6 sm:pl-8"}`}
            style={{
                backgroundImage: `linear-gradient(to ${reverse ? "left" : "right"}, ${seasonFourTeams[team].color}24, ${seasonFourTeams[team].color}0a 68%, transparent)`,
            }}
        >
            {reverse && <ScoreTotal isFinalScore={isFinalScore} score={score} />}
            <div className={`min-w-0 ${reverse ? "text-right" : ""}`}>
                <div className={`mb-2 flex min-w-0 items-center gap-2.5 ${reverse ? "justify-end" : ""}`}>
                    {!reverse && <span className="size-3 shrink-0" style={{ backgroundColor: seasonFourTeams[team].color }} />}
                    <span className="truncate font-display text-sm leading-none font-bold uppercase">
                        {seasonFourTeams[team].name}
                    </span>
                    {reverse && <span className="size-3 shrink-0" style={{ backgroundColor: seasonFourTeams[team].color }} />}
                </div>
                <p className="text-card-meta mb-2 font-sans text-3xs tracking-wider sm:text-xs">
                    <span className="text-paper font-bold tabular-nums">{formatArea(score.area)}</span> sq mi
                </p>
                {!isFinalScore && (
                    <HandDrawer episodeSlug={episodeSlug} currentTime={currentTime} team={team} />
                )}
            </div>
            {!reverse && <ScoreTotal isFinalScore={isFinalScore} score={score} />}
        </div>
    );
}

function ScoreTotal({
    isFinalScore,
    score,
}: {
    isFinalScore: boolean;
    score: AreaBonusScore;
}) {
    return (
        <div className="w-20 shrink-0 text-center sm:w-24">
            <span className="font-display block text-4xl leading-none font-bold sm:text-5xl">
                {score.states + (isFinalScore ? score.bonus : 0)}
            </span>
            <span className="mt-1.5 block min-h-3.5 whitespace-nowrap font-heading text-xs leading-none font-bold text-amber-300 uppercase">
                {Boolean(score.bonus) && `${isFinalScore ? "Incl. " : ""}+${score.bonus} Area Bonus`}
            </span>
        </div>
    );
}

function getAreaBonusAriaLabel(
    scores: Record<TeamId, AreaBonusScore>,
    isFinalScore: boolean,
) {
    const samBrian = scores["sam-brian"];
    const benAdam = scores["ben-adam"];

    const bonusPrefix = isFinalScore ? "including" : "plus";
    const samBrianBonus = samBrian.bonus ? `, ${bonusPrefix} ${samBrian.bonus} point area bonus` : "";
    const benAdamBonus = benAdam.bonus ? `, ${bonusPrefix} ${benAdam.bonus} point area bonus` : "";

    const samBrianTotal = samBrian.states + (isFinalScore ? samBrian.bonus : 0);
    const benAdamTotal = benAdam.states + (isFinalScore ? benAdam.bonus : 0);
    const scoreLabel = isFinalScore ? "Final score" : "Score";

    return `${scoreLabel}: Sam and Brian ${samBrianTotal}${samBrianBonus}, ${formatArea(samBrian.area)} square miles; Ben and Adam ${benAdamTotal}${benAdamBonus}, ${formatArea(benAdam.area)} square miles`;
}

function formatArea(area: number) {
    return new Intl.NumberFormat("en-US").format(area);
}

function isFinalScoreVisible(episodeSlug: string, currentTime: number) {
    return compareTimestamps(
        seasonFour,
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

function ClaimedStates({ claims, expandedState, onExpandedStateChange, team }: ClaimedStatesProps) {
    return (
        <div>
            <h3
                className="border-paper/20 text-paper border-b px-5 py-3 font-heading text-base leading-none font-bold uppercase sm:px-6"
                style={{ backgroundColor: `${seasonFourTeams[team].color}12` }}
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
                            const previousClaim = claim.challenge.kind === "battle"
                                ? getPreviousStateClaim(claim)
                                : undefined;
                            const isDefense = previousClaim?.team === claim.team;

                            return (
                                <StateDisclosure
                                    key={claim.state}
                                    disclosureId={disclosureId}
                                    state={claim.state}
                                    locked={claim.challenge.kind === "battle"}
                                >
                                    {isDefense && previousClaim && (
                                        <DisclosureEvent
                                            label="Claimed via challenge"
                                            challenge={previousClaim.challenge.title}
                                            episode={previousClaim.episode}
                                            at={previousClaim.at}
                                        />
                                    )}
                                    <DisclosureEvent
                                        className={isDefense ? "border-paper/10 mt-3 border-t border-dotted pt-3" : undefined}
                                        label={isDefense
                                            ? "Defended in battle"
                                            : claim.challenge.kind === "battle"
                                                ? "Claimed via battle"
                                                : "Claimed via challenge"}
                                        challenge={claim.challenge.title}
                                        episode={claim.episode}
                                        at={claim.at}
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
            <AccordionTrigger className="gap-4 rounded-none py-2.5 text-xs font-normal hover:text-paper hover:no-underline focus-visible:border-paper focus-visible:ring-paper/30">
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
    challenge,
    className,
    episode,
    label,
}: {
    at: number;
    challenge: string;
    className?: string;
    episode: string;
    label: string;
}) {
    return (
        <div className={className}>
            <dt className="text-card-meta mb-1 font-heading text-xs leading-none font-bold uppercase">
                {label}
            </dt>
            <dd className="text-paper text-xs leading-snug font-semibold">
                {challenge}
            </dd>
            <dd className="text-card-meta mt-1.5 font-sans text-3xs tracking-wider">
                {formatEpisodeShort(episode)} · {formatTimestamp(at)}
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
            style={{ borderColor: `${seasonFourTeams[team].color}70` }}
        >
            <CollapsibleTrigger className="flex min-h-16 w-full items-center justify-between gap-4 rounded-lg px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper">
                <div className="min-w-0">
                    {challenge.kind === "battle" && (
                        <div className="mb-1.5">
                            <span className="border-paper/20 text-card-meta border px-1.5 py-0.5 font-display text-xs leading-none font-bold uppercase">
                                Battle
                            </span>
                        </div>
                    )}
                    <p className="font-display text-lg leading-snug font-bold uppercase">
                        {challenge.displayTitle ?? challenge.title}
                    </p>
                    {challenge.subtitle && (
                        <p className="text-card-meta mt-1.5 font-sans text-xs font-semibold uppercase">
                            {challenge.subtitle}
                        </p>
                    )}
                </div>
                <span className="shrink-0" style={{ color: seasonFourTeams[team].color }}>
                    <Hexagon className="size-8" strokeWidth={1.75} aria-hidden="true" />
                </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <p className="border-paper/10 text-card-meta border-t px-4 py-3 text-xs leading-relaxed">
                    {challenge.description}
                </p>
            </CollapsibleContent>
        </Collapsible>
    );
}

function FailedChallenges({
    episodeSlug,
    currentTime,
    expandedState,
    onExpandedStateChange,
    team,
}: ClaimsCardProps & Omit<ClaimedStatesProps, "claims">) {
    const challenges = getFailedChallenges(episodeSlug, currentTime, team);

    return (
        <div>
            <h3
                className="border-paper/20 text-paper border-b px-5 py-3 font-heading text-base leading-none font-bold uppercase sm:px-6"
                style={{ backgroundColor: `${seasonFourTeams[team].color}12` }}
            >
                Failed challenges
            </h3>
            <div className="px-5 py-4 sm:px-6 sm:py-5">
                {challenges.length ? (
                    <Accordion
                        type="single"
                        collapsible
                        value={expandedState ?? ""}
                        onValueChange={(value) => onExpandedStateChange(value || null)}
                        className="text-card-meta text-xs leading-tight"
                    >
                        {challenges.map((challenge) => {
                            const disclosureId = `${team}:failed:${challenge.episode}:${challenge.at}:${challenge.state}`;
                            const eventLabel = challenge.challenge.kind === "battle"
                                ? challenge.originalClaim.team === team
                                    ? "Lost in battle"
                                    : "Failed claim in battle"
                                : "Challenge failed";

                            return (
                                <StateDisclosure
                                    key={disclosureId}
                                    disclosureId={disclosureId}
                                    state={challenge.state}
                                >
                                    <DisclosureEvent
                                        label={eventLabel}
                                        challenge={challenge.challenge.title}
                                        episode={challenge.episode}
                                        at={challenge.at}
                                    />
                                </StateDisclosure>
                            );
                        })}
                    </Accordion>
                ) : (
                    <EmptyDisclosureRow>No failed challenges</EmptyDisclosureRow>
                )}
            </div>
        </div>
    );
}

function EmptyDisclosureRow({ children }: { children: ReactNode }) {
    return (
        <p className="text-card-meta flex min-h-9 items-center font-display text-sm leading-none font-bold uppercase">
            {children}
        </p>
    );
}

function formatTimestamp(seconds: number) {
    const roundedSeconds = Math.floor(seconds);
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatEpisodeShort(episode: string) {
    if (episode === "finale") return "Finale";
    return `Ep. ${episode.replace("episode-", "")}`;
}

function getStateLabel(state: string) {
    return state === "District of Columbia" ? "D.C." : state;
}
