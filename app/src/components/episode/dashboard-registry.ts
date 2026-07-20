"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { SeasonSlug } from "@/data/season-pages";
import type { EpisodeDashboardProps } from "./types";

type DashboardComponent = ComponentType<EpisodeDashboardProps>;

export const dashboardRegistry: Partial<Record<SeasonSlug, DashboardComponent>> = {
    "season-4": dynamic(() =>
        import("@/seasons/season-4/dashboard").then(
            (module) => module.SeasonFourDashboard,
        ),
    ),
    "season-18": dynamic(() =>
        import("@/seasons/season-18/dashboard").then(
            (module) => module.SeasonEighteenDashboard,
        ),
    ),
};
