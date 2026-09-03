"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { SupportedSeasonSlug } from "@/data/seasons";
import type { EpisodeDashboardProps } from "./types";

type DashboardComponent = ComponentType<EpisodeDashboardProps>;

export const dashboardRegistry: Record<SupportedSeasonSlug, DashboardComponent> = {
    "season-4": dynamic(() =>
        import("@/seasons/season-4/dashboard").then(
            (module) => module.SeasonFourDashboard,
        ),
    ),
    "season-9": dynamic(() =>
        import("@/seasons/season-9/dashboard").then(
            (module) => module.SeasonNineDashboard,
        ),
    ),
    "season-18": dynamic(() =>
        import("@/seasons/season-18/dashboard").then(
            (module) => module.SeasonEighteenDashboard,
        ),
    ),
    "season-19": dynamic(() =>
        import("@/seasons/season-19/dashboard").then(
            (module) => module.SeasonNineteenDashboard,
        ),
    ),
};
