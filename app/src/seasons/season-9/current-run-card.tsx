"use client";

import { seasonNinePlayers } from "./player-data";
import type { PlayerId, SeasonNineState } from "./timeline-data";

function PlayerTile({
    label,
    names,
    players,
}: {
    label: "Hider" | "Seekers";
    names: string;
    players: readonly PlayerId[];
}) {
    return (
        <div className="bg-challenge-card-paper text-challenge-card-ink dark:bg-surface dark:text-foreground grid grid-cols-[0.9rem_minmax(0,1fr)] overflow-hidden rounded-md shadow-sm">
            <div className="flex flex-col" aria-hidden="true">
                {players.map((player) => (
                    <span key={player} className="min-h-0 flex-1" style={{ backgroundColor: seasonNinePlayers[player].color }} />
                ))}
            </div>
            <div className="min-w-0 self-center px-4 py-3.5 sm:px-5">
                <p className="font-display text-2xl leading-none font-bold tracking-tight sm:text-3xl">{names}</p>
                <p className="text-challenge-card-ink/60 dark:text-card-meta mt-1 flex items-center gap-2 font-heading text-sm font-bold tracking-wider uppercase">
                    <span>{label}</span>
                </p>
            </div>
        </div>
    );
}

export function CurrentRunCard({ state }: { state: SeasonNineState }) {
    const seekers = (Object.keys(seasonNinePlayers) as PlayerId[]).filter((player) => player !== state.currentHider);
    const hider = seasonNinePlayers[state.currentHider];
    const alert = state.endgame
        ? { label: "Endgame", className: "border-jet-lag-yellow/70 bg-jet-lag-yellow/15 text-jet-lag-navy-blue dark:text-jet-lag-yellow" }
        : !state.currentRunActive
            ? { label: "Hider Found", className: "border-jet-lag-red/70 bg-jet-lag-red/10 text-jet-lag-red" }
            : null;

    return (
        <section className="border-paper/25 bg-panel w-full overflow-hidden rounded-lg border" aria-labelledby="season-nine-current-run-title">
            <header className="border-paper/20 flex flex-wrap items-center justify-between gap-3 border-b p-6">
                <h2 id="season-nine-current-run-title" className="font-heading text-3xl leading-none font-bold tracking-tight uppercase">
                    Current Run
                </h2>
                {alert && (
                    <span className={`${alert.className} rounded-full border px-3 py-1 font-heading text-sm font-bold tracking-wider uppercase`} role="status">
                        {alert.label}
                    </span>
                )}
            </header>

            <div className="p-5 sm:p-6">
                <div className="space-y-3">
                    <PlayerTile label="Hider" names={hider.name} players={[state.currentHider]} />
                    <PlayerTile label="Seekers" names={seekers.map((player) => seasonNinePlayers[player].name).join(" + ")} players={seekers} />
                </div>

            </div>
        </section>
    );
}
