"use client";

import { CircleOff, Swords, Target } from "lucide-react";
import { getActiveChallenge } from "./challenge-data";
import { seasonFourTeams } from "./budget-data";
import type { TeamId } from "./state-claims";

type ChallengeCardProps = {
    episodeSlug: string;
    currentTime: number;
};

const teamOrder: TeamId[] = ["sam-brian", "ben-adam"];

export function ChallengeCard({ episodeSlug, currentTime }: ChallengeCardProps) {
    return (
        <section
            className="border-paper/25 bg-panel w-full self-start border"
            aria-labelledby="challenge-title"
        >
            <header className="border-paper/20 border-b px-6 py-6 sm:px-8 sm:py-7">
                <h2
                    id="challenge-title"
                    className="font-display text-3xl leading-none font-black tracking-tight uppercase"
                >
                    Active challenges
                </h2>
            </header>

            <div className="grid sm:grid-cols-2">
                {teamOrder.map((team, index) => {
                    const challenge = getActiveChallenge(
                        episodeSlug,
                        currentTime,
                        team,
                    );
                    const Icon = challenge
                        ? challenge.kind === "battle"
                            ? Swords
                            : Target
                        : CircleOff;

                    return (
                        <article
                            key={team}
                            className={`flex min-h-36 gap-4 p-5 sm:p-7 ${index === 0 ? "border-paper/20 border-b sm:border-r sm:border-b-0" : ""}`}
                        >
                            <span
                                className="grid size-11 shrink-0 place-items-center rounded-full"
                                style={{
                                    backgroundColor: challenge
                                        ? `${seasonFourTeams[team].color}26`
                                        : "color-mix(in srgb, var(--color-paper) 8%, transparent)",
                                    color: challenge
                                        ? seasonFourTeams[team].color
                                        : "var(--color-card-meta)",
                                }}
                            >
                                <Icon className="size-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 pt-0.5">
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <span
                                        className="size-2.5 shrink-0"
                                        style={{ backgroundColor: seasonFourTeams[team].color }}
                                    />
                                    <h3 className="text-2xs font-mono font-bold tracking-wider uppercase">
                                        {seasonFourTeams[team].name}
                                    </h3>
                                    {challenge?.kind === "battle" && (
                                        <span className="border-paper/20 text-card-meta text-4xs border px-1.5 py-0.5 font-mono font-bold tracking-wider uppercase">
                                            Battle
                                        </span>
                                    )}
                                </div>
                                <p
                                    className={
                                        challenge
                                            ? "font-heading text-lg leading-snug font-bold uppercase"
                                            : "text-card-meta text-sm"
                                    }
                                >
                                    {challenge?.title ?? "No active challenge"}
                                </p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
