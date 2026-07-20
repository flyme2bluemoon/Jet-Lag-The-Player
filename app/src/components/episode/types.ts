import type { EpisodeSlug, SeasonSlug } from "@/data/season-pages";

export type EpisodeDashboardProps = {
    seasonSlug: SeasonSlug;
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
