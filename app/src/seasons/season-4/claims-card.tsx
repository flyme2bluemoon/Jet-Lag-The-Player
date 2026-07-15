"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Hexagon, Lock } from "lucide-react";
import { Map, MapGeoJSON, MapMarker, MarkerContent } from "@/components/ui/map";
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
import { seasonFourTeams } from "./budget-data";
import { getActiveChallenge, getFailedChallenges } from "./challenge-data";
import { HandDrawer } from "./hand-drawer";
import {
    getStateClaims,
    seasonFourEpisodeOrder,
    type StateClaim,
    type TeamId,
} from "./state-claims";

const US_STATES_GEOJSON = "/seasons/season-4/geojson/us-states.geojson";
const CANADA_GEOJSON = "/seasons/season-4/geojson/canada.geojson";
const FINAL_SCORE_REVEALED_AT = 40 * 60 + 50;

const teams: Record<TeamId, { name: string; color: string }> = {
    "sam-brian": { name: "Sam & Brian", color: "#63A26B" },
    "ben-adam": { name: "Ben & Adam", color: "#DC4742" },
};

const stateAbbreviations: Record<string, string> = {
    Alaska: "AK",
    Arizona: "AZ",
    California: "CA",
    Colorado: "CO",
    Connecticut: "CT",
    Delaware: "DE",
    "District of Columbia": "DC",
    Illinois: "IL",
    Indiana: "IN",
    Maryland: "MD",
    Massachusetts: "MA",
    Michigan: "MI",
    Nevada: "NV",
    "New Jersey": "NJ",
    "New York": "NY",
    Pennsylvania: "PA",
    "Rhode Island": "RI",
    Tennessee: "TN",
    Texas: "TX",
    Virginia: "VA",
    Wyoming: "WY",
};

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
            if (state !== "District of Columbia") expression.push(state, teams[claim.team].color);
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
        <section className="border-paper/25 bg-panel flex min-h-0 w-full flex-col border" aria-labelledby="claims-title">
            <header className="border-paper/20 border-b px-6 py-6 sm:px-8 sm:py-7">
                <h2 id="claims-title" className="font-display text-3xl leading-none font-black tracking-tight uppercase">Scoreboard</h2>
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
                                    style={{ backgroundColor: teams[claims.get("District of Columbia")!.team].color }}
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
                {(Object.keys(teams) as TeamId[]).map((team, index) => (
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
    const episodeDifference =
        seasonFourEpisodeOrder.indexOf(
            a.episode as (typeof seasonFourEpisodeOrder)[number],
        ) -
        seasonFourEpisodeOrder.indexOf(
            b.episode as (typeof seasonFourEpisodeOrder)[number],
        );

    return episodeDifference || a.at - b.at;
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
                        <span className="border-amber-300/50 bg-amber-300/10 rounded-full border px-3 py-1 font-mono text-4xs font-bold tracking-widest text-amber-300 uppercase">
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
            <div className="flex min-w-0 items-center justify-between gap-3 py-5 pr-4 pl-5 sm:gap-4 sm:py-6 sm:pr-8 sm:pl-8">
                <div className="min-w-0">
                    <div className="mb-2 flex min-w-0 items-center gap-2.5">
                        <span className="size-3 shrink-0" style={{ backgroundColor: teams["sam-brian"].color }} />
                        <span className="text-3xs truncate font-mono font-bold tracking-wider uppercase sm:text-xs">
                            Sam &amp; Brian
                        </span>
                    </div>
                    <HandDrawer episodeSlug={episodeSlug} currentTime={currentTime} team="sam-brian" />
                </div>
                <span className="font-display text-4xl leading-none font-black sm:text-5xl">
                    {samBrian}
                </span>
            </div>
            <div className="flex min-w-0 items-center justify-between gap-3 py-5 pr-5 pl-4 sm:gap-4 sm:py-6 sm:pr-8 sm:pl-8">
                <span className="font-display text-4xl leading-none font-black sm:text-5xl">
                    {benAdam}
                </span>
                <div className="min-w-0 text-right">
                    <div className="mb-2 flex min-w-0 items-center justify-end gap-2.5">
                        <span className="text-3xs truncate font-mono font-bold tracking-wider uppercase sm:text-xs">
                            Ben &amp; Adam
                        </span>
                        <span className="size-3 shrink-0" style={{ backgroundColor: teams["ben-adam"].color }} />
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
        <div className={`flex min-w-0 items-center justify-between gap-3 py-4 sm:gap-5 sm:py-5 ${reverse ? "pr-5 pl-4 sm:pr-8 sm:pl-6" : "pr-4 pl-5 sm:pr-6 sm:pl-8"}`}>
            {reverse && <ScoreTotal isFinalScore={isFinalScore} score={score} />}
            <div className={`min-w-0 ${reverse ? "text-right" : ""}`}>
                <div className={`mb-2 flex min-w-0 items-center gap-2.5 ${reverse ? "justify-end" : ""}`}>
                    {!reverse && <span className="size-3 shrink-0" style={{ backgroundColor: teams[team].color }} />}
                    <span className="text-3xs truncate font-mono font-bold tracking-wider uppercase sm:text-xs">
                        {teams[team].name}
                    </span>
                    {reverse && <span className="size-3 shrink-0" style={{ backgroundColor: teams[team].color }} />}
                </div>
                <p className="text-card-meta mb-2 font-mono text-3xs tracking-wider sm:text-xs">
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
            <span className="font-display block text-4xl leading-none font-black sm:text-5xl">
                {score.states + (isFinalScore ? score.bonus : 0)}
            </span>
            <span className="mt-1.5 block min-h-3.5 whitespace-nowrap font-mono text-4xs font-bold tracking-wider text-amber-300 uppercase">
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
    return episodeSlug === "finale" && currentTime >= FINAL_SCORE_REVEALED_AT;
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
                className="border-paper/20 text-paper border-b px-5 py-3 text-2xs font-mono font-bold tracking-widest uppercase sm:px-6"
                style={{ backgroundColor: `${teams[team].color}12` }}
            >
                States claimed
            </h3>
            <div className="px-5 py-4 sm:px-6 sm:py-5">
                {claims.length ? (
                    <ul className="text-card-meta text-xs leading-tight">
                        {claims.map((claim) => {
                            const disclosureId = `${team}:${claim.state}`;
                            const stateLabel = getStateLabel(claim.state);

                            return (
                                <StateDisclosure
                                    key={claim.state}
                                    disclosureId={disclosureId}
                                    state={claim.state}
                                    expandedState={expandedState}
                                    onExpandedStateChange={onExpandedStateChange}
                                    team={team}
                                    detailsLabel="claim"
                                    locked={Boolean(claim.battleWin)}
                                >
                                    {claim.battleWin?.result !== "stolen" && (
                                        <>
                                            <div>
                                                <dt className="text-card-meta mb-1 font-mono text-4xs font-bold tracking-wider">
                                                    Challenge used
                                                </dt>
                                                <dd className="text-paper text-xs leading-snug font-semibold">
                                                    {claim.challenge}
                                                </dd>
                                            </div>
                                            <div className="border-paper/10 mt-2.5 border-t pt-2.5">
                                                <dt className="sr-only">Claim details</dt>
                                                <dd className="text-card-meta font-mono text-3xs tracking-wider">
                                                    Claimed {stateAbbreviations[claim.state] ?? stateLabel} in {formatEpisodeShort(claim.episode)} at {formatTimestamp(claim.at)}
                                                </dd>
                                            </div>
                                        </>
                                    )}
                                    {claim.battleWin && (
                                        <div className={claim.battleWin.result === "held" ? "border-paper/10 -mx-3.5 mt-3 border-t border-dotted px-3.5 pt-3" : ""}>
                                            <dt className="text-card-meta mb-1 font-mono text-4xs font-bold tracking-wider">
                                                Battle won
                                            </dt>
                                            <dd className="text-paper text-xs leading-snug font-semibold">
                                                {claim.battleWin.challenge}
                                            </dd>
                                            <dd className="text-card-meta border-paper/10 mt-2.5 border-t pt-2.5 font-mono text-3xs tracking-wider">
                                                Won {stateAbbreviations[claim.state] ?? stateLabel} in {formatEpisodeShort(claim.battleWin.episode)} at {formatTimestamp(claim.battleWin.at)}
                                            </dd>
                                        </div>
                                    )}
                                </StateDisclosure>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-card-meta py-2.5 text-xs">No states yet</p>
                )}
            </div>
        </div>
    );
}

type StateDisclosureProps = {
    children: ReactNode;
    detailsLabel: string;
    disclosureId: string;
    expandedState: string | null;
    locked?: boolean;
    onExpandedStateChange: (state: string | null) => void;
    state: string;
    team: TeamId;
};

function StateDisclosure({
    children,
    detailsLabel,
    disclosureId,
    expandedState,
    locked = false,
    onExpandedStateChange,
    state,
    team,
}: StateDisclosureProps) {
    const isExpanded = expandedState === disclosureId;

    return (
        <li className="border-paper/10 border-b last:border-0">
            <Collapsible
                open={isExpanded}
                onOpenChange={(open) => onExpandedStateChange(open ? disclosureId : null)}
            >
                <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 py-2.5 text-left transition-colors hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper">
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
                    <span
                        className="text-4xs shrink-0 font-mono font-bold tracking-wider opacity-75 transition-opacity group-hover:opacity-100"
                        style={{ color: teams[team].color }}
                    >
                        {isExpanded ? `Hide ${detailsLabel}` : `View ${detailsLabel}`}
                    </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <dl className="border-paper/10 bg-paper/[0.025] mb-3 rounded-md border px-3.5 py-3">
                        {children}
                    </dl>
                </CollapsibleContent>
            </Collapsible>
        </li>
    );
}

function ActiveChallenge({ episodeSlug, currentTime, team }: ClaimsCardProps & { team: TeamId }) {
    const challenge = getActiveChallenge(episodeSlug, currentTime, team);

    if (!challenge) {
        return (
            <div className="border-paper/20 bg-paper/[0.04] flex min-h-16 items-center justify-between gap-4 rounded-xl border px-4 py-3">
                <p className="text-card-meta text-xs">No active challenge</p>
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
            className="border-paper/20 bg-paper/[0.04] rounded-xl border"
            style={{ borderColor: `${seasonFourTeams[team].color}70` }}
        >
            <CollapsibleTrigger className="flex min-h-16 w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper">
                <div className="min-w-0">
                    {challenge.kind === "battle" && (
                        <div className="mb-1.5">
                            <span className="border-paper/20 text-card-meta text-4xs border px-1.5 py-0.5 font-mono font-bold tracking-wider uppercase">
                                Battle
                            </span>
                        </div>
                    )}
                    <p className="font-heading text-sm leading-snug font-bold uppercase">
                        {challenge.displayTitle ?? challenge.title}
                    </p>
                    {challenge.subtitle && (
                        <p className="text-card-meta mt-1.5 font-mono text-4xs font-bold tracking-wider uppercase">
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
                className="border-paper/20 text-paper border-b px-5 py-3 text-2xs font-mono font-bold tracking-widest uppercase sm:px-6"
                style={{ backgroundColor: `${teams[team].color}12` }}
            >
                Failed challenges
            </h3>
            <div className="px-5 py-4 sm:px-6 sm:py-5">
                {challenges.length ? (
                    <ul className="text-card-meta text-xs leading-tight">
                        {challenges.map((challenge) => {
                            const disclosureId = `${team}:failed:${challenge.episode}:${challenge.at}:${challenge.state}`;
                            const stateLabel = getStateLabel(challenge.state);
                            const stateShortLabel = stateAbbreviations[challenge.state] ?? stateLabel;
                            const showOriginalClaim = challenge.kind === "battle" &&
                                challenge.originalClaim.team === team &&
                                Boolean(challenge.originalChallenge);

                            return (
                                <StateDisclosure
                                    key={disclosureId}
                                    disclosureId={disclosureId}
                                    state={challenge.state}
                                    expandedState={expandedState}
                                    onExpandedStateChange={onExpandedStateChange}
                                    team={team}
                                    detailsLabel="challenge"
                                >
                                    {showOriginalClaim && challenge.kind === "battle" && (
                                        <>
                                            <div>
                                                <dt className="text-card-meta mb-1 font-mono text-4xs font-bold tracking-wider">
                                                    Challenge used
                                                </dt>
                                                <dd className="text-paper text-xs leading-snug font-semibold">
                                                    {challenge.originalChallenge}
                                                </dd>
                                            </div>
                                            <div className="border-paper/10 mt-2.5 border-t pt-2.5">
                                                <dt className="sr-only">Original claim details</dt>
                                                <dd className="text-card-meta font-mono text-3xs tracking-wider">
                                                    Claimed {stateShortLabel} in {formatEpisodeShort(challenge.originalClaim.episode)} at {formatTimestamp(challenge.originalClaim.at)}
                                                </dd>
                                            </div>
                                        </>
                                    )}
                                    <div className={showOriginalClaim ? "border-paper/10 -mx-3.5 mt-3 border-t border-dotted px-3.5 pt-3" : ""}>
                                        <dt className="text-card-meta mb-1 flex flex-wrap items-center gap-2 font-mono text-4xs font-bold tracking-wider">
                                            <span>{challenge.kind === "battle" ? "Battle lost" : "Challenge failed"}</span>
                                            {challenge.kind === "battle" && <BattleBadge />}
                                        </dt>
                                        <dd className="text-paper text-xs leading-snug font-semibold">
                                            {challenge.title}
                                        </dd>
                                    </div>
                                    <div className="border-paper/10 mt-2.5 border-t pt-2.5">
                                        <dt className="sr-only">Failure details</dt>
                                        <dd className="text-card-meta font-mono text-3xs tracking-wider">
                                            Failed {stateShortLabel} in {formatEpisodeShort(challenge.episode)} at {formatTimestamp(challenge.at)}
                                        </dd>
                                    </div>
                                </StateDisclosure>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-card-meta text-xs">No failed challenges</p>
                )}
            </div>
        </div>
    );
}

function BattleBadge() {
    return (
        <span className="border-paper/20 text-card-meta text-4xs border px-1.5 py-0.5 font-mono font-bold tracking-wider uppercase">
            Battle
        </span>
    );
}

function formatTimestamp(seconds: number) {
    const roundedSeconds = Math.floor(seconds);
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatEpisodeShort(episode: string) {
    if (episode === "finale") return "the Finale";
    return `Ep. ${episode.replace("episode-", "")}`;
}

function getStateLabel(state: string) {
    return state === "District of Columbia" ? "D.C." : state;
}
