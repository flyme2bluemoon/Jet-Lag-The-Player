"use client";

import { DashboardGrid } from "@/components/episode/dashboard-grid";
import type { EpisodeDashboardProps } from "@/components/episode/types";
import { YouTubePlayer } from "@/components/episode/youtube-player";
import { GameBoardCard } from "./game-board-card";

export function SeasonNineteenDashboard({
  label,
  title,
  videoId,
}: EpisodeDashboardProps) {
  return (
    <DashboardGrid
      video={
        <YouTubePlayer label={label} title={title} videoId={videoId} />
      }
      left={null}
      middle={null}
      right={<GameBoardCard />}
    />
  );
}
