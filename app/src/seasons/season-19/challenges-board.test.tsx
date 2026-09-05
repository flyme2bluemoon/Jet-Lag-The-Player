import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { ChallengesBoardCard } from "./challenges-board-card";
import { resolveChallengesBoard } from "./challenges-board";
import { seasonNineteenChallengeEvents } from "./timeline-data";

const at = (seconds: number) => resolveChallengesBoard({ episode: "episode-1", at: seconds });

it("synchronizes reveals, completions, removals, and rewinds within five challenges", () => {
  expect(at(204)).toEqual([]);
  expect(at(205).map((challenge) => challenge.id)).toEqual(["catch-a-fish"]);
  expect(at(232)).toHaveLength(5);
  for (const event of seasonNineteenChallengeEvents) {
    expect(at(event.at).length).toBeLessThanOrEqual(5);
  }
  expect(at(1290).map((challenge) => challenge.id)).toContain("shoot-a-bullseye");
  expect(at(1291).map((challenge) => challenge.id)).not.toContain("shoot-a-bullseye");
  expect(at(1379).map((challenge) => challenge.id)).toContain("play-suikawari");
  expect(at(4416).map((challenge) => challenge.id)).toEqual([
    "catch-a-fish", "leave-prefecture-by-boat", "japan-scavenger-hunt",
  ]);
  expect(at(4529)).toHaveLength(5);
  expect(at(232).map((challenge) => challenge.id)).toContain("shoot-a-bullseye");
  expect(at(232)).toBe(at(1284));
  expect(at(0)).toEqual([]);
});

it("renders the visible challenge titles and card-pull rewards", () => {
  const challenges = at(232);
  const html = renderToStaticMarkup(createElement(ChallengesBoardCard, { challenges }));
  expect(html).toContain("Challenges Board");
  expect(html).not.toContain("5 / 5");
  expect(html.match(/<li /g)).toHaveLength(5);
  for (const challenge of challenges) {
    expect(html).toContain(challenge.title);
    expect(html).toContain(`>${challenge.cardPulls}</span>`);
  }
  expect(html).not.toContain("Card pulls");
  expect(html).not.toContain("<svg");
  for (const seconds of [0, 205, 1291, 4416]) {
    const slots = renderToStaticMarkup(createElement(ChallengesBoardCard, { challenges: at(seconds) }));
    expect(slots.match(/<li /g)).toHaveLength(5);
    expect(slots).not.toContain("Empty slot");
    expect(slots.match(/>\?<\/span>/g)).toHaveLength(5 - at(seconds).length);
    expect(slots.match(/data-slot="skeleton"/g)).toHaveLength(2 * (5 - at(seconds).length));
  }
});
