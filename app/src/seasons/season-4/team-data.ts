export const seasonFourTeamIds = ["sam-brian", "ben-adam"] as const;

export type TeamId = (typeof seasonFourTeamIds)[number];

type Team = {
    name: string;
    color: string;
    mapColor: string;
};

export const seasonFourTeams = {
    "sam-brian": {
        name: "Sam & Brian",
        color: "var(--color-jet-lag-green)",
        mapColor: "#63A06A",
    },
    "ben-adam": {
        name: "Ben & Adam",
        color: "var(--color-jet-lag-red)",
        mapColor: "#D94641",
    },
} satisfies Record<TeamId, Team>;
