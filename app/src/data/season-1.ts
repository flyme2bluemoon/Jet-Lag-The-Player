import type { SeasonPage } from "./season-pages";

export const seasonOne = {
  slug: "season-1",
  number: 1,
  name: "Connect Four Across America",
  episodes: [
  { slug: "episode-1", label: "Episode 1", title: "We Played Connect 4 by Travelling to Actual US States", video: "oZSUxdzgA08", image: "/thumbnails/season-1/episode-1.jpg" },
  { slug: "episode-2", label: "Episode 2", title: "Flying 1,200 Miles to Ruin Our Boss' Plan - Connect 4 Across America", video: "LmjcQ9UoBjc", image: "/thumbnails/season-1/episode-2.jpg" },
  { slug: "finale", label: "Finale", title: "Our Flight Got Diverted at the Worst Possible Time - Connect 4 Across America", video: "DSuva0TtdYs", image: "/thumbnails/season-1/finale.jpg" },
  ],
} as const satisfies SeasonPage;
