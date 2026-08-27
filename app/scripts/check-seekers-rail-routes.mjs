import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const routesSource = readFileSync(
  new URL("../src/seasons/season-9/seekers-rail-routes.ts", import.meta.url),
  "utf8",
);
const serializedRoutes = routesSource.match(
  /const seekersRailRoutes = (\{[\s\S]*?\n\}) as const/,
)?.[1];

assert(serializedRoutes, "Could not read the Season 9 seekers rail routes");

const routes = JSON.parse(serializedRoutes);
const lucerneToArthGoldau = routes["e0248f8b-3ea0-4f30-b050-2179341437e5"];
const goeschenenToZug = routes["f07ed24d-70fe-457b-832b-0f061b89bfd5"];
const arthGoldauJunction = [8.55111, 47.04927];
const junctionIndex = goeschenenToZug.findIndex(
  ([longitude, latitude]) =>
    longitude === arthGoldauJunction[0] && latitude === arthGoldauJunction[1],
);

assert(junctionIndex >= 0, "The Arth-Goldau southbound junction is missing");

const lucerneViaArthGoldauToGoeschenen = [
  ...lucerneToArthGoldau,
  ...goeschenenToZug.slice(0, junctionIndex + 1).reverse(),
];

function projectedVector(from, to) {
  const averageLatitude = ((from[1] + to[1]) / 2) * (Math.PI / 180);
  return [
    (to[0] - from[0]) * Math.cos(averageLatitude),
    to[1] - from[1],
  ];
}

function turnAngle(previous, current, next) {
  const incoming = projectedVector(previous, current);
  const outgoing = projectedVector(current, next);
  const cosine =
    (incoming[0] * outgoing[0] + incoming[1] * outgoing[1]) /
    (Math.hypot(...incoming) * Math.hypot(...outgoing));

  return Math.acos(Math.max(-1, Math.min(1, cosine))) * (180 / Math.PI);
}

function assertNoBacktracking(name, route) {
  for (let index = 1; index < route.length - 1; index += 1) {
    const angle = turnAngle(route[index - 1], route[index], route[index + 1]);
    assert(
      angle < 150,
      `${name} backtracks at coordinate ${index} with a ${angle.toFixed(1)}° turn`,
    );
  }
}

assertNoBacktracking("Göschenen→Zug", goeschenenToZug);
assertNoBacktracking(
  "Lucerne→Arth-Goldau→Göschenen",
  lucerneViaArthGoldauToGoeschenen,
);

console.log("Season 9 seekers rail routes do not backtrack.");
