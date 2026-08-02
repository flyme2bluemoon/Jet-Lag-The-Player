"use client";

import Image from "next/image";
import { Crown, Timer } from "lucide-react";
import { seasonNinePlayers } from "./player-data";
import { formatSeasonNineTimestamp, type PlayerId, type SeasonNineState } from "./timeline-data";

function formatRunTime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes.toString().padStart(2, "0")}m ${remainingSeconds.toString().padStart(2, "0")}s`;
}

const ROSTER_IMAGES = {
    adam: { src: "/season-9/players/adam.png", alt: "Adam" },
    ben: { src: "/season-9/players/ben.png", alt: "Ben" },
    sam: { src: "/season-9/players/sam.png", alt: "Sam" },
    "adam-ben": { src: "/season-9/players/ben-adam.png", alt: "Adam and Ben" },
    "adam-sam": { src: "/season-9/players/sam-adam.png", alt: "Sam and Adam" },
    "ben-sam": { src: "/season-9/players/sam-ben.png", alt: "Sam and Ben" },
} as const;

function getRosterImage(players: readonly PlayerId[]) {
    return ROSTER_IMAGES[players.toSorted().join("-") as keyof typeof ROSTER_IMAGES];
}

function PlayerTile({
    label,
    names,
    players,
    endgame = false,
}: {
    label: "Hider" | "Seekers";
    names: string;
    players: readonly PlayerId[];
    endgame?: boolean;
}) {
    const image = getRosterImage(players);

    return (
        <div className="bg-challenge-card-paper text-challenge-card-ink dark:bg-surface dark:text-foreground grid grid-cols-[6rem_minmax(0,1fr)_0.9rem] overflow-hidden rounded-md shadow-sm">
            <div className="relative size-24 overflow-hidden">
                <Image src={image.src} alt={image.alt} fill sizes="6rem" className="object-cover" />
            </div>
            <div className="min-w-0 self-center px-4 py-3.5 sm:px-5">
                <p className="font-display text-3xl leading-none font-bold tracking-tight sm:text-4xl">{names}</p>
                <p className="text-challenge-card-ink/60 dark:text-card-meta mt-1 flex items-center gap-2 font-heading text-sm font-bold tracking-wider uppercase">
                    <span>{label}</span>
                    {endgame && <span className="text-jet-lag-navy-blue dark:text-jet-lag-green">· Endgame</span>}
                </p>
            </div>
            <div className="flex flex-col" aria-hidden="true">
                {players.map((player) => (
                    <span key={player} className="min-h-0 flex-1" style={{ backgroundColor: seasonNinePlayers[player].color }} />
                ))}
            </div>
        </div>
    );
}

export function LeaderboardCard({ state }: { state: SeasonNineState }) {
    const seekers = (Object.keys(seasonNinePlayers) as PlayerId[]).filter((player) => player !== state.currentHider);
    const hider = seasonNinePlayers[state.currentHider];

    return (
        <section className="border-paper/25 bg-panel w-full overflow-hidden rounded-lg border" aria-labelledby="season-nine-leaderboard-title">
            <header className="border-paper/20 flex items-center justify-between gap-4 border-b p-6">
                <h2 id="season-nine-leaderboard-title" className="font-heading text-3xl leading-none font-bold tracking-tight uppercase">
                    Leaderboard
                </h2>
                <Crown className="text-signal size-6" aria-hidden="true" />
            </header>

            <div className="p-5 sm:p-6">
                <div className="space-y-3">
                    <PlayerTile label="Hider" names={hider.name} players={[state.currentHider]} endgame={state.endgame} />
                    <PlayerTile label="Seekers" names={seekers.map((player) => seasonNinePlayers[player].name).join(" + ")} players={seekers} />
                </div>

                {!state.currentRunActive && (
                    <p className="text-card-meta mt-4 font-display text-sm font-bold uppercase">Hider found</p>
                )}

                {state.leaderboard.length > 0 && (
                    <div className="mt-6">
                        <div className="mb-3 flex items-center gap-3">
                            <h3 className="font-heading text-lg font-bold uppercase">Ranking</h3>
                            <span className="bg-paper/20 h-px flex-1" />
                        </div>
                        <ol className="space-y-2">
                            {state.leaderboard.map((run, index) => {
                                const player = seasonNinePlayers[run.hider];
                                return (
                                    <li key={`${run.hider}-${run.endedAt.episode}-${run.endedAt.at}`} className="border-paper/15 bg-paper/3.5 flex items-center gap-3 rounded-lg border px-4 py-3">
                                        <span className="text-card-meta font-display text-lg font-bold">{index + 1}</span>
                                        <span className="size-2.5 rounded-full" style={{ backgroundColor: player.color }} />
                                        <div className="min-w-0">
                                            <span className="font-heading block text-lg leading-none font-bold uppercase">{player.name}</span>
                                            <span className="text-card-meta mt-1 block text-xs">Hider found · {formatSeasonNineTimestamp(run.endedAt)}</span>
                                        </div>
                                        <span className="ml-auto flex shrink-0 items-center gap-2 font-display text-lg font-bold tabular-nums">
                                            <Timer className="text-card-meta size-4" aria-hidden="true" />
                                            {formatRunTime(run.durationSeconds)}
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                )}
            </div>
        </section>
    );
}
