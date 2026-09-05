import { seasonEighteen } from "./season-18";
import { seasonNineteen } from "./season-19";
import { seasonFour } from "./season-4";
import { seasonNine } from "./season-9";
import type { LiveDashboard, SeasonDefinition } from "./season-types";

export const seasons = [
  {
    slug: "season-1",
    number: 1,
    name: "Connect Four Across America",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7z1fCZetTI8TPeLlgagF9v",
  },
  {
    slug: "season-2",
    number: 2,
    name: "Circumnavigation",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7rGYl6StHarkLlgeZX66oL",
  },
  {
    slug: "season-3",
    number: 3,
    name: "Tag Eur It",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC5B-l2FQNOPJVFpqF0QVxfG",
  },
  {
    slug: "season-4",
    number: 4,
    name: "Battle 4 America",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7ogXbMvwuBSfj3LHVRCqLc",
    attribution: [
      {
        label: "Canada",
        parts: [
          {
            text: "National boundary data from Natural Earth",
            href: "https://www.naturalearthdata.com/about/terms-of-use/",
          },
        ],
      },
      {
        label: "United States",
        parts: [
          {
            text: "State boundary data from Mike Bostock via Leaflet",
            href: "https://leafletjs.com/examples/choropleth/",
          },
        ],
      },
    ],
    liveDashboard: seasonFour,
  },
  {
    slug: "season-5",
    number: 5,
    name: "Race To The End Of The World",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC4SeH7qNw05wgU03HlRGiiS",
  },
  {
    slug: "season-6",
    number: 6,
    name: "Capture The Flag Across Japan",
    playlistUrl: "https://www.youtube.com/playlist?list=UULFxkM67T_Iele-mRVUiBkRqg",
  },
  {
    slug: "season-7",
    number: 7,
    name: "Tag Eur It 2",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC6wkQRczVE4Fz-4kUOIc3d1",
  },
  {
    slug: "season-8",
    number: 8,
    name: "Arctic Escape",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC6zyXJyImHgVdrC4Vl8SNG9",
  },
  {
    slug: "season-9",
    number: 9,
    name: "Hide + Seek",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7gTO_IVdiBv8nVPLKbqNa4",
    attribution: [
      {
        parts: [
          "Basemap tiles from ",
          { text: "CARTO", href: "https://carto.com/attribution/" },
          " · Basemap data from © ",
          {
            text: "OpenStreetMap contributors",
            href: "https://www.openstreetmap.org/copyright",
          },
        ],
      },
      {
        label: "Switzerland",
        parts: [
          {
            text: "Simplified national boundary data from geoBoundaries",
            href: "https://www.geoboundaries.org/",
          },
          ", licensed under ",
          {
            text: "CC BY 4.0",
            href: "https://creativecommons.org/licenses/by/4.0/",
          },
          " and modified for this application · ",
          {
            text: "Canton boundary data derived from © swisstopo, swissBOUNDARIES3D 2020",
            href: "https://www.swisstopo.admin.ch/en/landscape-model-swissboundaries3d",
          },
          " · ",
          {
            text: "Biogeographical region data from the Federal Office for the Environment (FOEN), Biogeographical regions of Switzerland",
            href: "https://opendata.swiss/en/dataset/biogeographische-regionen-der-schweiz-ch",
          },
          " · ",
          {
            text: "Rail-line geometry from SBB Infrastructure, Line (graphical), data.sbb.ch",
            href: "https://data.sbb.ch/explore/dataset/linie-mit-polygon/",
          },
          " · Rail-geometry from © ",
          {
            text: "OpenStreetMap contributors",
            href: "https://www.openstreetmap.org/copyright",
          },
          " via Overpass API",
        ],
      },
    ],
    liveDashboard: seasonNine,
  },
  {
    slug: "season-10",
    number: 10,
    name: "AU$TRALIA",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC4dhXkpNzUVsGFZp72v0UqL",
  },
  {
    slug: "season-11",
    number: 11,
    name: "Tag Eur It 3",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC56V3DHxfFVTMDzera__IFi",
  },
  {
    slug: "season-12",
    number: 12,
    name: "Hide + Seek: Japan",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC79KvPUh76PhFZ8x7q18hOW",
  },
  {
    slug: "season-13",
    number: 13,
    name: "Schengen Showdown",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC64gYhvs3PyyM_fRKpjq1l0",
  },
  {
    slug: "season-13-5",
    number: 13.5,
    name: "Hide and Seek Across NYC",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC5aiPqLOh4v2mGGxm2_gmu6",
  },
  {
    slug: "season-14",
    number: 14,
    name: "SnaKe",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC4ZwbTbCqICVjsZbgn80SaK",
  },
  {
    slug: "season-15",
    number: 15,
    name: "Tag: All Stars",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7X7UoXDLnT8pPbAH6a45jM",
  },
  {
    slug: "season-16",
    number: 16,
    name: "Hide & Seek: U.K.",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC5V7encRbWQdst2keI78jyL",
  },
  {
    slug: "season-17",
    number: 17,
    name: "Taiwan Rail Rush",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC7lbptiTx9d-eQLZuYvHeBm",
  },
  {
    slug: "season-18",
    number: 18,
    name: "Stateside Scramble",
    playlistUrl: "https://www.youtube.com/playlist?list=PLB7ZcpBcwdC4gFeZSxp55tgVXo4tJCsrv",
    attribution: [
      {
        parts: [
          "Basemap tiles from ",
          { text: "CARTO", href: "https://carto.com/attribution/" },
          " · Basemap data from © ",
          {
            text: "OpenStreetMap contributors",
            href: "https://www.openstreetmap.org/copyright",
          },
        ],
      },
      {
        label: "North America",
        parts: [
          "Road-route geometry from © ",
          {
            text: "OpenStreetMap contributors",
            href: "https://www.openstreetmap.org/copyright",
          },
          " via OSRM and Valhalla",
        ],
      },
      {
        label: "Canada",
        parts: [
          {
            text: "National boundary data from Natural Earth",
            href: "https://www.naturalearthdata.com/about/terms-of-use/",
          },
        ],
      },
      {
        label: "United States",
        parts: [
          {
            text: "State boundary data from Mike Bostock via Leaflet",
            href: "https://leafletjs.com/examples/choropleth/",
          },
          " · NYC transit route geometry from ",
          { text: "MTA", href: "https://new.mta.info/developers" },
          " · Chicago commuter-rail route geometry from ",
          {
            text: "Metra",
            href: "https://gtfs.metrarr.com/gtfsMETRA.zip",
          },
          " (data updated July 8, 2026; this product is not sponsored or operated by Metra) · Chicago rapid-transit route geometry from ",
          {
            text: "Chicago Transit Authority",
            href: "https://www.transitchicago.com/developers/gtfs/",
          },
          " · Philadelphia commuter-rail route geometry from ",
          { text: "SEPTA", href: "https://www3.septa.org/developer/" },
          " · Intercity rail route geometry from ",
          {
            text: "Amtrak",
            href: "https://content.amtrak.com/content/gtfs/GTFS.zip",
          },
          " · Washington Metro rail geometry from ",
          {
            text: "MD iMAP",
            href: "https://mdgeodata.md.gov/imap/rest/services/Transportation/MD_Transit/FeatureServer/8",
          },
          " and ",
          { text: "WMATA", href: "https://developer.wmata.com/" },
          " · Airport coordinate data from ",
          { text: "OurAirports", href: "https://ourairports.com/data/" },
        ],
      },
    ],
    liveDashboard: seasonEighteen,
  },
  {
    slug: "season-19",
    number: 19,
    name: "Japanorama",
    playlistUrl: "https://www.youtube.com/playlist?list=PLKPpLfWggWh0",
    attribution: [
      {
        parts: [
          "Basemap tiles from ",
          { text: "CARTO", href: "https://carto.com/attribution/" },
          " · Basemap data from © ",
          {
            text: "OpenStreetMap contributors",
            href: "https://www.openstreetmap.org/copyright",
          },
        ],
      },
      {
        label: "Japan",
        parts: [
          {
            text: "Simplified national boundary data from geoBoundaries",
            href: "https://www.geoboundaries.org/",
          },
          ", licensed under ",
          {
            text: "CC BY 4.0",
            href: "https://creativecommons.org/licenses/by/4.0/",
          },
          " and modified for this application · ",
          {
            text: "Prefecture boundary data from geoBoundaries",
            href: "https://www.geoboundaries.org/",
          },
          " (OpenStreetMap / Wambacher), licensed under the ",
          {
            text: "Open Data Commons Open Database License 1.0",
            href: "https://opendatacommons.org/licenses/odbl/1-0/",
          },
          " and modified for this application",
        ],
      },
    ],
    liveDashboard: seasonNineteen,
  },
] as const satisfies readonly SeasonDefinition[];

export type Season = (typeof seasons)[number];
type SupportedSeason = Extract<Season, { liveDashboard: LiveDashboard }>;
export type SupportedSeasonSlug = SupportedSeason["slug"];
export type AttributedSeason = Extract<Season, { attribution: unknown }>;

type ConfiguredEpisode = SupportedSeason["liveDashboard"]["episodes"][number];
export type EpisodeSlug = Extract<ConfiguredEpisode, { slug: string }>["slug"];

export const supportedSeasons = seasons.filter(isSupportedSeason);

export function isSupportedSeason(season: Season): season is SupportedSeason {
  return "liveDashboard" in season;
}

export function isAttributedSeason(season: Season): season is AttributedSeason {
  return "attribution" in season;
}

export function getSeason(slug: string) {
  return seasons.find((season) => season.slug === slug);
}

export function getSupportedSeason(slug: string) {
  const season = getSeason(slug);
  return season && isSupportedSeason(season) ? season : undefined;
}

export { isReleasedEpisode } from "./season-types";
export type { Episode, ReleasedEpisode, UpcomingEpisode } from "./season-types";
