import type { SeasonPage } from "./season-pages";

export const seasonEighteen = {
    slug: "season-18",
    number: 18,
    name: "Stateside Scramble",
    description: "Choose an episode from Jet Lag: The Game — Stateside Scramble.",
    episodes: [
        {
            slug: "episode-1",
            label: "Episode 1",
            title: "Hot Questions",
            video: "ozik7Ba4gkU",
            image: "/thumbnails/season-18/episode-1.jpg",
        },
        {
            slug: "episode-2",
            label: "Episode 2",
            title: "Seeking Bridges",
            video: "T42aB4OghFc",
            image: "/thumbnails/season-18/episode-2.jpg",
        },
        {
            slug: "episode-3",
            label: "Episode 3",
            title: "It’s 5 O’Clock Everywhere",
            video: "pW4N8ppO5sU",
            image: "/thumbnails/season-18/episode-3.jpg",
        },
        {
            slug: "episode-4",
            label: "Episode 4",
            title: "International Women’s Day",
            video: "om8wrIN7I5g",
            image: "/thumbnails/season-18/episode-4.jpg",
        },
        {
            slug: "episode-5",
            label: "Episode 5",
            title: "Bases Loaded",
            video: "QhEWeDT_9gI",
            image: "/thumbnails/season-18/episode-5.jpg",
        },
        {
            slug: "finale",
            label: "Finale",
            title: "Three to Win",
            video: "",
            image: "/thumbnails/season-18/finale.jpg",
        },
    ],
} as const satisfies SeasonPage;
