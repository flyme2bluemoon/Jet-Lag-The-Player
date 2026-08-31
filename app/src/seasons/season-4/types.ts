import type { seasonFour } from "@/data/season-4";
import type { EpisodeTimestamp } from "@/lib/timestamps";

type SeasonFourEpisodeSlug =
    (typeof seasonFour.episodes)[number]["slug"];

export type SeasonFourEpisodeTimestamp =
    EpisodeTimestamp<SeasonFourEpisodeSlug>;
