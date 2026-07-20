import { seasonFour } from "./season-4";
import { seasonEighteen } from "./season-18";

export type Episode = {
  slug: string;
  label: string;
  title: string;
  video: string;
  image: string;
};

export type SeasonPage = {
  slug: string;
  number: number;
  name: string;
  description: string;
  episodes: readonly Episode[];
};

export const seasonPages = [seasonFour, seasonEighteen] as const satisfies readonly SeasonPage[];

export type SeasonSlug = (typeof seasonPages)[number]["slug"];
export type EpisodeSlug = (typeof seasonPages)[number]["episodes"][number]["slug"];

export function getSeasonPage(slug: string) {
  return seasonPages.find((season) => season.slug === slug);
}

export function getSeasonPageHref(number: number) {
  return seasonPages.find((season) => season.number === number)?.slug;
}
