"use client";

import { dashboardRegistry } from "./dashboard-registry";
import type { EpisodeDashboardProps } from "./types";
import { YouTubePlayer } from "./youtube-player";

export function EpisodeDashboard(props: EpisodeDashboardProps) {
    const Dashboard = dashboardRegistry[props.seasonSlug];

    if (Dashboard) {
        return <Dashboard {...props} />;
    }

    return (
        <div className="mx-auto mt-6 w-full max-w-3xl">
            <YouTubePlayer
                label={props.label}
                title={props.title}
                videoId={props.videoId}
            />
        </div>
    );
}
