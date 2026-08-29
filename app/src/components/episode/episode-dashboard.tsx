"use client";

import { dashboardRegistry } from "./dashboard-registry";
import type { EpisodeDashboardProps } from "./types";

export function EpisodeDashboard(props: EpisodeDashboardProps) {
    const Dashboard = dashboardRegistry[props.seasonSlug];
    return <Dashboard {...props} />;
}
