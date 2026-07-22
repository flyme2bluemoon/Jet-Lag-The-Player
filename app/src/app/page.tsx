import Image from "next/image";
import { seasons, type Season } from "@/data/seasons";
import { getSeasonPageHref } from "@/data/season-pages";
import { cn } from "@/lib/utils";

function RouteMap({ className = "" }: { className?: string }) {
  return (
    <svg className={cn("absolute inset-0 size-full overflow-visible", className)} viewBox="0 0 800 360" aria-hidden="true">
      <path className="stroke-map-line fill-none stroke-1 opacity-25" d="M23 97c47-8 73 21 116 9 41-11 54-58 107-53 41 4 47 40 91 43 58 4 84-54 144-39 37 9 41 42 82 45 57 4 77-40 138-26 43 10 62 41 90 67M35 253c59 1 75-37 126-29 54 9 64 53 115 48 62-6 65-72 127-70 48 2 60 43 103 47 58 5 93-54 148-34 38 14 50 49 101 47" />
      <path className="stroke-signal fill-none stroke-2 [stroke-dasharray:8_8]" d="M27 277C99 188 134 318 211 222s143 17 216-89 142 84 337-82" />
      <g className="stroke-signal fill-none stroke-2"><path d="m104 243 13 13m0-13-13 13M406 137l13 13m0-13-13 13M675 78l13 13m0-13-13 13" /><circle cx="287" cy="211" r="8" /><circle cx="565" cy="131" r="8" /></g>
    </svg>
  );
}

function SeasonCard({ season }: { season: Season }) {
  const pageHref = getSeasonPageHref(season.number);
  const isAvailable = Boolean(pageHref);
  return (
    <a className={`border-paper/60 bg-panel hover:border-signal hover:shadow-card-hover focus-visible:border-signal focus-visible:shadow-card-hover group relative min-w-0 overflow-hidden rounded-lg border transition duration-200 hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline-none ${isAvailable ? "" : "grayscale opacity-45 hover:opacity-60 focus-visible:opacity-60"}`} href={pageHref ? `/${pageHref}` : season.playlist} target={isAvailable ? undefined : "_blank"} rel={isAvailable ? undefined : "noreferrer"} aria-label={`Season ${season.number}: ${season.name}${isAvailable ? "" : " — coming soon"}`}>
      <div className="border-paper/45 bg-surface relative aspect-video overflow-hidden border-b">
        <Image className="object-cover transition-[transform,filter] duration-500 group-hover:scale-(--season-card-hover-scale) group-hover:saturate-(--thumbnail-hover-saturation)" src={`/thumbnails/season-${season.number === 13.5 ? "13-5" : season.number}.${season.number === 17 ? "png" : "jpg"}`} alt={`YouTube playlist thumbnail for ${season.name}`} fill sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw" loading={season.number <= 3 ? "eager" : undefined} />
      </div>
      <div className="tablet:min-h-32 flex min-h-28 flex-col px-4.5 pt-4 pb-4">
        <h2 className="wide:text-xl max-w-9/10 font-sans text-lg leading-tight font-bold tracking-tight text-balance">Season {season.number}: {season.name}</h2>
        <div className="mt-auto flex items-center justify-between"><span className="text-card-meta font-sans text-xs leading-none font-bold tracking-widest uppercase">{isAvailable ? "Open Dashboard" : "Watch on YT (dashboard coming soon)"}</span><i className="border-signal after:border-signal relative h-3 w-7 translate-y-1 border-t-2 after:absolute after:-top-1.5 after:right-0 after:size-2.5 after:rotate-45 after:border-t-2 after:border-r-2" aria-hidden="true" /></div>
      </div>
    </a>
  );
}

export default function Home() {
  return (
    <main className="page-texture min-h-screen overflow-hidden">
      <section className="max-w-page px-gutter tablet:grid-cols-[1.2fr_.8fr] tablet:items-center wide:grid-cols-2 relative mx-auto grid min-h-100 grid-cols-1 items-start pt-10 pb-10" id="top">
        <div className="z-2">
          <h1 className="font-heading max-w-3xl text-[clamp(3.75rem,16vw,5.75rem)] tablet:text-[clamp(4.5rem,8.25vw,8rem)] leading-display-title font-bold tracking-tight uppercase">Jet Lag:<br /><span className="whitespace-nowrap">The Player</span></h1>
        </div>
        <div className="tablet:relative tablet:inset-auto tablet:h-80 tablet:opacity-100 absolute -right-28 -bottom-18 h-84 min-w-0 opacity-75" aria-hidden="true">
          <RouteMap />
          <div className="passport-stamps">
            <div className="passport-stamp stamp-usa bg-ink/70">
              <svg className="stamp-rim" viewBox="0 0 200 126">
                <defs><path id="usa-stamp-curve" d="M 22,65 A 78,48 0 0,1 178,65" /></defs>
                <text><textPath href="#usa-stamp-curve" startOffset="50%" textAnchor="middle">U.S. Customs and Border Protection</textPath></text>
              </svg>
              <small className="stamp-airport">JFK</small><b>Admitted</b><strong>DEC 14 2022</strong><small>B1/B2</small>
            </div>
            <div className="passport-stamp stamp-schengen bg-ink/70">
              <span className="stamp-country">CH</span><span className="stamp-plane">✈</span>
              <strong>06 · 03 · 24</strong><b>Zurich</b><span className="stamp-entry-arrow"><i>→</i></span>
            </div>
            <div className="passport-stamp stamp-japan bg-ink/70">
              <span className="stamp-plane">✈</span>
              <strong className="stamp-exit">出国</strong><b>Departed</b><span className="stamp-inspector">入国審査官-日本国</span><strong className="stamp-date">07 JUN 2023</strong><span className="stamp-airport-name">Narita (3)</span><small>Immigration</small>
            </div>
            <div className="passport-stamp stamp-uk bg-ink/70">
              <span>Immigration Officer</span><strong>24 DEC 2025</strong><b>Heathrow (5)</b><small>Leave to enter · 6 months</small>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-page px-gutter tablet:pt-0 mx-auto pt-6 pb-18" aria-labelledby="archive-title">
        <div className="mb-6 flex items-center gap-4"><span className="before:bg-paper/60 after:bg-paper/60 relative size-5.5 shrink-0 before:absolute before:left-1/2 before:h-full before:w-px after:absolute after:top-1/2 after:h-px after:w-full" aria-hidden="true" /><h2 className="font-heading tablet:text-3xl text-2xl font-bold tracking-normal whitespace-nowrap uppercase" id="archive-title">Seasons</h2><span className="bg-paper/20 h-px flex-1" /></div>
        <div className="tablet:grid-cols-2 tablet:gap-6 wide:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 grid grid-cols-1 gap-5">{seasons.map((season) => <SeasonCard key={season.number} season={season} />)}</div>
      </section>

    </main>
  );
}
