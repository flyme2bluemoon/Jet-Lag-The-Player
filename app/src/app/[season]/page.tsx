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
    <main className="page-texture max-w-page px-gutter mx-auto min-h-screen w-full overflow-hidden pb-24">
      <header className="border-paper/20 md:min-h-56 relative flex min-h-64 items-end justify-between gap-10 overflow-hidden border-b pt-10 pb-8">
        <Link className="text-copy-muted hover:text-paper focus-visible:text-paper absolute top-10 left-0 z-2 flex items-center gap-2.5 font-mono text-xs leading-none font-bold tracking-widest uppercase transition-colors focus-visible:outline-none" href="/" aria-label="Back to all seasons"><span className="text-signal text-lg" aria-hidden="true">←</span> All seasons</Link>
        <div className="relative z-1">
          <p className="text-signal mb-2 font-mono text-xs leading-none font-bold tracking-widest uppercase">Season {season.number}</p>
          <h1 className="font-display text-season-title leading-display-title max-w-120 font-black tracking-tight uppercase md:max-w-none md:text-season-title-md">{season.name}</h1>
        </div>
        <div className="font-display text-season-number leading-season-number text-stroke-paper-subtle md:text-season-number-md absolute -right-2.5 bottom-5 select-none font-black tracking-tighter text-transparent opacity-70 md:static md:opacity-100" aria-hidden="true">{String(season.number).padStart(2, "0")}</div>
      </header>

      <section className="pt-8" aria-labelledby="episodes-title">
        <div className="mb-2 flex items-center gap-4"><span className="before:bg-paper/60 after:bg-paper/60 relative size-5.5 shrink-0 before:absolute before:left-1/2 before:h-full before:w-px before:content-[''] after:absolute after:top-1/2 after:h-px after:w-full after:content-['']" aria-hidden="true" /><h2 className="font-display tablet:text-3xl text-2xl whitespace-nowrap uppercase" id="episodes-title">Episodes</h2><span className="bg-paper/20 h-px flex-1" /></div>
        <div className="flex flex-col">
          {season.episodes.map((episode, index) => (
            <Link className="border-paper/15 hover:border-signal/70 focus-visible:border-signal/70 group grid min-w-0 grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-3.5 border-b py-3 transition-colors focus-visible:outline-none md:grid-cols-[clamp(180px,15.75vw,225px)_minmax(0,1fr)] md:gap-8 md:py-3.5" href={`/${season.slug}/${episode.slug}`} key={episode.video}>
              <div className="bg-surface relative aspect-video overflow-hidden rounded-lg md:rounded-xl">
                <Image className="object-contain transition-[filter] duration-200 group-hover:saturate-(--thumbnail-hover-saturation) group-focus-visible:saturate-(--thumbnail-hover-saturation)" src={episode.image} alt={`Thumbnail for ${episode.label}`} fill sizes="(max-width: 800px) 105px, 225px" priority={index < 2} />
              </div>
              <div className="relative min-w-0 md:py-2 md:pr-14">
                <h2 className="text-sm leading-snug font-medium tracking-tight md:text-episode-list-title"><span className="text-meta font-normal">{episode.label}:</span> {episode.title}</h2>
                <i className="border-signal after:border-signal absolute top-1/2 right-1 hidden h-3 w-7 translate-y-px border-t-2 opacity-0 transition after:absolute after:-top-1.5 after:right-0 after:size-2.5 after:rotate-45 after:border-t-2 after:border-r-2 after:content-[''] group-hover:translate-x-1 group-hover:opacity-100 group-focus-visible:translate-x-1 group-focus-visible:opacity-100 md:block" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
