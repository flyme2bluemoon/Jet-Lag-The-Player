export type SeasonTrailer = {
  /** Route segment for the trailer page, e.g. `season-19`. */
  slug: string;
  number: number;
  /** Season title, when it has been announced. */
  name?: string;
  tagline: string;
  /** Replaces `tagline` once the YouTube premiere has passed. */
  releasedTagline: string;
  /** YouTube video id for the trailer embed. */
  videoId: string;
  /** Path under `public/thumbnails/`, downloaded rather than hotlinked. */
  thumbnail: string;
  nebulaSeason: string;
  nebulaFirstEpisode: string;
  /** ISO 8601 instant, including the premiere's own UTC offset. */
  nebulaPremiere: string;
  /** ISO 8601 instant, including the premiere's own UTC offset. */
  youtubePremiere: string;
};

export const seasonTrailers: readonly SeasonTrailer[] = [];
