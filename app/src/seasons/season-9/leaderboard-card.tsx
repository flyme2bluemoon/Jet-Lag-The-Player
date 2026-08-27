"use client";

import { Crown, Timer } from "lucide-react";
import { seasonNinePlayers } from "./player-data";
import type { PlayerId, SeasonNineState } from "./timeline-data";
import { formatEpisodeLabel, formatTimestamp } from "@/lib/timestamps";

function formatRunTime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes.toString().padStart(2, "0")}m ${remainingSeconds.toString().padStart(2, "0")}s`;
}

const playerIds: readonly PlayerId[] = ["adam", "ben", "sam"];

export function LeaderboardCard({ state }: { state: SeasonNineState }) {
    const scoredPlayers = new Set(state.leaderboard.map((run) => run.hider));
    const placeholderPlayers = playerIds.filter((player) => !scoredPlayers.has(player));

    return (
        <section className="border-paper/25 bg-panel w-full overflow-hidden rounded-lg border" aria-labelledby="season-nine-leaderboard-title">
            <header className="border-paper/20 flex items-center justify-between gap-4 border-b p-6">
                <h2 id="season-nine-leaderboard-title" className="font-heading text-3xl leading-none font-bold tracking-tight uppercase">
                    Leaderboard
                </h2>
                <Crown className="text-signal size-6" aria-hidden="true" />
            </header>

            <div className="p-5 sm:p-6">
                <ol className="space-y-2">
                    {state.leaderboard.map((run, index) => {
                        const player = seasonNinePlayers[run.hider];
                        return (
                            <li key={`${run.hider}-${run.endedAt.episode}-${run.endedAt.at}`} className="border-paper/15 bg-paper/3.5 grid grid-cols-[0.65rem_minmax(0,1fr)] overflow-hidden rounded-lg border">
                                <span aria-hidden="true" style={{ backgroundColor: player.color }} />
                                <div className="grid grid-cols-[0.75rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
                                    <span className="text-card-meta font-display text-lg font-bold">{index + 1}</span>
                                    <div className="min-w-0">
                                        <span className="font-heading block text-lg leading-none font-bold uppercase">{player.name}</span>
                                        <span className="text-card-meta mt-1 block text-xs">
                                            Hider found in {formatEpisodeLabel(run.endedAt.episode)} at {formatTimestamp(run.endedAt.at)}
                                        </span>
                                    </div>
                                    <span className="flex shrink-0 items-center gap-2 font-display text-lg font-bold tabular-nums">
                                        <Timer className="text-card-meta size-4" aria-hidden="true" />
                                        {formatRunTime(run.durationSeconds)}
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                    {placeholderPlayers.map((playerId) => {
                        const player = seasonNinePlayers[playerId];
                        return (
                            <li key={playerId} className="border-paper/15 bg-paper/3.5 grid grid-cols-[0.65rem_minmax(0,1fr)] overflow-hidden rounded-lg border">
                                <span aria-hidden="true" style={{ backgroundColor: player.color }} />
                                <div className="grid grid-cols-[0.75rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
                                    <span aria-hidden="true" />
                                    <div className="min-w-0">
                                        <span className="font-heading block text-lg leading-none font-bold uppercase">{player.name}</span>
                                    </div>
                                    <span className="text-card-meta flex shrink-0 items-center gap-2 font-display text-lg font-bold tabular-nums">
                                        <Timer className="size-4" aria-hidden="true" />
                                        0h0m0s
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}
