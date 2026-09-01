"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { getSeason, isAttributedSeason, type AttributedSeason } from "@/data/seasons";
import type { SeasonAttribution } from "@/data/season-types";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const attributionSeason = getAttributionSeason(usePathname());

  return (
    <footer className="max-w-page mx-auto w-full">
      {attributionSeason && (
        <div className="border-paper/15 px-gutter border-t py-7 tablet:py-8">
          <MapAttribution attribution={attributionSeason.attribution} />
        </div>
      )}
      <div
        className={cn(
          "px-gutter flex min-h-20 flex-col items-center justify-between gap-4 border-t py-4 wide:flex-row",
          attributionSeason ? "border-paper/10" : "border-paper/15",
        )}
      >
        <div className="text-footer-copy/70 flex min-w-0 flex-wrap items-baseline justify-center gap-x-3 gap-y-1 font-sans text-sm wide:flex-nowrap wide:justify-start wide:whitespace-nowrap">
          <span className="text-footer-copy font-display text-base leading-none font-bold uppercase">
            Jet Lag: The Player
          </span>
          <span aria-hidden="true">·</span>
          <a
            className="hover:text-footer-copy focus-visible:ring-ring rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            href="https://flyme2bluemoon.github.io/"
            rel="noreferrer"
            target="_blank"
          >
            Made by Matthew Shen
          </a>
          <span aria-hidden="true">·</span>
          <a
            className="hover:text-footer-copy focus-visible:ring-ring rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            href="https://github.com/flyme2bluemoon/Jet-Lag-The-Player"
            rel="noreferrer"
            target="_blank"
          >
            Source Code
          </a>
        </div>
        <div className="shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}

function getAttributionSeason(pathname: string): AttributedSeason | null {
  const [season, episode, ...rest] = pathname.split("/").filter(Boolean);

  if (
    rest.length > 0 ||
    (!/^episode-\d+$/.test(episode ?? "") && episode !== "finale")
  ) {
    return null;
  }

  const configuredSeason = getSeason(season ?? "");
  return configuredSeason && isAttributedSeason(configuredSeason)
    ? configuredSeason
    : null;
}

function MapAttribution({ attribution }: { attribution: SeasonAttribution }) {
  return (
    <div className="text-footer-copy/60 max-w-7xl space-y-2 font-sans text-xs leading-relaxed">
      <p className="text-footer-copy/75 font-heading text-sm font-bold uppercase">
        Map data sources
      </p>
      {attribution.map((paragraph, paragraphIndex) => (
        <p key={`${paragraph.label ?? "general"}-${paragraphIndex}`}>
          {paragraph.label && <><CountryLabel>{paragraph.label}</CountryLabel>{" "}</>}
          {paragraph.parts.map((part, partIndex) =>
            typeof part === "string" ? (
              part
            ) : (
              <FooterLink href={part.href} key={`${part.href}-${partIndex}`}>
                {part.text}
              </FooterLink>
            ),
          )}
        </p>
      ))}
    </div>
  );
}

function CountryLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-footer-copy/75 font-medium">{children}:</span>;
}

function FooterLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a
      className="hover:text-footer-copy focus-visible:ring-ring rounded-sm underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}
