"use client";

import { useId } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { SeasonNineteenChallenge } from "./timeline-data";

export function ChallengesBoardCard({
  challenges,
}: {
  challenges: readonly SeasonNineteenChallenge[];
}) {
  const titleId = useId();

  return (
    <section
      className="border-paper/25 bg-panel @container w-full overflow-hidden rounded-lg border"
      aria-labelledby={titleId}
    >
      <header className="border-paper/20 border-b px-6 py-4">
        <h2
          id={titleId}
          className="font-heading flex items-center gap-2.5 text-3xl leading-none font-bold tracking-tight uppercase"
        >
          Challenges Board
        </h2>
      </header>
      <ul className="grid grid-cols-2 gap-3 p-4 @min-[28rem]:grid-cols-3 @min-[42rem]:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => {
          const challenge = challenges[index];
          return challenge ? (
            <li
              key={challenge.id}
              className="border-season-19-challenge/60 bg-jet-lag-curse-purple bg-linear-to-b from-season-19-challenge/30 via-season-19-challenge/10 to-transparent text-challenge-card-paper relative flex min-h-40 min-w-0 flex-col items-center rounded-xl border px-3 pt-3 pb-4 shadow-lg shadow-jet-lag-curse-purple/50"
            >
              <div className="border-season-19-challenge bg-challenge-card-paper text-jet-lag-curse-purple shadow-challenge-card-ink/40 relative flex size-14 shrink-0 items-center justify-center rounded-full border-2 shadow-md">
                <span
                  aria-label={`${challenge.cardPulls} card pulls`}
                  className="font-display text-center text-3xl leading-none font-bold"
                >
                  {challenge.cardPulls}
                </span>
              </div>
              <h3 className="mt-3 text-center font-sans text-sm leading-snug font-semibold text-balance">
                {challenge.title}
              </h3>
            </li>
          ) : (
            <li
              key={`empty-${index}`}
              aria-label="Unrevealed challenge"
              className="border-season-19-challenge/25 bg-season-19-challenge/5 flex min-h-40 min-w-0 flex-col items-center rounded-xl border-2 border-dashed px-3 pt-3 pb-4"
            >
              <span
                aria-hidden="true"
                className="border-season-19-challenge/30 text-season-19-challenge/50 font-display flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-dashed text-3xl leading-none font-bold"
              >
                ?
              </span>
              <div
                aria-hidden="true"
                className="mt-3 flex w-full flex-col items-center gap-2"
              >
                <Skeleton className="bg-season-19-challenge/15 h-3 w-full motion-reduce:animate-none" />
                <Skeleton className="bg-season-19-challenge/15 h-3 w-2/3 motion-reduce:animate-none" />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
