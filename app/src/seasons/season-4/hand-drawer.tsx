"use client";

import { Star, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { getCurrentHand, type ChallengeCard } from "./hand-data";
import { seasonFourStateClaims } from "./state-claims";
import { seasonFourTeams, type TeamId } from "./team-data";

type HandDrawerProps = {
    episodeSlug: string;
    currentTime: number;
    team: TeamId;
};

export function HandDrawer({ episodeSlug, currentTime, team }: HandDrawerProps) {
    const hand = getCurrentHand(
        episodeSlug,
        currentTime,
        team,
        seasonFourStateClaims,
    );
    const teamDetails = seasonFourTeams[team];

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-paper/25 bg-paper/[0.04] text-paper hover:bg-paper hover:text-ink h-8 gap-2 rounded-md px-3 font-display text-sm leading-none font-bold uppercase"
                    aria-label={`View ${teamDetails.name}'s current hand`}
                >
                    <WalletCards className="size-3.5" aria-hidden="true" />
                    View hand
                </Button>
            </DrawerTrigger>
            <DrawerContent className="border-paper/25 bg-panel text-paper max-h-[70vh] rounded-t-lg">
                <div className="mx-auto flex min-h-0 w-full max-w-[100rem] flex-1 flex-col">
                    <DrawerHeader className="border-paper/15 shrink-0 border-b px-5 pt-5 pb-4 text-left sm:px-8">
                        <div className="flex items-center gap-3">
                            <span
                                className="size-3 shrink-0"
                                style={{ backgroundColor: teamDetails.color }}
                            />
                            <DrawerTitle className="text-paper font-heading text-3xl leading-none font-bold tracking-tight uppercase">
                                {teamDetails.name}&apos;s hand
                            </DrawerTitle>
                        </div>
                    </DrawerHeader>

                    <div className="min-h-0 overflow-x-auto px-5 py-4 sm:px-8 sm:py-5">
                        {hand.length ? (
                            <ol className="grid w-max grid-flow-col auto-cols-[10rem] gap-3 lg:w-full lg:grid-flow-row lg:grid-cols-7 lg:auto-cols-auto">
                                {hand.map((card, index) => (
                                    <li key={card?.id ?? `empty-slot-${index}`} className="min-w-0">
                                        {card ? <HandCard card={card} /> : <ReplacementCardSkeleton />}
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <StartingHandSkeleton />
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

function StartingHandSkeleton() {
    return (
        <div role="status" aria-live="polite">
            <p className="text-card-meta mb-3 text-center font-display text-lg leading-none font-bold uppercase">
                Starting hand not yet drawn
            </p>
            <div className="grid w-max grid-flow-col auto-cols-[10rem] gap-3 lg:w-full lg:grid-flow-row lg:grid-cols-7 lg:auto-cols-auto">
                {Array.from({ length: 7 }).map((_, index) => (
                    <CardSkeleton key={index} />
                ))}
            </div>
            <span className="sr-only">Seven challenge cards will appear after the team draws them.</span>
        </div>
    );
}

function ReplacementCardSkeleton() {
    return (
        <div role="status" aria-label="Waiting for replacement card to be drawn">
            <CardSkeleton />
        </div>
    );
}

function CardSkeleton() {
    return (
        <div
            className="border-paper/10 bg-paper/5 min-h-60 overflow-hidden rounded-lg border"
            aria-hidden="true"
        >
            <Skeleton className="h-11 w-full rounded-none bg-neutral-800" />
            <div className="space-y-3 p-3.5">
                <Skeleton className="h-3 w-4/5 bg-paper/15" />
                <Skeleton className="h-3 w-3/5 bg-paper/15" />
                <Skeleton className="my-3 h-px w-full bg-paper/10" />
                <Skeleton className="h-2.5 w-full bg-paper/10" />
                <Skeleton className="h-2.5 w-11/12 bg-paper/10" />
                <Skeleton className="h-2.5 w-4/5 bg-paper/10" />
            </div>
        </div>
    );
}

function HandCard({ card }: { card: ChallengeCard }) {
    const hasAbilities = card.doubleClaim || card.powerUpTokens;

    return (
        <article className="bg-paper text-ink flex min-h-60 flex-col overflow-hidden rounded-lg shadow-lg">
            <div
                className="flex min-h-11 items-center justify-end gap-1.5 bg-neutral-900 px-3 py-2 text-white"
                aria-label={hasAbilities ? "Special abilities" : "No special abilities"}
            >
                {card.doubleClaim && (
                    <span className="border-paper/70 rounded border-2 px-1.5 py-0.5 font-display text-base leading-none tracking-tight">
                        2×
                        <span className="sr-only"> Claims two states</span>
                    </span>
                )}
                {card.powerUpTokens && (
                    <span className="flex" aria-label={`${card.powerUpTokens} powerup ${card.powerUpTokens === 1 ? "token" : "tokens"}`}>
                        {Array.from({ length: card.powerUpTokens }).map((_, index) => (
                            <Star key={index} className="size-5 fill-transparent" strokeWidth={3} aria-hidden="true" />
                        ))}
                    </span>
                )}
            </div>
            <div className="flex flex-1 flex-col px-3.5 pt-4 pb-5">
                <h3 className="font-heading text-[1.1875rem] leading-tight font-bold tracking-tight uppercase">
                    {card.title}
                </h3>
                <div className="bg-ink/15 my-3 h-px" />
                <p className="text-xs leading-relaxed text-ink/75">
                    {card.description}
                </p>
            </div>
        </article>
    );
}
