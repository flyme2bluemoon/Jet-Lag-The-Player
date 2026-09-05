import type { TeamDefinition } from "@/components/episode/types";
import { MAPLIBRE_COLORS } from "@/components/ui/map-colors";
import type { SeasonNineteenTeamId } from "./timeline-data";

export const seasonNineteenTeamIds = ["sam-ben", "adam-tom"] as const satisfies readonly SeasonNineteenTeamId[];

export const seasonNineteenTeams = {
  "sam-ben": {
    name: "Sam & Ben",
    color: "var(--color-jet-lag-yellow)",
    mapColor: MAPLIBRE_COLORS.jetLagYellow,
  },
  "adam-tom": {
    name: "Adam & Tom",
    color: "var(--color-jet-lag-red)",
    mapColor: MAPLIBRE_COLORS.jetLagRed,
  },
} satisfies Record<SeasonNineteenTeamId, TeamDefinition>;
