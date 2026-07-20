import type { MapHexColor } from "@/components/episode/types";

/**
 * MapLibre cannot resolve CSS custom properties, so every required literal is
 * centralized here and mirrors the corresponding Tailwind theme color.
 */
export const MAPLIBRE_COLORS = {
    contrast: "#F4F0E9",
    jetLagBlue: "#204DAC",
    jetLagGreen: "#63A06A",
    jetLagNavyBlue: "#242F3F",
    jetLagRed: "#D94641",
    jetLagYellow: "#F5C25A",
    transparent: "rgba(0, 0, 0, 0)",
} as const satisfies Record<
    | "contrast"
    | "jetLagBlue"
    | "jetLagGreen"
    | "jetLagNavyBlue"
    | "jetLagRed"
    | "jetLagYellow",
    MapHexColor
> & { transparent: "rgba(0, 0, 0, 0)" };

export const MAPLIBRE_SCOREBOARD_COLORS = {
    light: {
        unavailableRegion: "#ddd9d1",
        unclaimedRegion: "#c9cac6",
        line: "#f4f0e9",
    },
    dark: {
        unavailableRegion: "#0b1a22",
        unclaimedRegion: "#233744",
        line: "#071722",
    },
} as const satisfies Record<
    "light" | "dark",
    Record<"unavailableRegion" | "unclaimedRegion" | "line", MapHexColor>
>;

export const MAPLIBRE_GEOJSON_DEFAULT_COLORS = {
    light: { fill: "#d4d4d4", line: "#ffffff" },
    dark: { fill: "#404040", line: "#171717" },
} as const satisfies Record<
    "light" | "dark",
    Record<"fill" | "line", MapHexColor>
>;
