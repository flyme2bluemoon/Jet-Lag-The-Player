import { seasonFour } from "./season-4";
import { seasonEighteen } from "./season-18";

type EpisodeDetails = {
  label: string;
  title: string;
  image: string;
};

export type ReleasedEpisode = EpisodeDetails & {
  slug: string;
  video: string;
};

export type UpcomingEpisode = EpisodeDetails & {
  slug?: never;
  video?: never;
};

export type Episode = ReleasedEpisode | UpcomingEpisode;

export type SeasonPage = {
  slug: string;
  number: number;
  name: string;
  episodes: readonly Episode[];
};

export const seasonPages = [seasonFour, seasonEighteen] as const satisfies readonly SeasonPage[];

export type SeasonSlug = (typeof seasonPages)[number]["slug"];
type ConfiguredEpisode = (typeof seasonPages)[number]["episodes"][number];
export type EpisodeSlug = Extract<ConfiguredEpisode, { slug: string }>["slug"];

export function isReleasedEpisode(episode: Episode): episode is ReleasedEpisode {
  return episode.slug !== undefined && episode.video !== undefined;
}

export function getSeasonPage(slug: string) {
  return seasonPages.find((season) => season.slug === slug);
}

export function getSeasonPageHref(number: number) {
  return seasonPages.find((season) => season.number === number)?.slug;
}
