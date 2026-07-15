"use client";

import { useState } from "react";
import { DashboardGrid } from "@/components/episode/dashboard-grid";
import type { EpisodeDashboardProps } from "@/components/episode/types";
import { YouTubePlayer } from "@/components/episode/youtube-player";
import { BudgetCard } from "./budget-card";
import { ClaimsCard } from "./claims-card";
import { BattleStatusCard } from "./battle-status-card";
import { PowerupsCard } from "./powerups-card";

export function SeasonFourDashboard({ episodeSlug, label, title, videoId }: EpisodeDashboardProps) {
    const [currentTime, setCurrentTime] = useState(0);

    return (
        <DashboardGrid className="lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div className="flex min-w-0 flex-col gap-5">
                <YouTubePlayer
                    label={label}
                    title={title}
                    videoId={videoId}
                    onTimeChange={setCurrentTime}
                />
                <BudgetCard episodeSlug={episodeSlug} currentTime={currentTime} />
            </div>

            <div className="flex min-w-0 flex-col gap-5">
                <BattleStatusCard episodeSlug={episodeSlug} currentTime={currentTime} />
                <ClaimsCard episodeSlug={episodeSlug} currentTime={currentTime} />
                <PowerupsCard episodeSlug={episodeSlug} currentTime={currentTime} />
            </div>
        </DashboardGrid>
    );
}
