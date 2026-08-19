"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";

type AttributionSeason = "season-4" | "season-9" | "season-18";

export function SiteFooter() {
  const attributionSeason = getAttributionSeason(usePathname());

  return (
    <footer className="max-w-page border-paper/15 px-gutter tablet:min-h-72 mx-auto flex min-h-64 w-full items-center gap-4 border-t py-10">
      <div className="border-paper/40 after:border-paper/25 relative hidden size-28 shrink-0 -rotate-6 place-content-center rounded-full border text-center after:absolute after:inset-2 after:rounded-full after:border after:border-dashed sm:grid">
        <span className="font-display text-4xl leading-none font-bold">18½</span>
        <small className="font-heading text-xs leading-tight font-bold uppercase">seasons<br />one world</small>
      </div>
      <div className="mx-auto flex min-w-0 max-w-2xl flex-1 flex-col items-center gap-3 text-center">
        <p className="text-footer-copy font-display text-base leading-none font-bold uppercase">Jet Lag: The Player</p>
        <div className="text-footer-copy/70 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-sm">
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
        {attributionSeason && <MapAttribution season={attributionSeason} />}
      </div>
      <div className="ml-auto shrink-0 sm:flex sm:w-28 sm:justify-end">
        <ThemeToggle />
      </div>
    </footer>
  );
}

function getAttributionSeason(pathname: string): AttributionSeason | null {
  const [season, episode, ...rest] = pathname.split("/").filter(Boolean);

  if (
    rest.length > 0 ||
    (!/^episode-\d+$/.test(episode ?? "") && episode !== "finale") ||
    (season !== "season-4" && season !== "season-9" && season !== "season-18")
  ) {
    return null;
  }

  return season;
}

function MapAttribution({ season }: { season: AttributionSeason }) {
  const usesCartoBasemap = season === "season-9" || season === "season-18";

  return (
    <div className="text-footer-copy/60 max-w-2xl space-y-1 font-sans text-xs leading-relaxed">
      <p className="text-footer-copy/75 font-heading text-sm font-bold uppercase">
        Map data sources
      </p>
      {usesCartoBasemap && (
        <p>
          Basemap tiles from {" "}
          <FooterLink href="https://carto.com/attribution/">CARTO</FooterLink>
          {" · Basemap data from © "}
          <FooterLink href="https://www.openstreetmap.org/copyright">
            OpenStreetMap contributors
          </FooterLink>
        </p>
      )}

      {season === "season-18" && (
        <p>
          <CountryLabel>North America</CountryLabel>{" "}
          Road-route geometry from © {" "}
          <FooterLink href="https://www.openstreetmap.org/copyright">
            OpenStreetMap contributors
          </FooterLink>
          {" via OSRM and Valhalla"}
        </p>
      )}

      {(season === "season-4" || season === "season-18") && (
        <p>
          <CountryLabel>Canada</CountryLabel>{" "}
          <FooterLink href="https://www.naturalearthdata.com/about/terms-of-use/">
            National boundary data from Natural Earth
          </FooterLink>
        </p>
      )}

      {season === "season-9" && (
        <p>
          <CountryLabel>Switzerland</CountryLabel>{" "}
          <FooterLink href="https://www.geoboundaries.org/">
            Simplified national boundary data from geoBoundaries
          </FooterLink>
          {", licensed under "}
          <FooterLink href="https://creativecommons.org/licenses/by/4.0/">
            CC BY 4.0
          </FooterLink>
          {" and modified for this application"}
          {" · "}
          <FooterLink href="https://www.swisstopo.admin.ch/en/landscape-model-swissboundaries3d">
            Canton boundary data derived from © swisstopo, swissBOUNDARIES3D 2020
          </FooterLink>
          {" · "}
          <FooterLink href="https://opendata.swiss/en/dataset/biogeographische-regionen-der-schweiz-ch">
            Biogeographical region data from the Federal Office for the Environment (FOEN), Biogeographical regions of Switzerland
          </FooterLink>
          {" · "}
          <FooterLink href="https://data.sbb.ch/explore/dataset/linie-mit-polygon/">
            Rail-line geometry from SBB Infrastructure, Line (graphical), data.sbb.ch
          </FooterLink>
          {" · Rail-geometry from © "}
          <FooterLink href="https://www.openstreetmap.org/copyright">
            OpenStreetMap contributors
          </FooterLink>
          {" via Overpass API"}
        </p>
      )}

      {(season === "season-4" || season === "season-18") && (
        <p>
          <CountryLabel>United States</CountryLabel>{" "}
          {season === "season-4" ? (
            <FooterLink href="https://leafletjs.com/examples/choropleth/">
              State boundary data from Mike Bostock via Leaflet
            </FooterLink>
          ) : (
            <>
              <FooterLink href="https://leafletjs.com/examples/choropleth/">
                State boundary data from Mike Bostock via Leaflet
              </FooterLink>
              {" · NYC transit route geometry from "}
              <FooterLink href="https://new.mta.info/developers">MTA</FooterLink>
              {" · Chicago commuter-rail route geometry from "}
              <FooterLink href="https://gtfs.metrarr.com/gtfsMETRA.zip">Metra</FooterLink>
              {" (data updated July 8, 2026; this product is not sponsored or operated by Metra) · Chicago rapid-transit route geometry from "}
              <FooterLink href="https://www.transitchicago.com/developers/gtfs/">
                Chicago Transit Authority
              </FooterLink>
              {" · Philadelphia commuter-rail route geometry from "}
              <FooterLink href="https://www3.septa.org/developer/">SEPTA</FooterLink>
              {" · Intercity rail route geometry from "}
              <FooterLink href="https://content.amtrak.com/content/gtfs/GTFS.zip">Amtrak</FooterLink>
              {" · Washington Metro rail geometry from "}
              <FooterLink href="https://mdgeodata.md.gov/imap/rest/services/Transportation/MD_Transit/FeatureServer/8">
                MD iMAP
              </FooterLink>
              {" and "}
              <FooterLink href="https://developer.wmata.com/">
                WMATA
              </FooterLink>
              {" · Airport coordinate data from "}
              <FooterLink href="https://ourairports.com/data/">
                OurAirports
              </FooterLink>
            </>
          )}
        </p>
      )}
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
