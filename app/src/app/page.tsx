import Image from "next/image";
import { seasons, type Season } from "@/data/seasons";
import { getSeasonPageHref } from "@/data/season-pages";

function RouteMap({ className = "" }: { className?: string }) {
  return (
    <svg className={`route-map ${className}`} viewBox="0 0 800 360" aria-hidden="true">
      <path className="land" d="M23 97c47-8 73 21 116 9 41-11 54-58 107-53 41 4 47 40 91 43 58 4 84-54 144-39 37 9 41 42 82 45 57 4 77-40 138-26 43 10 62 41 90 67M35 253c59 1 75-37 126-29 54 9 64 53 115 48 62-6 65-72 127-70 48 2 60 43 103 47 58 5 93-54 148-34 38 14 50 49 101 47" />
      <path className="route" d="M27 277C99 188 134 318 211 222s143 17 216-89 142 84 337-82" />
      <g className="route-marks"><path d="m104 243 13 13m0-13-13 13M406 137l13 13m0-13-13 13M675 78l13 13m0-13-13 13" /><circle cx="287" cy="211" r="8" /><circle cx="565" cy="131" r="8" /></g>
    </svg>
  );
}

function SeasonCard({ season }: { season: Season }) {
  const pageHref = getSeasonPageHref(season.number);
  const isAvailable = Boolean(pageHref);
  return (
    <a className="season-card" href={pageHref ? `/${pageHref}` : season.playlist} target={isAvailable ? undefined : "_blank"} rel={isAvailable ? undefined : "noreferrer"} aria-label={`Season ${season.number}: ${season.name}${isAvailable ? "" : " — coming soon"}`}>
      <div className="thumbnail-wrap">
        <Image src={`/thumbnails/season-${season.number === 13.5 ? "13-5" : season.number}.${season.number === 17 ? "png" : "jpg"}`} alt={`YouTube playlist thumbnail for ${season.name}`} fill sizes="(max-width: 700px) 100vw, (max-width: 1050px) 50vw, 33vw" loading={season.number === 1 ? "eager" : undefined} />
      </div>
      <div className="card-content">
        <h2>Season {season.number}: {season.name}</h2>
        <div className="card-footer"><span>{isAvailable ? "Explore season" : "Coming soon"}</span><i aria-hidden="true" /></div>
      </div>
    </a>
  );
}

export default function Home() {
  return (
    <main>
      <section className="hero" id="top">
        <div className="hero-copy">
          <h1>Jet Lag:<br />The Player</h1>
        </div>
        <div className="hero-art" aria-hidden="true">
          <RouteMap />
          <div className="passport-stamps">
            <div className="passport-stamp stamp-usa bg-[#061724]/70">
              <svg className="stamp-rim" viewBox="0 0 200 126">
                <defs><path id="usa-stamp-curve" d="M 22,65 A 78,48 0 0,1 178,65" /></defs>
                <text><textPath href="#usa-stamp-curve" startOffset="50%" textAnchor="middle">U.S. Customs and Border Protection</textPath></text>
              </svg>
              <small className="stamp-airport">JFK</small><b>Admitted</b><strong>DEC 14 2022</strong><small>B1/B2</small>
            </div>
            <div className="passport-stamp stamp-schengen bg-[#061724]/70">
              <span className="stamp-country">CH</span><span className="stamp-plane">✈</span>
              <strong>06 · 03 · 24</strong><b>Zurich</b><span className="stamp-entry-arrow"><i>→</i></span>
            </div>
            <div className="passport-stamp stamp-japan bg-[#061724]/70">
              <span className="stamp-plane">✈</span>
              <strong className="stamp-exit">出国</strong><b>Departed</b><span className="stamp-inspector">入国審査官-日本国</span><strong className="stamp-date">07 JUN 2023</strong><span className="stamp-airport-name">Narita (3)</span><small>Immigration</small>
            </div>
            <div className="passport-stamp stamp-uk bg-[#061724]/70">
              <span>Immigration Officer</span><strong>24 DEC 2025</strong><b>Heathrow (5)</b><small>Leave to enter · 6 months</small>
            </div>
          </div>
        </div>
      </section>

      <section className="archive" aria-labelledby="archive-title">
        <div className="section-heading"><span className="crosshair" aria-hidden="true" /><h2 id="archive-title">Seasons</h2><span className="heading-line" /></div>
        <div className="season-grid">{seasons.map((season) => <SeasonCard key={season.number} season={season} />)}</div>
      </section>

      <footer>
        <div className="globe-stamp"><span>18½</span><small>seasons<br />one world</small></div>
        <RouteMap className="footer-map" />
        <p>Jet Lag: The Player</p>
      </footer>
    </main>
  );
}
