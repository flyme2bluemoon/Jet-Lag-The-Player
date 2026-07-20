"use client";

import { useEffect, useRef } from "react";

type YouTubePlayerInstance = {
    destroy: () => void;
    getCurrentTime: () => number;
};

type YouTubePlayerStateChangeEvent = {
    data: number;
};

const YOUTUBE_PLAYER_STATE_PLAYING = 1;
const TIME_UPDATE_INTERVAL_MS = 250;

type YouTubeNamespace = {
    Player: new (
        element: HTMLElement,
        options: {
            videoId: string;
            playerVars: Record<string, number | string>;
            events: {
                onReady: () => void;
                onStateChange: (event: YouTubePlayerStateChangeEvent) => void;
            };
        },
    ) => YouTubePlayerInstance;
};

declare global {
    interface Window {
        YT?: YouTubeNamespace;
        onYouTubeIframeAPIReady?: () => void;
    }
}

type YouTubePlayerProps = {
    label: string;
    title: string;
    videoId: string;
    onTimeChange?: (seconds: number) => void;
};

export function YouTubePlayer({
    label,
    title,
    videoId,
    onTimeChange,
}: YouTubePlayerProps) {
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let player: YouTubePlayerInstance | null = null;
        let timer: ReturnType<typeof setInterval> | null = null;
        let cancelled = false;
        let isPlaying = false;

        const stopTimer = () => {
            if (!timer) return;
            clearInterval(timer);
            timer = null;
        };

        const emitCurrentTime = () => {
            if (!player || !onTimeChange) return;
            const nextTime = player.getCurrentTime();
            if (Number.isFinite(nextTime)) onTimeChange(nextTime);
        };

        const startTimer = () => {
            stopTimer();
            emitCurrentTime();

            if (!isPlaying || document.hidden || !onTimeChange) return;
            timer = setInterval(emitCurrentTime, TIME_UPDATE_INTERVAL_MS);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopTimer();
                return;
            }

            if (isPlaying) startTimer();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        const createPlayer = () => {
            if (cancelled || !hostRef.current || !window.YT) return;
            player = new window.YT.Player(hostRef.current, {
                videoId,
                playerVars: {
                    color: "white",
                    controls: 1,
                    enablejsapi: 1,
                    fs: 0,
                    iv_load_policy: 3,
                    origin: window.location.origin,
                    playsinline: 1,
                    rel: 0,
                },
                events: {
                    onReady: emitCurrentTime,
                    onStateChange: (event) => {
                        isPlaying = event.data === YOUTUBE_PLAYER_STATE_PLAYING;
                        if (isPlaying) {
                            startTimer();
                        } else {
                            emitCurrentTime();
                            stopTimer();
                        }
                    },
                },
            });
        };

        if (window.YT?.Player) {
            createPlayer();
        } else {
            const previousReady = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                previousReady?.();
                createPlayer();
            };

            if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
                const script = document.createElement("script");
                script.src = "https://www.youtube.com/iframe_api";
                script.async = true;
                document.head.appendChild(script);
            }
        }

        return () => {
            cancelled = true;
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
            stopTimer();
            player?.destroy();
        };
    }, [onTimeChange, videoId]);

    return (
        <section className="video-panel w-full" aria-label={`${label} video player`}>
            <div className="border-paper/35 bg-player tablet:rounded-lg tablet:border tablet:shadow-player relative aspect-video w-full overflow-hidden border-y">
                <div
                    ref={hostRef}
                    className="absolute inset-0 size-full [&>iframe]:size-full [&>iframe]:border-0"
                    title={`${label}: ${title}`}
                />
            </div>
        </section>
    );
}
