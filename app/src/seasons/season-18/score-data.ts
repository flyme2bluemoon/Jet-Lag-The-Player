import { seasonEighteen } from "@/data/season-18";
import {
    compareTimestamps,
    createTimestampProjection,
} from "@/lib/timestamps";
import type { TeamId } from "./team-data";
import type { SeasonEighteenEpisodeTimestamp } from "./types";

const AREA_TIEBREAK_REVEALED_AT = {
    episode: "episode-5",
    at: 29,
} satisfies SeasonEighteenEpisodeTimestamp;

export const FINAL_SCORE_REVEALED_AT = {
    episode: "finale",
    at: 42 * 60 + 43,
} satisfies SeasonEighteenEpisodeTimestamp;

const AREA_TIEBREAK_WINNER: TeamId = "sam-amy";

export type SeasonEighteenScore =
    | { phase: "connected-state" }
    | { phase: "area-tiebreak"; areaLeader: TeamId }
    | { phase: "final"; areaLeader: TeamId };

const scoreChangeBoundaries = [
    AREA_TIEBREAK_REVEALED_AT,
    FINAL_SCORE_REVEALED_AT,
];

export const getSeasonEighteenScore = createTimestampProjection({
    season: seasonEighteen,
    boundaries: scoreChangeBoundaries,
    project: (timestamp): SeasonEighteenScore => {
        const isFinal = compareTimestamps(
            seasonEighteen,
            timestamp,
            FINAL_SCORE_REVEALED_AT,
        ) >= 0;
        const isAreaTiebreakRevealed = compareTimestamps(
            seasonEighteen,
            timestamp,
            AREA_TIEBREAK_REVEALED_AT,
        ) >= 0;

        if (isFinal) {
            return { phase: "final", areaLeader: AREA_TIEBREAK_WINNER };
        }

        if (isAreaTiebreakRevealed) {
            return {
                phase: "area-tiebreak",
                areaLeader: AREA_TIEBREAK_WINNER,
            };
        }

        return { phase: "connected-state" };
    },
});
