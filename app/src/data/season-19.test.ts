import { describe, expect, it } from "vitest";
import { getSupportedSeason } from "./seasons";

describe("Season 19 configuration", () => {
  it("exposes two released episodes and one upcoming episode", () => {
    const season = getSupportedSeason("season-19");

    expect(season?.liveDashboard.episodes).toMatchObject([
      { slug: "episode-1", video: "Lhx1j6FShA8" },
      { slug: "episode-2", video: "CSksN3XLepQ" },
      { label: "Episode 3", title: "The Man on the Hill" },
    ]);
  });
});
