import type { EpisodeSlug, SupportedSeasonSlug } from "@/data/seasons";

export type EpisodeDashboardProps = {
    seasonSlug: SupportedSeasonSlug;
    episodeSlug: EpisodeSlug;
    label: string;
    title: string;
    videoId: string;
};

export type TailwindThemeColor = `var(--color-${string})`;
export type MapHexColor = `#${string}`;

export type TeamDefinition = {
    name: string;
    color: TailwindThemeColor;
    mapColor: MapHexColor;
};
