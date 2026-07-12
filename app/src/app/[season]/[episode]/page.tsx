import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
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
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <Link className="dashboard-back" href={`/${season.slug}`}><span aria-hidden="true">←</span> {season.name}</Link>
          <p>Season {season.number} · Dashboard</p>
          <h1>{episode.label}</h1>
        </div>
        <nav className="dashboard-controls" aria-label="Episode controls">
          {previousEpisode ? <Button asChild variant="ghost" className="episode-control h-auto rounded-none border-0 bg-transparent shadow-none"><Link href={episodeHref(previousEpisode.slug)}><RewindIcon /> Previous episode</Link></Button> : <Button variant="ghost" className="episode-control h-auto rounded-none border-0 bg-transparent shadow-none" disabled><RewindIcon /> Previous episode</Button>}
          <EpisodeSwitcher seasonSlug={season.slug} episodes={season.episodes} currentSlug={episode.slug} />
          {nextEpisode ? <Button asChild variant="ghost" className="episode-control h-auto rounded-none border-0 bg-transparent shadow-none"><Link href={episodeHref(nextEpisode.slug)}>Next episode <FastForwardIcon /></Link></Button> : <Button variant="ghost" className="episode-control h-auto rounded-none border-0 bg-transparent shadow-none" disabled>Next episode <FastForwardIcon /></Button>}
        </nav>
      </header>
      <section className="video-panel mx-auto mt-6 w-full md:w-1/2 xl:w-1/3" aria-label={`${episode.label} video player`}>
        <div className="video-frame"><iframe src={`https://www.youtube.com/embed/${episode.video}`} title={`${episode.label}: ${episode.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
      </section>
    </main>
  );
}
