import { seasonNineteen } from "@/data/season-19";
import { isReleasedEpisode } from "@/data/season-types";
import { compareTimestamps, createTimestampProjection } from "@/lib/timestamps";
import {
  seasonNineteenChallengeEvents,
  seasonNineteenChallenges,
  type SeasonNineteenChallenge,
  type SeasonNineteenTeamId,
} from "./timeline-data";

const season = {
  episodes: seasonNineteen.episodes.filter(isReleasedEpisode),
};

const attemptEvents = seasonNineteenChallengeEvents.filter(
  (event) => event.kind === "attempt-started" || event.kind === "attempt-ended",
);

export type SeasonNineteenActiveAttempt = {
  id: string;
  team: SeasonNineteenTeamId;
  challenge: SeasonNineteenChallenge;
};

export const resolveActiveChallenges = createTimestampProjection({
  season,
  boundaries: attemptEvents,
  project: (timestamp) => {
    const active = new Map<string, SeasonNineteenActiveAttempt>();

    for (const event of attemptEvents) {
      if (compareTimestamps(season, event, timestamp) > 0) break;

      if (event.kind === "attempt-started") {
        active.set(event.attempt, {
          id: event.attempt,
          team: event.team,
          challenge: seasonNineteenChallenges[event.challenge],
        });
      } else {
        active.delete(event.attempt);
      }
    }

    return [...active.values()];
  },
});
