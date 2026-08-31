"use client";

import { useState } from "react";
import { DashboardGrid } from "@/components/episode/dashboard-grid";
import type { EpisodeDashboardProps } from "@/components/episode/types";
import { YouTubePlayer } from "@/components/episode/youtube-player";
import { seasonFour } from "@/data/season-4";
import { BudgetCard } from "./budget-card";
import { ClaimsCard } from "./claims-card";
import { BattleStatusCard } from "./battle-status-card";
import { getSeasonFourGameState } from "./game-state";
import { PowerupsCard } from "./powerups-card";

const WIDE_COLUMN_RATIO = [3, 3, 4] as const;

export function SeasonFourDashboard({ episodeSlug, label, title, videoId }: EpisodeDashboardProps) {
    const [currentTime, setCurrentTime] = useState(0);
    const episode = seasonFour.episodes.find(
        (candidate) => candidate.slug === episodeSlug,
    );

    if (!episode) {
        throw new RangeError(`Episode "${episodeSlug}" does not belong to Season 4.`);
    }

    const gameState = getSeasonFourGameState({
        episode: episode.slug,
        at: currentTime,
    });

    return (
        <DashboardGrid
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
                <BudgetCard credits={gameState.travelBudgetCredits} />
            }
            middle={
                <>
                    <BattleStatusCard battle={gameState.battle} />
                    <PowerupsCard transactions={gameState.powerupTransactions} />
                </>
            }
            right={
                <ClaimsCard
                    challenges={gameState.challenges}
                    claimedStates={gameState.claimedStates}
                    hands={gameState.hands}
                    score={gameState.score}
                />
            }
        />
    );
}
