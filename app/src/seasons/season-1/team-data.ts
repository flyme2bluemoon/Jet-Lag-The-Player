import type { TeamDefinition } from "@/components/episode/types";
import { MAPLIBRE_COLORS } from "@/components/ui/map-colors";

export const seasonOneTeamIds = ["sam-brian", "ben-adam"] as const;

export type TeamId = (typeof seasonOneTeamIds)[number];

export const seasonOneTeams = {
    "sam-brian": {
        name: "Sam & Brian",
        color: "var(--color-jet-lag-yellow)",
        mapColor: MAPLIBRE_COLORS.jetLagYellow,
    },
    "ben-adam": {
        name: "Ben & Adam",
        color: "var(--color-jet-lag-red)",
        mapColor: MAPLIBRE_COLORS.jetLagRed,
    },
} satisfies Record<TeamId, TeamDefinition>;
