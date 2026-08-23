"use client";

import { useState } from "react";
import { DashboardGrid } from "@/components/episode/dashboard-grid";
import type { EpisodeDashboardProps } from "@/components/episode/types";
import { YouTubePlayer } from "@/components/episode/youtube-player";
import { ClaimsCard } from "./claims-card";
import { BudgetCard } from "./budget-card";

const WIDE_COLUMN_RATIO = [2, 5, 3] as const;

export function SeasonOneDashboard({ episodeSlug, label, title, videoId }: EpisodeDashboardProps) {
    const [currentTime, setCurrentTime] = useState(0);

    return (
        <DashboardGrid
            wideColumnRatio={WIDE_COLUMN_RATIO}
            video={
                    <YouTubePlayer
                        label={label}
                        title={title}
                        videoId={videoId}
                        onTimeChange={setCurrentTime}/>
            }
            left={
                <ClaimsCard episodeSlug={episodeSlug} currentTime={currentTime} />   
            }
            right={
                <BudgetCard episodeSlug={episodeSlug} currentTime={currentTime} />
            }
        />
    );
}
