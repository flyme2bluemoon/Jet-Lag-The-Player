import type { LiveDashboard } from "./season-types";

export const seasonNineteen = {
  episodes: [
    {
      slug: "episode-1",
      label: "Episode 1",
      title: "Never Believe in Yourself",
      video: "Lhx1j6FShA8",
      image: "/thumbnails/season-19/episode-1.jpg",
    },
    {
      slug: "episode-2",
      label: "Episode 2",
      title: "Is There a Catch?",
      video: "CSksN3XLepQ",
      image: "/thumbnails/season-19/episode-2.jpg",
    },
    {
      slug: "episode-3",
      label: "Episode 3",
      title: "The Man on the Hill",
      video: "uzr_gkc81SQ",
      image: "/thumbnails/season-19/episode-3.jpg",
    },
    {
      label: "Episode 4",
      title: "Bamboozled",
      image: "/thumbnails/season-19/episode-4.jpg",
    },
  ],
} as const satisfies LiveDashboard;
