"use client";

import { useState } from "react";
import { DashboardGrid } from "@/components/episode/dashboard-grid";
import type { EpisodeDashboardProps } from "@/components/episode/types";
import { YouTubePlayer } from "@/components/episode/youtube-player";
import { BudgetCard } from "./budget-card";
import { ClaimsCard } from "./claims-card";
import { GameStatusCard } from "./game-status-card";
import { PowerupsCard } from "./powerups-card";

export function SeasonFourDashboard({ episodeSlug, label, title, videoId }: EpisodeDashboardProps) {
    const [currentTime, setCurrentTime] = useState(0);

    return (
        <DashboardGrid
            featured={(
                <YouTubePlayer
                    label={label}
                    title={title}
                    videoId={videoId}
                    onTimeChange={setCurrentTime}
                />
            )}
            primary={(
                <>
                    <BudgetCard episodeSlug={episodeSlug} currentTime={currentTime} />
                    <PowerupsCard episodeSlug={episodeSlug} currentTime={currentTime} />
                </>
            )}
            secondary={(
                <>
                    <GameStatusCard episodeSlug={episodeSlug} currentTime={currentTime} />
                    <ClaimsCard episodeSlug={episodeSlug} currentTime={currentTime} />
                </>
            )}
        />
    );
}
