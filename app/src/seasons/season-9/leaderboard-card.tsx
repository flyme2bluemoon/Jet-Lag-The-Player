"use client";

import { Crown, Timer } from "lucide-react";
import { seasonNinePlayers } from "./player-data";
import { formatSeasonNineTimestamp, type SeasonNineState } from "./timeline-data";

function formatRunTime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes.toString().padStart(2, "0")}m ${remainingSeconds.toString().padStart(2, "0")}s`;
}

export function LeaderboardCard({ state }: { state: SeasonNineState }) {
    return (
        <section className="border-paper/25 bg-panel w-full overflow-hidden rounded-lg border" aria-labelledby="season-nine-leaderboard-title">
            <header className="border-paper/20 flex items-center justify-between gap-4 border-b p-6">
                <h2 id="season-nine-leaderboard-title" className="font-heading text-3xl leading-none font-bold tracking-tight uppercase">
                    Leaderboard
                </h2>
                <Crown className="text-signal size-6" aria-hidden="true" />
            </header>

            <div className="p-5 sm:p-6">
                {state.leaderboard.length === 0 && (
                    <p className="text-card-meta font-display text-sm font-bold uppercase">No completed runs yet</p>
                )}

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
        </section>
    );
}
