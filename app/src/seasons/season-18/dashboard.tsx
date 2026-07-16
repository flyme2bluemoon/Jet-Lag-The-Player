import type { EpisodeDashboardProps } from "@/components/episode/types";
import { YouTubePlayer } from "@/components/episode/youtube-player";

export function SeasonEighteenDashboard({ label, title, videoId }: EpisodeDashboardProps) {
    return (
        <div className="mx-auto mt-6 w-full max-w-3xl">
            <YouTubePlayer label={label} title={title} videoId={videoId} />
        </div>
    );
}
