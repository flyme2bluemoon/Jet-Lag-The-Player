import type { PlayerId } from "./timeline-data";

export const seasonNinePlayers = {
    sam: { name: "Sam", color: "var(--color-jet-lag-yellow)" },
    adam: { name: "Adam", color: "var(--color-jet-lag-green)" },
    ben: { name: "Ben", color: "var(--color-jet-lag-red)" },
} as const satisfies Record<PlayerId, { name: string; color: string }>;
