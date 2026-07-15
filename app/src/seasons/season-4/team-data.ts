export const seasonFourTeamIds = ["sam-brian", "ben-adam"] as const;

export type TeamId = (typeof seasonFourTeamIds)[number];

type Team = {
    name: string;
    color: string;
};

export const seasonFourTeams = {
    "sam-brian": { name: "Sam & Brian", color: "#63A26B" },
    "ben-adam": { name: "Ben & Adam", color: "#DC4742" },
} satisfies Record<TeamId, Team>;
