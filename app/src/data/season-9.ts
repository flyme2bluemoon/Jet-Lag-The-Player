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
            image: "/thumbnails/season-9.jpg",
        },
        {
            slug: "episode-2",
            label: "Episode 2",
            title: "We Played Hide And Seek Across Switzerland — Ep. 2",
            video: "CkRXCvWptn4",
            image: "/thumbnails/season-9.jpg",
        },
        {
            slug: "episode-3",
            label: "Episode 3",
            title: "We Played Hide And Seek Across Switzerland — Ep. 3",
            video: "h5kDnrKG6OA",
            image: "/thumbnails/season-9.jpg",
        },
        {
            slug: "episode-4",
            label: "Episode 4",
            title: "We Played Hide And Seek Across Switzerland — Ep. 4",
            video: "62NKEFWavKA",
            image: "/thumbnails/season-9.jpg",
        },
        {
            slug: "episode-5",
            label: "Episode 5",
            title: "We Played Hide And Seek Across Switzerland — Ep. 5",
            video: "X13gVRwnKDA",
            image: "/thumbnails/season-9.jpg",
        },
    ],
} as const satisfies SeasonPage;
