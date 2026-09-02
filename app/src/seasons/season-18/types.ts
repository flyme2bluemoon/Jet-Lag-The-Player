import type { seasonEighteen } from "@/data/season-18";
import type { EpisodeTimestamp } from "@/lib/timestamps";

type SeasonEighteenEpisodeSlug =
    (typeof seasonEighteen.episodes)[number]["slug"];

export type SeasonEighteenEpisodeTimestamp =
    EpisodeTimestamp<SeasonEighteenEpisodeSlug>;
