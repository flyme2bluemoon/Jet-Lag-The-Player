import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EpisodeDashboard } from "@/components/episode/episode-dashboard";
import { getSeasonPage, seasonPages } from "@/data/season-pages";
import { EpisodeSwitcher } from "./episode-switcher";

type EpisodePageProps = { params: Promise<{ season: string; episode: string }> };

function RewindIcon() {
  return <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 12 18z" /><path d="M22 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 22 18z" /></svg>;
}

function FastForwardIcon() {
  return <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 12 18z" /><path d="M2 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 2 18z" /></svg>;
}

export function generateStaticParams() {
  return seasonPages.flatMap((season) => season.episodes.map((episode) => ({ season: season.slug, episode: episode.slug })));
}

export async function generateMetadata({ params }: EpisodePageProps): Promise<Metadata> {
  const route = await params;
  const season = getSeasonPage(route.season);
  const episode = season?.episodes.find((item) => item.slug === route.episode);
  return episode && season
    ? { title: `${episode.label} | Season ${season.number}: ${season.name}`, description: episode.title }
    : {};
}

export default async function EpisodeDashboardPage({ params }: EpisodePageProps) {
  const route = await params;
  const season = getSeasonPage(route.season);
  if (!season) notFound();
  const episodeIndex = season.episodes.findIndex((item) => item.slug === route.episode);
  if (episodeIndex === -1) notFound();

  const episode = season.episodes[episodeIndex];
  const previousEpisode = season.episodes[episodeIndex - 1];
  const nextEpisode = season.episodes[episodeIndex + 1];
  const episodeHref = (slug: string) => `/${season.slug}/${slug}`;

  return (
    <main className="page-texture max-w-page px-gutter tablet:pt-7 tablet:pb-16 mx-auto min-h-screen w-full overflow-hidden pt-4.5 pb-10">
      <header className="border-paper/20 tablet:flex-row tablet:items-end tablet:justify-between tablet:gap-8 tablet:pt-3 tablet:pb-4 flex flex-col items-stretch gap-6 border-b pt-7 pb-5.5">
        <div>
          <Link className="text-copy-muted hover:text-paper focus-visible:text-paper tablet:mb-4 mb-6 inline-flex items-center gap-2 font-mono text-xs leading-none font-bold tracking-widest uppercase transition-colors focus-visible:outline-none" href={`/${season.slug}`}><span className="text-signal text-lg" aria-hidden="true">←</span> {season.name}</Link>
          <p className="text-signal mb-2 font-mono text-xs leading-none font-bold tracking-widest uppercase">Season {season.number}</p>
          <h1 className="font-display leading-display-title tablet:text-episode-title-tablet text-5xl font-black tracking-tight uppercase">{episode.label}</h1>
        </div>
        <nav className="border-paper/40 bg-panel tablet:inline-flex tablet:w-auto grid min-h-11 w-full grid-cols-[1fr_1.15fr_1fr] items-stretch border" aria-label="Episode controls">
          {previousEpisode ? <Button asChild variant="ghost" className="text-control hover:text-paper focus-visible:text-paper tablet:min-w-40 tablet:px-4 tablet:text-xs h-auto min-w-0 gap-2 rounded-none border-0 bg-transparent px-2 font-mono text-0 leading-none font-bold tracking-widest uppercase shadow-none hover:bg-white/5 focus-visible:bg-white/5"><Link href={episodeHref(previousEpisode.slug)}><RewindIcon /> Previous episode</Link></Button> : <Button variant="ghost" className="text-control-disabled tablet:min-w-40 tablet:px-4 tablet:text-xs h-auto min-w-0 gap-2 rounded-none border-0 bg-transparent px-2 font-mono text-0 leading-none font-bold tracking-widest uppercase shadow-none disabled:cursor-not-allowed disabled:opacity-100" disabled><RewindIcon /> Previous episode</Button>}
          <EpisodeSwitcher seasonSlug={season.slug} episodes={season.episodes} currentSlug={episode.slug} />
          {nextEpisode ? <Button asChild variant="ghost" className="text-control hover:text-paper focus-visible:text-paper tablet:min-w-40 tablet:px-4 tablet:text-xs h-auto min-w-0 gap-2 rounded-none border-0 bg-transparent px-2 font-mono text-0 leading-none font-bold tracking-widest uppercase shadow-none hover:bg-white/5 focus-visible:bg-white/5"><Link href={episodeHref(nextEpisode.slug)}>Next episode <FastForwardIcon /></Link></Button> : <Button variant="ghost" className="text-control-disabled tablet:min-w-40 tablet:px-4 tablet:text-xs h-auto min-w-0 gap-2 rounded-none border-0 bg-transparent px-2 font-mono text-0 leading-none font-bold tracking-widest uppercase shadow-none disabled:cursor-not-allowed disabled:opacity-100" disabled>Next episode <FastForwardIcon /></Button>}
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
