import { describe, expect, it } from "vitest";
import { getSupportedSeason } from "./seasons";

describe("Season 19 configuration", () => {
  it("exposes three released episodes and Episode 4 as upcoming", () => {
    const season = getSupportedSeason("season-19");

    expect(season?.liveDashboard.episodes).toMatchObject([
      { slug: "episode-1", video: "Lhx1j6FShA8" },
      { slug: "episode-2", video: "CSksN3XLepQ" },
      { slug: "episode-3", video: "uzr_gkc81SQ" },
      {
        label: "Episode 4",
        title: "Bamboozled",
        image: "/thumbnails/season-19/episode-4.jpg",
      },
    ]);
  });
});
