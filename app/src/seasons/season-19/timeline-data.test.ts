import { describe, expect, it } from "vitest";
import {
  seasonNineteenChallengeEvents,
  seasonNineteenHandEvents,
  seasonNineteenPrefectureUnlocks,
  seasonNineteenTeamLocations,
  type SeasonNineteenTeamId,
} from "./timeline-data";

describe("Season 19 timeline data", () => {
  it("keeps each team location route continuous and chronological", () => {
    for (const events of Object.values(seasonNineteenTeamLocations)) {
      for (const [index, event] of events.entries()) {
        if (index === 0) {
          expect(event.kind).toBe("stationary");
          continue;
        }

        const previous = events[index - 1]!;
        expect(event.at).toBeGreaterThan(previous.at);
        expect(event.kind).not.toBe(previous.kind);

        if (event.kind === "in-transit" && previous.kind === "stationary") {
          expect(event.from).toBe(previous.place);
        }

        if (event.kind === "stationary" && previous.kind === "in-transit") {
          expect(event.place).toBe(previous.to);
        }
      }
    }
  });

  it("pairs every ended challenge attempt with one earlier start", () => {
    const starts = new Map(
      seasonNineteenChallengeEvents
        .filter((event) => event.kind === "attempt-started")
        .map((event) => [event.attempt, event]),
    );
    const ends = seasonNineteenChallengeEvents.filter(
      (event) => event.kind === "attempt-ended",
    );

    expect(new Set(ends.map((event) => event.attempt)).size).toBe(ends.length);
    for (const end of ends) {
      const start = starts.get(end.attempt);
      expect(start).toBeDefined();
      expect(start?.team).toBe(end.team);
      expect(start?.challenge).toBe(end.challenge);
      expect(start?.at).toBeLessThan(end.at);
    }
  });

  it("records a later completion graphic and matching prefecture unlock", () => {
    const completedAttempts = seasonNineteenChallengeEvents.filter(
      (event) => event.kind === "attempt-ended" && event.outcome === "completed",
    );
    const completions = seasonNineteenChallengeEvents.filter(
      (event) => event.kind === "completed",
    );

    expect(completedAttempts).toHaveLength(3);
    expect(completions).toHaveLength(3);
    expect(seasonNineteenPrefectureUnlocks).toHaveLength(3);

    for (const attempt of completedAttempts) {
      const completion = completions.find(
        (event) =>
          event.team === attempt.team && event.challenge === attempt.challenge,
      );

      expect(completion).toBeDefined();
      expect(completion?.at).toBeGreaterThanOrEqual(attempt.at);
      expect(seasonNineteenPrefectureUnlocks).toContainEqual(
        expect.objectContaining({
          episode: completion?.episode,
          at: completion?.at,
          team: completion?.team,
          challenge: completion?.challenge,
        }),
      );
    }
  });

  it("uses only cards that the same team previously kept", () => {
    const hands = new Map<SeasonNineteenTeamId, Set<string>>([
      ["sam-ben", new Set()],
      ["adam-tom", new Set()],
    ]);

    for (const event of seasonNineteenHandEvents) {
      const hand = hands.get(event.team)!;
      if (event.kind === "kept") {
        hand.add(event.card);
      } else {
        expect(hand.has(event.card)).toBe(true);
        hand.delete(event.card);
      }
    }

    expect([...hands.get("sam-ben")!]).toEqual(["curse-golden-carriage"]);
    expect([...hands.get("adam-tom")!]).toEqual([
      "triple-reward-prefecture-ending-e",
    ]);
  });
});
