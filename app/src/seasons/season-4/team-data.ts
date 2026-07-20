import type { TeamDefinition } from "@/components/episode/types";
import { MAPLIBRE_COLORS } from "@/components/ui/map-colors";

export const seasonFourTeamIds = ["sam-brian", "ben-adam"] as const;

export type TeamId = (typeof seasonFourTeamIds)[number];

export const seasonFourTeams = {
    "sam-brian": {
        name: "Sam & Brian",
        color: "var(--color-jet-lag-green)",
        mapColor: MAPLIBRE_COLORS.jetLagGreen,
    },
    "ben-adam": {
        name: "Ben & Adam",
        color: "var(--color-jet-lag-red)",
        mapColor: MAPLIBRE_COLORS.jetLagRed,
    },
} satisfies Record<TeamId, TeamDefinition>;
