"use client";

import { useState } from "react";
import { DashboardGrid } from "@/components/episode/dashboard-grid";
import type { EpisodeDashboardProps } from "@/components/episode/types";
import { YouTubePlayer } from "@/components/episode/youtube-player";
import { BudgetCard } from "./budget-card";
import { ClaimsCard } from "./claims-card";
import { BattleStatusCard } from "./battle-status-card";
import { PowerupsCard } from "./powerups-card";

const WIDE_COLUMN_RATIO = [3, 4, 3] as const;

export function SeasonFourDashboard({ episodeSlug, label, title, videoId }: EpisodeDashboardProps) {
    const [currentTime, setCurrentTime] = useState(0);

    return (
        <DashboardGrid
            wideColumnRatio={WIDE_COLUMN_RATIO}
            video={
                <>
                    <YouTubePlayer
                        label={label}
                        title={title}
                        videoId={videoId}
                        onTimeChange={setCurrentTime}
                    />
                    <BudgetCard episodeSlug={episodeSlug} currentTime={currentTime} />
                </>
            }
            left={
                <ClaimsCard episodeSlug={episodeSlug} currentTime={currentTime} />
            }
            right={
                <>
                    <BattleStatusCard episodeSlug={episodeSlug} currentTime={currentTime} />
                    <PowerupsCard episodeSlug={episodeSlug} currentTime={currentTime} />
                </>
            }
        />
    );
}
