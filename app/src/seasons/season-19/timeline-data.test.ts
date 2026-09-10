import { describe, expect, it } from "vitest";
import { seasonNineteen } from "@/data/season-19";
import { compareTimestamps } from "@/lib/timestamps";
import {
  seasonNineteenChallengeEvents,
  seasonNineteenChallenges,
  seasonNineteenHandEvents,
  seasonNineteenPlaces,
  seasonNineteenPrefectureUnlocks,
  seasonNineteenRewardCards,
  seasonNineteenTimelineBoundaries,
  seasonNineteenTeamLocations,
  type SeasonNineteenTeamId,
} from "./timeline-data";

const season = {
  episodes: seasonNineteen.episodes.filter((episode) => "slug" in episode),
};

describe("Season 19 timeline data", () => {
  it("provides finite map coordinates for every tracker place", () => {
    const referencedPlaces = new Set(
      Object.values(seasonNineteenTeamLocations).flatMap((events) =>
        events.flatMap((event) =>
          event.kind === "stationary" ? [event.place] : [event.from, event.to],
        ),
      ),
    );

    for (const placeId of referencedPlaces) {
      const coordinate = seasonNineteenPlaces[placeId].coordinate;
      expect(coordinate).toHaveLength(2);
      expect(coordinate.every(Number.isFinite)).toBe(true);
    }
  });

  it("keeps each team location route continuous and chronological", () => {
    for (const events of Object.values(seasonNineteenTeamLocations)) {
      for (const [index, event] of events.entries()) {
        if (index === 0) {
          expect(event.kind).toBe("stationary");
          continue;
        }

        const previous = events[index - 1]!;
        expect(compareTimestamps(season, event, previous)).toBeGreaterThan(0);
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
      expect(compareTimestamps(season, start!, end)).toBeLessThan(0);
    }
  });

  it("records a later completion graphic and matching prefecture unlock", () => {
    const completedAttempts = seasonNineteenChallengeEvents.filter(
      (event) => event.kind === "attempt-ended" && event.outcome === "completed",
    );
    const completions = seasonNineteenChallengeEvents.filter(
      (event) => event.kind === "completed",
    );

    expect(completedAttempts).toHaveLength(12);
    expect(completions).toHaveLength(12);
    expect(seasonNineteenPrefectureUnlocks).toHaveLength(14);

    for (const attempt of completedAttempts) {
      const completion = completions.find(
        (event) =>
          event.team === attempt.team && event.challenge === attempt.challenge,
      );

      expect(completion).toBeDefined();
      expect(
        compareTimestamps(season, completion!, attempt),
      ).toBeGreaterThanOrEqual(0);
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
      expect(seasonNineteenRewardCards[event.card].title.length).toBeGreaterThan(0);
      if (event.kind === "kept") {
        expect(hand.has(event.card)).toBe(false);
        hand.add(event.card);
      } else {
        expect(hand.has(event.card)).toBe(true);
        hand.delete(event.card);
      }
      expect(hand.size).toBeLessThanOrEqual(5);
    }

    expect([...hands.get("sam-ben")!]).toEqual([
      "curse-golden-carriage",
      "curse-forbidden-quest",
      "curse-reverse",
      "unlock-any-prefecture",
      "shinkansen-landlocked-prefecture",
    ]);
    expect([...hands.get("adam-tom")!]).toEqual([
      "shinkansen-45-minutes",
      "curse-reverse",
      "shinkansen-60-minutes",
      "reshuffle-challenges",
    ]);
  });

  it("keeps every event stream chronological across episode boundaries", () => {
    for (const events of [
      seasonNineteenChallengeEvents,
      seasonNineteenPrefectureUnlocks,
      seasonNineteenHandEvents,
      ...Object.values(seasonNineteenTeamLocations),
    ]) {
      for (const [index, event] of events.entries()) {
        expect(Number.isFinite(event.at)).toBe(true);
        expect(event.at).toBeGreaterThanOrEqual(0);
        if (index > 0) {
          expect(
            compareTimestamps(season, events[index - 1]!, event),
          ).toBeLessThanOrEqual(0);
        }
      }
    }
  });

  it("only attempts available challenges and can reveal a removed challenge again", () => {
    const board = new Set<string>();
    const attempts = new Set<string>();
    const seenAttempts = new Set<string>();

    for (const event of seasonNineteenChallengeEvents) {
      const challenge = seasonNineteenChallenges[event.challenge];
      expect(challenge.description.length).toBeGreaterThan(0);
      expect(challenge.cardPulls).toBeGreaterThan(0);

      switch (event.kind) {
        case "revealed":
          expect(board.has(event.challenge)).toBe(false);
          board.add(event.challenge);
          break;
        case "removed":
        case "completed":
          expect(board.delete(event.challenge)).toBe(true);
          break;
        case "attempt-started":
          expect(board.has(event.challenge)).toBe(true);
          expect(seenAttempts.has(event.attempt)).toBe(false);
          seenAttempts.add(event.attempt);
          attempts.add(event.attempt);
          break;
        case "attempt-ended":
          expect(attempts.delete(event.attempt)).toBe(true);
          break;
      }
      expect(board.size).toBeLessThanOrEqual(5);
    }

    expect([...board]).toEqual([
      "catch-a-fish",
      "taste-rice-at-rice-field",
      "taste-test-strawberries",
      "build-house-of-cards",
      "record-iconic-sound",
    ]);
    expect([...attempts]).toEqual(["sam-ben-house-of-cards-1"]);
  });

  it("carries the Episode 1 riddle attempt forward and does not duplicate the recap", () => {
    expect(seasonNineteenChallengeEvents).toContainEqual({
      episode: "episode-1",
      at: 4770,
      kind: "attempt-ended",
      attempt: "adam-tom-scavenger-3",
      team: "adam-tom",
      challenge: "japan-scavenger-hunt",
      outcome: "completed",
    });
    expect(seasonNineteenPrefectureUnlocks).toContainEqual({
      episode: "episode-1",
      at: 4773,
      team: "adam-tom",
      prefecture: "Miyazaki",
      challenge: "japan-scavenger-hunt",
    });
    expect(
      seasonNineteenChallengeEvents.filter(
        (event) =>
          event.kind === "attempt-started" &&
          event.attempt === "sam-ben-riddle-1",
      ),
    ).toHaveLength(1);
    expect(
      seasonNineteenChallengeEvents.filter(
        (event) =>
          event.episode === "episode-2" &&
          event.challenge === "japan-scavenger-hunt",
      ),
    ).toEqual([]);
  });

  it("records the five Episode 2 unlocks at completion graphics, before later card selections", () => {
    expect(
      seasonNineteenPrefectureUnlocks.filter(
        (event) => event.episode === "episode-2",
      ),
    ).toEqual([
      {
        episode: "episode-2",
        at: 535,
        team: "sam-ben",
        prefecture: "Fukuoka",
        challenge: "answer-riddle-under-bridge",
      },
      {
        episode: "episode-2",
        at: 1055,
        team: "adam-tom",
        prefecture: "Oita",
        challenge: "leave-prefecture-by-boat",
      },
      {
        episode: "episode-2",
        at: 2462,
        team: "sam-ben",
        prefecture: "Yamaguchi",
        challenge: "flip-remarkable-water",
      },
      {
        episode: "episode-2",
        at: 3198,
        team: "sam-ben",
        prefecture: "Hiroshima",
        challenge: "catvenger-hunt-part-deux",
      },
      {
        episode: "episode-2",
        at: 3993,
        team: "adam-tom",
        prefecture: "Ehime",
        challenge: "get-recognized",
      },
    ]);
    const episodeTwoHandEvents = seasonNineteenHandEvents.filter(
      (event) => event.episode === "episode-2",
    );
    expect(episodeTwoHandEvents).toHaveLength(5);
    expect(episodeTwoHandEvents.every((event) => event.kind === "kept")).toBe(true);
    expect(episodeTwoHandEvents.every((event) => event.at < 3993)).toBe(true);
  });

  it("records Episode 3's completion graphics, direct unlock, and mirrored unlock separately", () => {
    expect(seasonNineteenPrefectureUnlocks.filter(
      (event) => event.episode === "episode-3",
    )).toEqual([
      { episode: "episode-3", at: 961, team: "sam-ben", prefecture: "Okayama", challenge: "hide-at-japan-landscape" },
      { episode: "episode-3", at: 1259, team: "adam-tom", prefecture: "Kagawa", card: "unlock-any-prefecture" },
      { episode: "episode-3", at: 1957, team: "adam-tom", prefecture: "Okayama", challenge: "find-secret-spot-great-garden" },
      { episode: "episode-3", at: 2629, team: "sam-ben", prefecture: "Hyogo", challenge: "spot-partner-from-ropeway" },
      { episode: "episode-3", at: 2629, team: "adam-tom", prefecture: "Hyogo", challenge: "spot-partner-from-ropeway", card: "curse-magic-mirror" },
    ]);
    // Magic Mirror grants the result, not a second attempt or board removal.
    expect(seasonNineteenChallengeEvents.filter(
      (event) => event.episode === "episode-3" && event.kind === "completed",
    )).toHaveLength(3);
    for (const unlock of seasonNineteenPrefectureUnlocks) {
      if (!("card" in unlock)) continue;
      expect(seasonNineteenHandEvents.some(
        (event) => event.kind === "used" && event.team === unlock.team &&
          event.card === unlock.card && compareTimestamps(season, event, unlock) <= 0,
      )).toBe(true);
    }
  });

  it("keeps three selections from the tripled Episode 2 reward without duplicating its completion", () => {
    expect(seasonNineteenHandEvents.filter(
      (event) => event.episode === "episode-3" && event.at < 264,
    )).toEqual([
      { episode: "episode-3", at: 146, kind: "used", team: "adam-tom", card: "triple-reward-prefecture-ending-e" },
      { episode: "episode-3", at: 171, kind: "kept", team: "adam-tom", card: "shinkansen-opponent-prefecture" },
      { episode: "episode-3", at: 214, kind: "kept", team: "adam-tom", card: "curse-reverse" },
      { episode: "episode-3", at: 238, kind: "kept", team: "adam-tom", card: "shinkansen-60-minutes" },
    ]);
    expect(seasonNineteenChallengeEvents.filter(
      (event) => event.episode === "episode-3" && event.challenge === "get-recognized",
    )).toEqual([]);
    expect(seasonNineteenHandEvents.filter(
      (event) => event.episode === "episode-3" && event.kind === "kept",
    )).toHaveLength(7);
  });

  it("retains the Episode 2 hands when seeking backward from Episode 3", () => {
    function handAt(team: SeasonNineteenTeamId, at: number) {
      const hand = new Set<string>();
      for (const event of seasonNineteenHandEvents) {
        if (event.team !== team || compareTimestamps(season, event, { episode: "episode-3", at }) > 0) continue;
        if (event.kind === "kept") hand.add(event.card);
        else hand.delete(event.card);
      }
      return [...hand];
    }
    expect(handAt("adam-tom", 3604)).toEqual([
      "shinkansen-45-minutes", "curse-reverse", "shinkansen-60-minutes", "reshuffle-challenges",
    ]);
    expect(handAt("adam-tom", 0)).toEqual([
      "triple-reward-prefecture-ending-e", "shinkansen-45-minutes", "unlock-any-prefecture",
    ]);
    expect(handAt("sam-ben", 0)).toEqual([
      "curse-golden-carriage", "curse-forbidden-quest", "curse-reverse", "unlock-any-prefecture",
    ]);
    expect(handAt("adam-tom", 1258)).toContain("unlock-any-prefecture");
    expect(handAt("adam-tom", 1259)).not.toContain("unlock-any-prefecture");
    expect(handAt("sam-ben", 1510)).toContain("shinkansen-60-minutes");
    expect(handAt("sam-ben", 1511)).not.toContain("shinkansen-60-minutes");
  });

  it("ends the failed house attempt without awarding Osaka or inventing the next attempt", () => {
    expect(seasonNineteenChallengeEvents.filter(
      (event) => event.challenge === "build-house-of-cards" && event.kind === "attempt-ended",
    )).toEqual([{
      episode: "episode-3", at: 3582, kind: "attempt-ended", challenge: "build-house-of-cards",
      attempt: "adam-tom-house-of-cards-1", team: "adam-tom", outcome: "failed",
    }]);
    expect(seasonNineteenPrefectureUnlocks.map((event) => event.prefecture)).not.toContain("Osaka");
    expect(seasonNineteenTeamLocations["sam-ben"].at(-1)).toEqual({
      episode: "episode-3", at: 3603, kind: "stationary", place: "japanese-farmhouses-museum-house",
    });
    expect(seasonNineteenTeamLocations["adam-tom"].at(-1)).toEqual({
      episode: "episode-3", at: 3392, kind: "stationary", place: "japanese-farmhouses-museum-house",
    });
  });

  it("includes Episode 3 facts in all four independent boundary sets", () => {
    for (const [boundaries, records] of [
      [seasonNineteenTimelineBoundaries.teamLocations, Object.values(seasonNineteenTeamLocations).flat()],
      [seasonNineteenTimelineBoundaries.challengeBoard, seasonNineteenChallengeEvents],
      [seasonNineteenTimelineBoundaries.prefectureUnlocks, seasonNineteenPrefectureUnlocks],
      [seasonNineteenTimelineBoundaries.teamHands, seasonNineteenHandEvents],
    ] as const) {
      expect(boundaries.filter((event) => event.episode === "episode-3")).toEqual(
        records.filter((event) => event.episode === "episode-3").map(({ episode, at }) => ({ episode, at })),
      );
      expect(boundaries.filter((event) => event.episode === "episode-3").every(
        (event) => event.at <= 3604,
      )).toBe(true);
    }
  });
});
