import { SeasonFourDashboard } from "@/seasons/season-4/dashboard";
import { SeasonEighteenDashboard } from "@/seasons/season-18/dashboard";
import type { EpisodeDashboardProps } from "./types";
import { YouTubePlayer } from "./youtube-player";

export function EpisodeDashboard(props: EpisodeDashboardProps) {
    if (props.seasonSlug === "season-4") {
        return <SeasonFourDashboard {...props} />;
    }

    if (props.seasonSlug === "season-18") {
        return <SeasonEighteenDashboard {...props} />;
    }

    return (
        <div className="mx-auto mt-6 w-full max-w-3xl">
            <YouTubePlayer
                label={props.label}
                title={props.title}
                videoId={props.videoId}
            />
        </div>
    );
}
