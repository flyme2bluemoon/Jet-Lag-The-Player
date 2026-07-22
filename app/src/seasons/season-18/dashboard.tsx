"use client";

import { useState } from "react";
import { DashboardGrid } from "@/components/episode/dashboard-grid";
import type { EpisodeDashboardProps } from "@/components/episode/types";
import { YouTubePlayer } from "@/components/episode/youtube-player";
import { BudgetCard } from "./budget-card";
import { GameBoardCard } from "./game-board-card";
import { TrackerCard } from "./tracker-card";
import { hasTrackerData } from "./tracker-data";

const WIDE_COLUMN_RATIO = [8, 9, 7] as const;

export function SeasonEighteenDashboard({
    episodeSlug,
    label,
    title,
    videoId,
}: EpisodeDashboardProps) {
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
                <GameBoardCard episodeSlug={episodeSlug} currentTime={currentTime} />
            }
            right={
                hasTrackerData(episodeSlug) ? (
                    <TrackerCard
                        episodeSlug={episodeSlug}
                        currentTime={currentTime}
                    />
                ) : null
            }
        />
    );
}
