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

export const seasonPages: readonly SeasonPage[] = [seasonFour, seasonEighteen];

export function getSeasonPage(slug: string) {
  return seasonPages.find((season) => season.slug === slug);
}

export function getSeasonPageHref(number: number) {
  return seasonPages.find((season) => season.number === number)?.slug;
}
