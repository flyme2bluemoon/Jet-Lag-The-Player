"use client";

import { useState } from "react";
import { DashboardGrid } from "@/components/episode/dashboard-grid";
import type { EpisodeDashboardProps } from "@/components/episode/types";
import { YouTubePlayer } from "@/components/episode/youtube-player";
import { seasonEighteen } from "@/data/season-18";
import { BudgetCard } from "./budget-card";
import { GameBoardCard } from "./game-board-card";
import { getSeasonEighteenGameState } from "./game-state";
import { TrackerCard } from "./tracker-card";

const WIDE_COLUMN_RATIO = [3, 3, 4] as const;

export function SeasonEighteenDashboard({
    episodeSlug,
    label,
    title,
    videoId,
}: EpisodeDashboardProps) {
    const [currentTime, setCurrentTime] = useState(0);
    const episode = seasonEighteen.episodes.find(
        (candidate) => candidate.slug === episodeSlug,
    );

    if (!episode) {
        throw new RangeError(
            `Episode "${episodeSlug}" does not belong to Season 18.`,
        );
    }

    const gameState = getSeasonEighteenGameState({
        episode: episode.slug,
        at: currentTime,
    });

    return (
        <DashboardGrid
            narrowLead="right"
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
                <TrackerCard
                    episodeSlug={episode.slug}
                    currentTime={currentTime}
                    intervals={gameState.tracker}
                    mapFrame={gameState.mapFrame}
                />
            }
            middle={
                <BudgetCard transactions={gameState.budgetTransactions} />
            }
            right={
                <GameBoardCard
                    gameBoard={gameState.gameBoard}
                    score={gameState.score}
                />
            }
        />
    );
}
