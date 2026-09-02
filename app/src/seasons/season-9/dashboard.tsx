"use client";

import { useState } from "react";
import { DashboardGrid } from "@/components/episode/dashboard-grid";
import type { EpisodeDashboardProps } from "@/components/episode/types";
import { YouTubePlayer } from "@/components/episode/youtube-player";
import { seasonNine } from "@/data/season-9";
import { CurrentRunCard } from "./current-run-card";
import { CurseCard } from "./curse-card";
import { getSeasonNineGameState } from "./game-state";
import { InvestigationBookCard } from "./investigation-book-card";
import { LeaderboardCard } from "./leaderboard-card";

const WIDE_COLUMN_RATIO = [0.9, 0.95, 1.35] as const;

export function SeasonNineDashboard({ episodeSlug, label, title, videoId }: EpisodeDashboardProps) {
    const [currentTime, setCurrentTime] = useState(0);
    const episode = seasonNine.episodes.find(
        (candidate) => candidate.slug === episodeSlug,
    );

    if (!episode) {
        throw new RangeError(`Episode "${episodeSlug}" does not belong to Season 9.`);
    }

    const gameState = getSeasonNineGameState({
        episode: episode.slug,
        at: currentTime,
    });

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
                    <CurrentRunCard state={gameState.timeline} />
                    <CurseCard curse={gameState.timeline.activeCurse} />
                </>
            }
            middle={<LeaderboardCard state={gameState.timeline} />}
            right={(
                <InvestigationBookCard
                    seekersTrackerState={gameState.seekersTracker}
                    state={gameState.timeline}
                />
            )}
        />
    );
}
