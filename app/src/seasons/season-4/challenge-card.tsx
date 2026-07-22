"use client";

import { CircleOff, Swords, Target } from "lucide-react";
import { getActiveChallenge } from "./challenge-data";
import { seasonFourTeamIds, seasonFourTeams } from "./team-data";

type ChallengeCardProps = {
    episodeSlug: string;
    currentTime: number;
};

export function ChallengeCard({ episodeSlug, currentTime }: ChallengeCardProps) {
    return (
        <section
            className="border-paper/25 bg-panel w-full self-start overflow-hidden rounded-lg border"
            aria-labelledby="challenge-title"
        >
            <header className="border-paper/20 border-b p-6">
                <h2
                    id="challenge-title"
                    className="font-heading text-3xl leading-none font-bold tracking-tight uppercase"
                >
                    Active challenges
                </h2>
            </header>

            <div className="grid sm:grid-cols-2">
                {seasonFourTeamIds.map((team, index) => {
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
                                        ? `color-mix(in srgb, ${seasonFourTeams[team].color} 15%, transparent)`
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
                                    <h3 className="font-heading text-base leading-none font-bold uppercase">
                                        {seasonFourTeams[team].name}
                                    </h3>
                                    {challenge?.kind === "battle" && (
                                        <span className="border-paper/20 text-card-meta border px-1.5 py-0.5 font-display text-xs leading-none font-bold uppercase">
                                            Battle
                                        </span>
                                    )}
                                </div>
                                <p
                                    className={
                                        challenge
                                            ? "font-display text-lg leading-snug font-bold uppercase"
                                            : "text-card-meta font-display text-lg leading-snug font-bold uppercase"
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
