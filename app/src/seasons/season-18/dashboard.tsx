"use client";

import { useState } from "react";
import { DashboardGrid } from "@/components/episode/dashboard-grid";
import type { EpisodeDashboardProps } from "@/components/episode/types";
import { YouTubePlayer } from "@/components/episode/youtube-player";
import { BudgetCard } from "./budget-card";
import { GameBoardCard } from "./game-board-card";
import { TrackerCard } from "./tracker-card";
import { hasTrackerData } from "./tracker-data";

export function SeasonEighteenDashboard({
    episodeSlug,
    label,
    title,
    videoId,
}: EpisodeDashboardProps) {
    const [currentTime, setCurrentTime] = useState(0);
    return (
        <DashboardGrid>
            <div className="flex min-w-0 flex-col gap-5 lg:col-span-7">
                <YouTubePlayer
                    label={label}
                    title={title}
                    videoId={videoId}
                    onTimeChange={setCurrentTime}
                />
                <GameBoardCard episodeSlug={episodeSlug} currentTime={currentTime} />
            </div>

            <div className="flex min-w-0 flex-col gap-5 lg:col-span-5">
                <BudgetCard episodeSlug={episodeSlug} currentTime={currentTime} />
                {hasTrackerData(episodeSlug) ? (
                    <TrackerCard
                        episodeSlug={episodeSlug}
                        currentTime={currentTime}
                    />
                ) : null}
            </div>
        </DashboardGrid>
    );
}
