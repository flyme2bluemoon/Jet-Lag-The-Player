import { seasonNineteen } from "@/data/season-19";
import { isReleasedEpisode } from "@/data/season-types";
import { compareTimestamps, createTimestampProjection } from "@/lib/timestamps";
import {
  seasonNineteenChallengeEvents,
  seasonNineteenChallenges,
  type SeasonNineteenChallengeId,
} from "./timeline-data";

const season = {
  episodes: seasonNineteen.episodes.filter(isReleasedEpisode),
};
const boardEvents = seasonNineteenChallengeEvents.filter(
  (event) => event.kind === "revealed" || event.kind === "removed" || event.kind === "completed",
);

export const resolveChallengesBoard = createTimestampProjection({
  season,
  boundaries: boardEvents,
  project: (timestamp) => {
    const visible = new Set<SeasonNineteenChallengeId>();
    for (const event of boardEvents) {
      if (compareTimestamps(season, event, timestamp) > 0) break;
      if (event.kind === "revealed") visible.add(event.challenge);
      else visible.delete(event.challenge);
    }
    return [...visible].map((id) => seasonNineteenChallenges[id]);
  },
});
