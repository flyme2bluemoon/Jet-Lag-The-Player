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

export type LiveDashboard = {
  episodes: readonly Episode[];
};

export type AttributionLink = {
  text: string;
  href: string;
};

export type AttributionPart = string | AttributionLink;

export type AttributionParagraph = {
  label?: string;
  parts: readonly AttributionPart[];
};

export type SeasonAttribution = readonly AttributionParagraph[];

export type SeasonDefinition = {
  slug: string;
  number: number;
  name: string;
  playlistUrl: string;
  attribution?: SeasonAttribution;
  liveDashboard?: LiveDashboard;
};

export function isReleasedEpisode(episode: Episode): episode is ReleasedEpisode {
  return episode.slug !== undefined && episode.video !== undefined;
}
