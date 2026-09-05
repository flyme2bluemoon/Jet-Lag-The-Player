"use client";

import { useState } from "react";
import { seasonNineteen } from "@/data/season-19";
import { isReleasedEpisode } from "@/data/season-types";
import { ChallengesBoardCard } from "./challenges-board-card";
import { resolveChallengesBoard } from "./challenges-board";
import { DashboardGrid } from "@/components/episode/dashboard-grid";
import type { EpisodeDashboardProps } from "@/components/episode/types";
import { YouTubePlayer } from "@/components/episode/youtube-player";
import { GameBoardCard } from "./game-board-card";

export function SeasonNineteenDashboard({
  episodeSlug,
  label,
  title,
  videoId,
}: EpisodeDashboardProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const episode = seasonNineteen.episodes.filter(isReleasedEpisode).find(
    (candidate) => candidate.slug === episodeSlug,
  );
  if (!episode) throw new RangeError(`Unknown Season 19 episode: ${episodeSlug}`);
  const challenges = resolveChallengesBoard({ episode: episode.slug, at: currentTime });

  return (
    <DashboardGrid
      video={
        <>
          <YouTubePlayer label={label} title={title} videoId={videoId} onTimeChange={setCurrentTime} />
          <ChallengesBoardCard challenges={challenges} />
        </>
      }
      left={null}
      middle={null}
      right={<GameBoardCard />}
    />
  );
}
