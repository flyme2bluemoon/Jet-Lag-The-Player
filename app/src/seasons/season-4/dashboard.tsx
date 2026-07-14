"use client";

import { useState } from "react";
import type { EpisodeDashboardProps } from "@/components/episode/types";
import { YouTubePlayer } from "@/components/episode/youtube-player";
import { ClaimsCard } from "./claims-card";

export function SeasonFourDashboard({ episodeSlug, label, title, videoId }: EpisodeDashboardProps) {
    const [currentTime, setCurrentTime] = useState(0);

    return (
        <div className="mx-auto mt-6 grid w-full gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(24rem,.85fr)]">
            <YouTubePlayer
                label={label}
                title={title}
                videoId={videoId}
                onTimeChange={setCurrentTime}
            />
            <ClaimsCard episodeSlug={episodeSlug} currentTime={currentTime} />
        </div>
    );
}
