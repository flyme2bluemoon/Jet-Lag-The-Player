import type { SeasonPage } from "./season-pages";

export const seasonFour = {
  slug: "season-4",
  number: 4,
  name: "Battle 4 America",
  description: "Choose an episode from Jet Lag: The Game — Battle 4 America.",
  episodes: [
  { slug: "episode-1", label: "Episode 1", title: "We Raced To Visit The Most US States In 100 Hours", video: "E0ejkkFT3V0", image: "/thumbnails/season-4/episode-1.jpg" },
  { slug: "episode-2", label: "Episode 2", title: "We Raced To Visit The Most US States In 100 Hours", video: "idiCtICGlCA", image: "/thumbnails/season-4/episode-2.jpg" },
  { slug: "episode-3", label: "Episode 3", title: "We Raced To Visit The Most US States In 100 Hours", video: "qXJ0FRHHEZI", image: "/thumbnails/season-4/episode-3.jpg" },
  { slug: "episode-4", label: "Episode 4", title: "We Raced To Visit The Most US States In 100 Hours", video: "2NPGrKItt3E", image: "/thumbnails/season-4/episode-4.jpg" },
  { slug: "finale", label: "Finale", title: "We Raced To Visit The Most US States In 100 Hours", video: "RnSUaZEwYq4", image: "/thumbnails/season-4/finale.jpg" },
  ],
} as const satisfies SeasonPage;
