import type { TeamDefinition } from "@/components/episode/types";
import { MAPLIBRE_COLORS } from "@/components/ui/map-colors";

export const seasonEighteenTeamIds = ["ben-adam", "sam-amy"] as const;

export type TeamId = (typeof seasonEighteenTeamIds)[number];

// MapLibre paint expressions cannot resolve CSS custom properties.
export const seasonEighteenTeams = {
    "sam-amy": {
        name: "Sam & Amy",
        color: "var(--color-jet-lag-yellow)",
        mapColor: MAPLIBRE_COLORS.jetLagYellow,
    },
    "ben-adam": {
        name: "Ben & Adam",
        color: "var(--color-jet-lag-red)",
        mapColor: MAPLIBRE_COLORS.jetLagRed,
    },
} satisfies Record<TeamId, TeamDefinition>;
