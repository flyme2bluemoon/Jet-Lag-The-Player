export const seasonEighteenTeamIds = ["ben-adam", "sam-amy"] as const;

export type TeamId = (typeof seasonEighteenTeamIds)[number];

type Team = {
    name: string;
    color: string;
    mapColor: string;
};

// MapLibre paint expressions cannot resolve CSS custom properties.
export const seasonEighteenTeams = {
    "sam-amy": {
        name: "Sam & Amy",
        color: "var(--color-jet-lag-yellow)",
        mapColor: "#F5C25A",
    },
    "ben-adam": {
        name: "Ben & Adam",
        color: "var(--color-jet-lag-red)",
        mapColor: "#D94641",
    },
} satisfies Record<TeamId, Team>;
