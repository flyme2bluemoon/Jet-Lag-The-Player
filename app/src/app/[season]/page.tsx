import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSeasonPage, seasonPages } from "@/data/season-pages";

type SeasonPageProps = { params: Promise<{ season: string }> };

export function generateStaticParams() {
  return seasonPages.map((season) => ({ season: season.slug }));
}

export async function generateMetadata({ params }: SeasonPageProps): Promise<Metadata> {
  const season = getSeasonPage((await params).season);
  return season
    ? { title: `Season ${season.number}: ${season.name} | Jet Lag: The Player`, description: season.description }
    : {};
}

export default async function SeasonPage({ params }: SeasonPageProps) {
  const season = getSeasonPage((await params).season);
  if (!season) notFound();

  return (
    <main className="season-page">
      <header className="season-header">
        <Link className="back-link" href="/" aria-label="Back to all seasons"><span aria-hidden="true">←</span> All seasons</Link>
        <div className="season-title">
          <p>Season {season.number}</p>
          <h1>{season.name}</h1>
        </div>
        <div className="season-number" aria-hidden="true">{String(season.number).padStart(2, "0")}</div>
      </header>

      <section className="episodes" aria-labelledby="episodes-title">
        <div className="section-heading"><span className="crosshair" aria-hidden="true" /><h2 id="episodes-title">Episodes</h2><span className="heading-line" /></div>
        <div className="episode-list">
          {season.episodes.map((episode, index) => (
            <Link className="episode-card" href={`/${season.slug}/${episode.slug}`} key={episode.video}>
              <div className="episode-image">
                <Image src={episode.image} alt={`Thumbnail for ${episode.label}`} fill sizes="(max-width: 800px) 105px, 225px" priority={index < 2} />
              </div>
              <div className="episode-meta">
                <h2><span>{episode.label}:</span> {episode.title}</h2>
                <i aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
