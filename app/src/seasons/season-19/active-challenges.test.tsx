import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { ActiveChallengeCard } from "./active-challenge-card";
import { resolveActiveChallenges } from "./active-challenges";
import { seasonNineteenChallenges } from "./timeline-data";

const at = (seconds: number) =>
  resolveActiveChallenges({ episode: "episode-1", at: seconds });

it("tracks concurrent attempts across teams and keeps unfinished ones open", () => {
  expect(at(457)).toEqual([]);
  expect(at(458).map((attempt) => attempt.id)).toEqual([
    "adam-tom-scavenger-1",
  ]);
  expect(
    at(464).map((attempt) => [attempt.team, attempt.challenge.id]),
  ).toEqual([
    ["adam-tom", "japan-scavenger-hunt"],
    ["sam-ben", "japan-scavenger-hunt"],
  ]);
  expect(at(584)).toEqual([
    {
      id: "adam-tom-scavenger-1",
      team: "adam-tom",
      challenge: seasonNineteenChallenges["japan-scavenger-hunt"],
    },
  ]);
  expect(at(2561).map((attempt) => attempt.id)).toEqual([
    "adam-tom-suikawari-1",
    "sam-ben-batting-1",
  ]);
  expect(at(3127).map((attempt) => attempt.id)).toEqual([
    "adam-tom-suikawari-1",
  ]);
  expect(at(3958).map((attempt) => attempt.id)).toEqual([
    "adam-tom-scavenger-3",
  ]);
  expect(at(4561).map((attempt) => attempt.id)).toEqual([
    "adam-tom-scavenger-3",
    "sam-ben-riddle-1",
  ]);
  expect(at(464)).toBe(at(583));
  expect(at(0)).toEqual([]);
});

it("renders one Active Challenge card per attempt", () => {
  const attempts = at(2561);
  const html = renderToStaticMarkup(
    createElement(
      Fragment,
      null,
      ...attempts.map((attempt) =>
        createElement(ActiveChallengeCard, { key: attempt.id, attempt }),
      ),
    ),
  );

  expect(html.match(/Active Challenge/g)).toHaveLength(2);
  expect(html).toContain("Adam &amp; Tom");
  expect(html).toContain("Sam &amp; Ben");
  expect(html).toContain(seasonNineteenChallenges["play-suikawari"].title);
  expect(html).toContain(
    seasonNineteenChallenges["survive-the-batting-cage"].title,
  );
  expect(html).toContain("border-season-19-challenge");
  expect(html).toContain("text-season-19-challenge");
  expect(html.match(/>Description</g)).toHaveLength(2);
  expect(html).toContain('data-slot="collapsible"');
  expect(html).not.toContain("drawer");
  expect(html).toContain('aria-label="2 card pulls"');
  expect(html.match(/<section /g)).toHaveLength(2);
});
