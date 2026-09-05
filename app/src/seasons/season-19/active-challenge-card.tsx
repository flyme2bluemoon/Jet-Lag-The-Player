"use client";

import { ChevronDown } from "lucide-react";
import { useId } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { SeasonNineteenActiveAttempt } from "./active-challenges";
import { seasonNineteenTeams } from "./team-data";

const chipClassName =
  "inline-flex h-6 items-center rounded-md border px-2 font-display text-3xs leading-none font-bold uppercase";

export function ActiveChallengeCard({
  attempt,
}: {
  attempt: SeasonNineteenActiveAttempt;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const team = seasonNineteenTeams[attempt.team];

  return (
    <section
      className="border-paper/25 bg-panel w-full overflow-hidden rounded-lg border"
      aria-labelledby={titleId}
      aria-live="polite"
    >
      <Collapsible>
        <div className="flex items-start gap-3 px-4 pt-3 pb-3">
          <div className="min-w-0 flex-1">
            <p className="text-season-19-challenge font-display text-3xs leading-none font-bold tracking-wide uppercase">
              Active Challenge
            </p>
            <h2
              id={titleId}
              className="font-heading mt-1.5 text-lg leading-tight font-bold tracking-tight uppercase"
            >
              {attempt.challenge.title}
            </h2>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <p
                className={chipClassName}
                style={{
                  borderColor: `color-mix(in srgb, ${team.color} 55%, transparent)`,
                  color: team.color,
                }}
              >
                {team.name}
              </p>
              <CollapsibleTrigger
                className={`${chipClassName} border-season-19-challenge/60 text-season-19-challenge hover:bg-season-19-challenge/15 data-[state=open]:bg-season-19-challenge/15 gap-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-season-19-challenge group/description`}
                aria-controls={descriptionId}
              >
                Description
                <ChevronDown
                  className="size-3 transition-transform group-data-[state=open]/description:rotate-180"
                  aria-hidden="true"
                />
              </CollapsibleTrigger>
            </div>
          </div>
          <span
            aria-label={`${attempt.challenge.cardPulls} card pulls`}
            className="border-season-19-challenge bg-challenge-card-paper text-season-19-challenge flex size-10 shrink-0 items-center justify-center rounded-full border-2"
          >
            <span className="font-display text-xl leading-none font-bold">
              {attempt.challenge.cardPulls}
            </span>
          </span>
        </div>
        <CollapsibleContent
          id={descriptionId}
          className="overflow-hidden data-closed:animate-collapsible-up data-open:animate-collapsible-down"
        >
          <p className="border-paper/15 text-card-meta border-t px-4 py-3 font-sans text-sm leading-relaxed">
            {attempt.challenge.description}
          </p>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
