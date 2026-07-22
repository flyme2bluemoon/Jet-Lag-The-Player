import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FastForward, Rewind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EpisodeDashboard } from "@/components/episode/episode-dashboard";
import { getSeasonPage, seasonPages } from "@/data/season-pages";
import { EpisodeSwitcher } from "./episode-switcher";

type EpisodePageProps = { params: Promise<{ season: string; episode: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return seasonPages.flatMap((season) =>
    season.episodes
      .filter((episode) => episode.video)
      .map((episode) => ({ season: season.slug, episode: episode.slug })),
  );
}

export async function generateMetadata({ params }: EpisodePageProps): Promise<Metadata> {
  const route = await params;
  const season = getSeasonPage(route.season);
  const episodeNumber = season?.episodes.findIndex((item) => item.slug === route.episode) ?? -1;
  const episode = season?.episodes[episodeNumber];
  return episode?.video && season
    ? { title: `S${season.number}E${episodeNumber + 1} ${episode.title} | Jet Lag: The Player`, description: episode.title }
    : {};
}

export default async function EpisodeDashboardPage({ params }: EpisodePageProps) {
  const route = await params;
  const season = getSeasonPage(route.season);
  if (!season) notFound();
  const episode = season.episodes.find((item) => item.slug === route.episode);
  if (!episode?.video) notFound();

  const releasedEpisodes = season.episodes.filter((item) => item.video);
  const episodeIndex = releasedEpisodes.findIndex((item) => item.slug === episode.slug);
  const previousEpisode = releasedEpisodes[episodeIndex - 1];
  const nextEpisode = releasedEpisodes[episodeIndex + 1];
  const episodeHref = (slug: string) => `/${season.slug}/${slug}`;

  return (
    <main className="page-texture max-w-page px-gutter tablet:pt-7 tablet:pb-16 2xl:max-w-none 2xl:px-8 mx-auto min-h-screen w-full overflow-x-clip pt-4.5 pb-10">
      <header className="border-paper/20 tablet:flex-row tablet:items-end tablet:justify-between tablet:gap-8 tablet:pt-3 tablet:pb-4 flex flex-col items-stretch gap-6 border-b pt-7 pb-5.5">
        <div>
          <Link className="text-copy-muted hover:text-paper focus-visible:text-paper tablet:mb-4 mb-6 inline-flex items-center gap-2 font-heading text-base leading-none font-bold uppercase transition-colors focus-visible:outline-none" href={`/${season.slug}`}><span className="text-signal text-lg" aria-hidden="true">←</span> {season.name}</Link>
          <p className="text-signal mb-2 font-display text-base leading-none font-bold uppercase">Season {season.number}</p>
          <h1 className="font-heading leading-display-title tablet:text-[clamp(3rem,6vw,5.25rem)] text-5xl font-bold tracking-tight uppercase">{episode.label}</h1>
        </div>
        <nav className="border-paper/40 bg-panel tablet:inline-flex tablet:w-auto grid min-h-11 w-full grid-cols-22 items-stretch overflow-hidden rounded-lg border" aria-label="Episode controls">
          {previousEpisode ? <Button asChild variant="ghost" className="text-control hover:text-paper focus-visible:text-paper hover:bg-paper/5 focus-visible:bg-paper/5 tablet:min-w-40 tablet:px-4 tablet:text-base col-span-7 h-auto min-w-0 gap-2 rounded-none border-0 px-2 font-display leading-none font-bold uppercase"><Link href={episodeHref(previousEpisode.slug)}><Rewind className="size-4 shrink-0" aria-hidden="true" /> Previous episode</Link></Button> : <Button variant="ghost" className="bg-player/15 tablet:min-w-40 tablet:px-4 tablet:text-base col-span-7 h-auto min-w-0 gap-2 rounded-none border-0 px-2 font-display leading-none font-bold text-paper/30 uppercase disabled:opacity-100" disabled><Rewind className="size-4 shrink-0" aria-hidden="true" /> Previous episode</Button>}
          <EpisodeSwitcher seasonSlug={season.slug} episodes={season.episodes} currentSlug={episode.slug} />
          {nextEpisode ? <Button asChild variant="ghost" className="text-control hover:text-paper focus-visible:text-paper hover:bg-paper/5 focus-visible:bg-paper/5 tablet:min-w-40 tablet:px-4 tablet:text-base col-span-7 h-auto min-w-0 gap-2 rounded-none border-0 px-2 font-display leading-none font-bold uppercase"><Link href={episodeHref(nextEpisode.slug)}>Next episode <FastForward className="size-4 shrink-0" aria-hidden="true" /></Link></Button> : <Button variant="ghost" className="bg-player/15 tablet:min-w-40 tablet:px-4 tablet:text-base col-span-7 h-auto min-w-0 gap-2 rounded-none border-0 px-2 font-display leading-none font-bold text-paper/30 uppercase disabled:opacity-100" disabled>Next episode <FastForward className="size-4 shrink-0" aria-hidden="true" /></Button>}
        </nav>
      </header>
      <EpisodeDashboard
        seasonSlug={season.slug}
        episodeSlug={episode.slug}
        label={episode.label}
        title={episode.title}
        videoId={episode.video}
      />
    </main>
  );
}
