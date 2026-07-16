"use client";

import { Clock3, Shield, Swords, Trophy } from "lucide-react";
import { getBattleStatus, type BattlePhase } from "./battle-status-data";
import { seasonFourTeams, type TeamId } from "./team-data";

type BattleStatusCardProps = {
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
                    backgroundColor: `color-mix(in srgb, ${teamDetails.color} 15%, transparent)`,
                    color: teamDetails.color,
                }}
            >
                <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="text-card-meta font-heading text-xs leading-none font-bold uppercase">
                    {role}
                </p>
                <p className="mt-0.5 truncate font-display text-lg leading-none font-bold uppercase">
                    {teamDetails.name}
                </p>
            </div>
        </div>
    );
}

export function BattleStatusCard({ episodeSlug, currentTime }: BattleStatusCardProps) {
    const battle = getBattleStatus(episodeSlug, currentTime);

    if (!battle) return null;

    const isCountdown = battle.phase === "countdown";
    const isConcluded = battle.phase === "concluded";
    const StatusIcon = isCountdown ? Clock3 : isConcluded ? Trophy : Swords;
    const winner = battle.winner ? seasonFourTeams[battle.winner] : undefined;
    const winningRole = battle.winner === battle.attacker ? "attackers" : "defenders";

    return (
        <section
            className="border-paper/25 bg-panel w-full overflow-hidden rounded-lg border"
            aria-labelledby="battle-status-title"
            aria-live="polite"
        >
            <header className="border-paper/20 flex items-start justify-between gap-4 border-b px-5 py-5 sm:px-6">
                <h2
                    id="battle-status-title"
                    className="font-heading self-center text-3xl leading-none font-bold tracking-tight uppercase"
                >
                    Battle for {battle.state}
                </h2>
                <span
                    className="bg-paper/10 text-paper grid size-11 shrink-0 place-items-center rounded-full"
                    style={winner ? {
                        backgroundColor: `color-mix(in srgb, ${winner.color} 15%, transparent)`,
                        color: winner.color,
                    } : undefined}
                >
                    <StatusIcon className="size-5" aria-hidden="true" />
                </span>
            </header>

            <div className="px-5 py-5 sm:px-6">
                <div className="border-paper/20 bg-paper/[0.06] mb-5 flex w-fit items-center gap-2 rounded-full border px-3 py-2">
                    <span
                        className={`size-2 translate-y-px rounded-full ${isConcluded ? "" : "animate-pulse bg-paper"}`}
                        style={winner ? { backgroundColor: winner.color } : undefined}
                    />
                    <p className="font-heading text-sm leading-none font-bold uppercase">
                        {phaseLabels[battle.phase]}
                    </p>
                </div>

                {isCountdown ? (
                    <p className="mb-5 font-display text-xl leading-none font-bold uppercase">
                        30-minute countdown
                    </p>
                ) : (
                    <div className="mb-5">
                        <p className="font-display text-xl leading-tight font-bold uppercase">
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
