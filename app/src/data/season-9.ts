import type { SeasonPage } from "./season-pages";

export const seasonNine = {
    slug: "season-9",
    number: 9,
    name: "Hide + Seek",
    episodes: [
        {
            slug: "episode-1",
            label: "Episode 1",
            title: "We Played Hide And Seek Across Switzerland",
            video: "E8UmTJVDnUI",
            image: "/thumbnails/season-9/episode-1.jpg",
        },
        {
            slug: "episode-2",
            label: "Episode 2",
            title: "We Played Hide And Seek Across Switzerland",
            video: "CkRXCvWptn4",
            image: "/thumbnails/season-9/episode-2.jpg",
        },
        {
            slug: "episode-3",
            label: "Episode 3",
            title: "We Played Hide And Seek Across Switzerland",
            video: "h5kDnrKG6OA",
            image: "/thumbnails/season-9/episode-3.jpg",
        },
        {
            slug: "episode-4",
            label: "Episode 4",
            title: "We Played Hide And Seek Across Switzerland",
            video: "62NKEFWavKA",
            image: "/thumbnails/season-9/episode-4.jpg",
        },
        {
            slug: "finale",
            label: "Finale",
            title: "We Played Hide And Seek Across Switzerland",
            video: "X13gVRwnKDA",
            image: "/thumbnails/season-9/finale.jpg",
        },
    ],
} as const satisfies SeasonPage;
