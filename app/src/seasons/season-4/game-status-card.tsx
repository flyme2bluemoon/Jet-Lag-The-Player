"use client";

import { Clock3, Shield, Swords, Trophy } from "lucide-react";
import { seasonFourTeams } from "./budget-data";
import { getBattleStatus, type BattlePhase } from "./game-status-data";
import type { TeamId } from "./state-claims";

type GameStatusCardProps = {
    episodeSlug: string;
    currentTime: number;
};

const phaseLabels: Record<BattlePhase, string> = {
    countdown: "Battle declared",
    active: "Battle in progress",
    concluded: "Battle concluded",
};

function TeamRole({
    icon: Icon,
    role,
    team,
}: {
    icon: typeof Swords;
    role: string;
    team: TeamId;
}) {
    const teamDetails = seasonFourTeams[team];

    return (
        <div className="border-paper/15 bg-paper/[0.035] flex min-w-0 items-center gap-3 rounded-lg border px-3 py-3">
            <span
                className="grid size-9 shrink-0 place-items-center rounded-full"
                style={{
                    backgroundColor: `${teamDetails.color}26`,
                    color: teamDetails.color,
                }}
            >
                <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="text-card-meta font-mono text-4xs font-bold tracking-wider uppercase">
                    {role}
                </p>
                <p className="mt-0.5 truncate font-heading text-sm font-bold">
                    {teamDetails.name}
                </p>
            </div>
        </div>
    );
}

export function GameStatusCard({ episodeSlug, currentTime }: GameStatusCardProps) {
    const battle = getBattleStatus(episodeSlug, currentTime);

    if (!battle) return null;

    const isCountdown = battle.phase === "countdown";
    const isConcluded = battle.phase === "concluded";
    const StatusIcon = isCountdown ? Clock3 : isConcluded ? Trophy : Swords;
    const winner = battle.winner ? seasonFourTeams[battle.winner] : undefined;
    const winningRole = battle.winner === battle.attacker ? "attackers" : "defenders";

    return (
        <section
            className="border-paper/25 bg-panel w-full overflow-hidden border"
            aria-labelledby="game-status-title"
            aria-live="polite"
        >
            <header className="border-paper/20 flex items-start justify-between gap-4 border-b px-5 py-5 sm:px-6">
                <h2
                    id="game-status-title"
                    className="font-display self-center text-3xl leading-none font-black tracking-tight uppercase"
                >
                    Battle for {battle.state}
                </h2>
                <span
                    className="bg-paper/10 text-paper grid size-11 shrink-0 place-items-center rounded-full"
                    style={winner ? {
                        backgroundColor: `${winner.color}26`,
                        color: winner.color,
                    } : undefined}
                >
                    <StatusIcon className="size-5" aria-hidden="true" />
                </span>
            </header>

            <div className="px-5 py-5 sm:px-6">
                <div className="mb-5 flex items-center gap-2">
                    <span
                        className={`size-2 rounded-full ${isConcluded ? "" : "animate-pulse bg-paper"}`}
                        style={winner ? { backgroundColor: winner.color } : undefined}
                    />
                    <p className="font-mono text-3xs font-bold tracking-wider uppercase">
                        {phaseLabels[battle.phase]}
                    </p>
                </div>

                {isCountdown ? (
                    <p className="mb-5 font-heading text-xl font-black uppercase">
                        30-minute countdown
                    </p>
                ) : (
                    <div className="mb-5">
                        <p className="font-heading text-xl leading-tight font-black uppercase">
                            {battle.challenge}
                        </p>
                        <p className="text-card-meta mt-3 max-w-2xl text-sm leading-relaxed">
                            {battle.description}
                        </p>
                        {isConcluded && battle.winner && (
                            <p
                                className="mt-3 flex items-center gap-2 text-sm font-bold"
                                style={{ color: seasonFourTeams[battle.winner].color }}
                            >
                                <Trophy className="size-4" aria-hidden="true" />
                                {seasonFourTeams[battle.winner].name} win as {winningRole}
                            </p>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <TeamRole icon={Swords} role="Attackers" team={battle.attacker} />
                    <TeamRole icon={Shield} role="Defenders" team={battle.defender} />
                </div>
            </div>
        </section>
    );
}
