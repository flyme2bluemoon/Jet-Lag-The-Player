"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { SeasonTrailer } from "@/data/season-trailers";

const PREMIERE_ZONE = "America/New_York";
const subscribe = () => () => {};

function useClientValue<T>(getValue: () => T, serverValue: T) {
  return useSyncExternalStore(
    subscribe,
    getValue,
    () => serverValue,
  );
}

function formatDateTime(premiere: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(premiere);
}

function PremiereLine({ platform, premiere, localZone }: { platform: string; premiere: Date; localZone: string | null }) {
  const localTime = localZone && localZone !== PREMIERE_ZONE
    ? formatDateTime(premiere, localZone)
    : null;

  return (
    <p className="text-copy-muted font-sans text-sm leading-relaxed tablet:text-base">
      <span className="whitespace-nowrap">
        Premieres on {platform} at{" "}
        <time className="text-paper font-semibold" dateTime={premiere.toISOString()}>
          {formatDateTime(premiere, PREMIERE_ZONE)} ET
        </time>
      </span>
      {localTime && <> <span className="whitespace-nowrap">({localTime} your time)</span></>}
    </p>
  );
}

function PremiereDetails({ nebulaPremiere, youtubePremiere }: { nebulaPremiere: Date; youtubePremiere: Date }) {
  const localZone = useClientValue<string | null>(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    null,
  );

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <PremiereLine platform="Nebula" premiere={nebulaPremiere} localZone={localZone} />
      <PremiereLine platform="Youtube" premiere={youtubePremiere} localZone={localZone} />
    </div>
  );
}

function CallToAction({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      className="font-heading border-nebula-blue/55 bg-panel text-paper hover:border-nebula-blue hover:bg-[color-mix(in_srgb,var(--color-nebula-blue)_12%,var(--color-panel))] focus-visible:ring-ring flex w-full items-center justify-between gap-6 rounded-lg border px-5 py-3.5 text-base leading-none font-bold uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <span>{children}</span>
      <svg className="text-nebula-blue w-7 shrink-0" viewBox="0 0 28 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M0 6h26M20.5 1 26 6l-5.5 5" />
      </svg>
    </a>
  );
}

export function SeasonTrailerPage({ trailer }: { trailer: SeasonTrailer }) {
  const nebulaPremiere = new Date(trailer.nebulaPremiere);
  const youtubePremiere = new Date(trailer.youtubePremiere);
  const hasPremiered = useClientValue(
    () => Date.now() >= nebulaPremiere.getTime(),
    false,
  );
  const hasReleasedOnYoutube = useClientValue(
    () => Date.now() >= youtubePremiere.getTime(),
    false,
  );
  const watchHref = hasPremiered ? trailer.nebulaFirstEpisode : trailer.nebulaSeason;
  const watchLabel = hasPremiered
    ? "Watch Episode 1 on Nebula now"
    : `Watch Season ${trailer.number} on Nebula`;

  return (
    <main className="page-texture max-w-page px-gutter mx-auto min-h-screen w-full overflow-hidden pb-24">
      <header className="border-paper/20 relative flex items-end justify-between gap-10 overflow-hidden border-b pt-10 pb-8 md:min-h-56">
        <Link className="text-copy-muted hover:text-paper focus-visible:text-paper font-heading absolute top-10 left-0 z-2 flex items-center gap-2.5 text-base leading-none font-bold uppercase transition-colors focus-visible:outline-none" href="/" aria-label="Back to all seasons"><span className="text-signal text-lg" aria-hidden="true">←</span> All seasons</Link>
        <div className="relative z-1 pt-14">
          <p className="text-signal font-display mb-2 text-base leading-none font-bold uppercase">Season {trailer.number} · Trailer</p>
          <h1 className="font-heading leading-display-title max-w-120 text-[clamp(3.25rem,14vw,4.875rem)] font-bold tracking-tight uppercase md:max-w-none md:text-[clamp(3.125rem,5.7vw,5.5rem)]">{trailer.name ?? `Season ${trailer.number}`}</h1>
        </div>
        <div className="font-display text-stroke-paper-subtle absolute -right-2.5 bottom-5 text-[9.375rem] leading-[0.68] font-bold tracking-tighter text-transparent opacity-70 select-none md:static md:text-[clamp(8.125rem,13vw,13.125rem)] md:opacity-100" aria-hidden="true">{String(trailer.number).padStart(2, "0")}</div>
      </header>

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 pt-8">
        <h2 className="font-heading text-center text-2xl leading-tight font-bold tracking-normal uppercase text-balance tablet:text-3xl">{hasReleasedOnYoutube ? trailer.releasedTagline : trailer.tagline}</h2>

        <div className="border-paper/20 bg-surface relative aspect-video w-full overflow-hidden rounded-lg border">
          <iframe
            className="absolute inset-0 size-full"
            src={`https://www.youtube-nocookie.com/embed/${trailer.videoId}`}
            title={`Season ${trailer.number} trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <div className="flex w-full flex-col items-center gap-5 text-center">
          <PremiereDetails nebulaPremiere={nebulaPremiere} youtubePremiere={youtubePremiere} />
          <div className="w-full max-w-xl">
            <CallToAction href={watchHref}>{watchLabel}</CallToAction>
          </div>
        </div>
      </div>
    </main>
  );
}
