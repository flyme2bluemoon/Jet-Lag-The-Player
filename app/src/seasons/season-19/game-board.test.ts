import { describe, expect, it } from "vitest";
import {
  resolveOccupiedOutlines,
  resolvePrefectureUnlocks,
  resolveTeamLocations,
} from "./game-board";

describe("Season 19 game board projections", () => {
  it("starts both teams stationary at Nishi-Ōyama in unlocked Kagoshima", () => {
    const locations = resolveTeamLocations({ episode: "episode-1", at: 0 });
    const unlocks = resolvePrefectureUnlocks({ episode: "episode-1", at: 0 });
    const outlines = resolveOccupiedOutlines(locations, unlocks);

    expect(locations["sam-ben"]).toMatchObject({
      kind: "stationary",
      place: "nishi-oyama-station",
      prefecture: "Kagoshima",
      label: "Nishi-Ōyama",
    });
    expect(locations["adam-tom"]).toMatchObject({
      kind: "stationary",
      place: "nishi-oyama-station",
      prefecture: "Kagoshima",
      label: "Nishi-Ōyama",
    });
    expect(unlocks.fills.size).toBe(0);
    expect(outlines["sam-ben"]).toBe("Kagoshima");
    expect(outlines["adam-tom"]).toBe("Kagoshima");
  });

  it("shows in-transit routes between place coordinates", () => {
    const locations = resolveTeamLocations({ episode: "episode-1", at: 200 });
    const samBen = locations["sam-ben"];

    expect(samBen.kind).toBe("in-transit");
    if (samBen.kind !== "in-transit") return;
    expect(samBen).toMatchObject({
      from: "nishi-oyama-station",
      to: "kagoshima-chuo-station",
      prefecture: "Kagoshima",
    });
    expect(samBen.route).toEqual([
      [130.57646, 31.1903],
      [130.5435, 31.58466],
    ]);
  });

  it("projects complete tracker states throughout Episode 3", () => {
    const opening = resolveTeamLocations({ episode: "episode-3", at: 0 });
    const ending = resolveTeamLocations({ episode: "episode-3", at: 3604 });

    expect(opening["sam-ben"]).toMatchObject({
      kind: "stationary",
      place: "saijo-station",
      coordinate: [132.7436714, 34.4313263],
    });
    expect(opening["adam-tom"]).toMatchObject({
      kind: "stationary",
      place: "matsuyama-city-station-area",
      coordinate: [132.7636738, 33.8362664],
    });
    expect(ending["sam-ben"]).toMatchObject({
      kind: "stationary",
      place: "japanese-farmhouses-museum-house",
      coordinate: [135.4885791, 34.7787771],
    });
    expect(ending["adam-tom"]).toMatchObject({
      kind: "stationary",
      place: "japanese-farmhouses-museum-house",
      coordinate: [135.4885791, 34.7787771],
    });
  });

  it("fills unlocked prefectures and drops outline once unlocked", () => {
    const before = resolvePrefectureUnlocks({ episode: "episode-1", at: 1290 });
    const after = resolvePrefectureUnlocks({ episode: "episode-1", at: 1291 });
    const locations = resolveTeamLocations({ episode: "episode-1", at: 1291 });
    const outlines = resolveOccupiedOutlines(locations, after);

    expect(before.fills.has("Kagoshima")).toBe(false);
    expect(after.fills.get("Kagoshima")).toEqual({
      kind: "single",
      team: "sam-ben",
    });
    expect(outlines["sam-ben"]).toBeNull();
    expect(outlines["adam-tom"]).toBe("Kagoshima");
  });

  it("stripes a prefecture unlocked by both teams", () => {
    const unlocks = resolvePrefectureUnlocks({ episode: "episode-1", at: 3386 });

    expect(unlocks.fills.get("Kagoshima")).toEqual({ kind: "striped" });
    expect(unlocks.fills.get("Kumamoto")).toEqual({
      kind: "single",
      team: "sam-ben",
    });
  });

  it("outlines Miyazaki while Adam & Tom are there without an unlock", () => {
    const locations = resolveTeamLocations({ episode: "episode-1", at: 4763 });
    const unlocks = resolvePrefectureUnlocks({ episode: "episode-1", at: 4763 });
    const outlines = resolveOccupiedOutlines(locations, unlocks);

    expect(locations["adam-tom"]).toMatchObject({
      kind: "stationary",
      place: "miyazaki-shrine",
      prefecture: "Miyazaki",
    });
    expect(outlines["adam-tom"]).toBe("Miyazaki");
  });
});
