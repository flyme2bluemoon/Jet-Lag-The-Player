import type { seasonNine } from "@/data/season-9";
import type { EpisodeTimestamp } from "@/lib/timestamps";

type SeasonNineEpisodeSlug =
    (typeof seasonNine.episodes)[number]["slug"];

export type SeasonNineEpisodeTimestamp =
    EpisodeTimestamp<SeasonNineEpisodeSlug>;
