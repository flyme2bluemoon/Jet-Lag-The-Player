export type SeasonTrailer = {
  /** Route segment for the trailer page, e.g. `season-19`. */
  slug: string;
  number: number;
  /** Season title, when it has been announced. */
  name?: string;
  tagline: string;
  /** YouTube video id for the trailer embed. */
  videoId: string;
  /** Path under `public/thumbnails/`, downloaded rather than hotlinked. */
  thumbnail: string;
  nebulaSeason: string;
  nebulaFirstEpisode: string;
  /** ISO 8601 instant, including the premiere's own UTC offset. */
  premiere: string;
};

export const seasonNineteenTrailer = {
  slug: "season-19",
  number: 19,
  name: "Japanorama",
  tagline: "The next Jet Lag season is almost here.",
  videoId: "lPPCjg79EyI",
  thumbnail: "/thumbnails/season-19/cover.jpg",
  nebulaSeason: "https://nebula.tv/jetlag/season/19",
  nebulaFirstEpisode: "https://nebula.tv/videos/jetlag-s19e1",
  premiere: "2026-08-19T10:30:00-04:00",
} as const satisfies SeasonTrailer;

export const seasonTrailers = [seasonNineteenTrailer] as const satisfies readonly SeasonTrailer[];

export function getSeasonTrailer(slug: string) {
  return seasonTrailers.find((trailer) => trailer.slug === slug);
}
