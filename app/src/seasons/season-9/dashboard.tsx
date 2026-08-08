"use client";

import { useMemo, useState } from "react";
import { DashboardGrid } from "@/components/episode/dashboard-grid";
import type { EpisodeDashboardProps } from "@/components/episode/types";
import { YouTubePlayer } from "@/components/episode/youtube-player";
import { CurrentRunCard } from "./current-run-card";
import { CurseCard } from "./curse-card";
import { InvestigationBookCard } from "./investigation-book-card";
import { LeaderboardCard } from "./leaderboard-card";
import { getSeasonNineState } from "./timeline-data";

const WIDE_COLUMN_RATIO = [0.9, 0.95, 1.35] as const;

export function SeasonNineDashboard({ episodeSlug, label, title, videoId }: EpisodeDashboardProps) {
    const [currentTime, setCurrentTime] = useState(0);
    const state = useMemo(
        () => getSeasonNineState(episodeSlug, currentTime),
        [currentTime, episodeSlug],
    );

    return (
        <DashboardGrid
            middleStack="left"
            wideBreakpoint="xl"
            wideColumnRatio={WIDE_COLUMN_RATIO}
            video={
                <YouTubePlayer
                    label={label}
                    title={title}
                    videoId={videoId}
                    onTimeChange={setCurrentTime}
                />
            }
            left={
                <>
                    <CurrentRunCard state={state} />
                    <CurseCard curse={state.activeCurse} />
                </>
            }
            middle={<LeaderboardCard state={state} />}
            right={<InvestigationBookCard state={state} />}
        />
    );
}
