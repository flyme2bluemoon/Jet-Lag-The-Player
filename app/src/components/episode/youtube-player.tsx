"use client";

import { useEffect, useRef } from "react";

type YouTubePlayerInstance = {
    destroy: () => void;
    getAvailablePlaybackRates: () => number[];
    getCurrentTime: () => number;
    getDuration: () => number;
    getIframe: () => HTMLIFrameElement;
    getOption: (module: string, option: string) => unknown;
    getPlaybackRate: () => number;
    getPlayerState: () => number;
    isMuted: () => boolean;
    mute: () => void;
    pauseVideo: () => void;
    playVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    setOption: (module: string, option: string, value: unknown) => void;
    setPlaybackRate: (rate: number) => void;
    unMute: () => void;
};

type YouTubePlayerStateChangeEvent = {
    data: number;
};

const YOUTUBE_PLAYER_STATE_PLAYING = 1;
const TIME_UPDATE_INTERVAL_MS = 250;

type CaptionTrack = {
    languageCode: string;
};

function isCaptionTrack(value: unknown): value is CaptionTrack {
    return (
        typeof value === "object" &&
        value !== null &&
        "languageCode" in value &&
        typeof value.languageCode === "string"
    );
}

function isEditableTarget(target: EventTarget | null) {
    return (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
            target.matches("input, textarea, select, [role='textbox']"))
    );
}

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
        let isReady = false;
        let isPlaying = false;
        let lastCaptionTrack: CaptionTrack | null = null;

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

        const seekBy = (seconds: number) => {
            if (!player) return;
            const duration = player.getDuration();
            const nextTime = Math.max(
                0,
                Math.min(player.getCurrentTime() + seconds, duration),
            );
            player.seekTo(nextTime, true);
            emitCurrentTime();
        };

        const changePlaybackRate = (direction: -1 | 1) => {
            if (!player) return;
            const rates = player.getAvailablePlaybackRates();
            const currentRate = player.getPlaybackRate();
            const currentIndex = rates.indexOf(currentRate);
            const nextIndex = Math.max(
                0,
                Math.min(
                    currentIndex + direction,
                    rates.length - 1,
                ),
            );
            const nextRate = rates[nextIndex];
            if (nextRate !== undefined) player.setPlaybackRate(nextRate);
        };

        const toggleCaptions = () => {
            if (!player) return;
            const currentTrack = player.getOption("captions", "track");

            if (isCaptionTrack(currentTrack)) {
                lastCaptionTrack = currentTrack;
                player.setOption("captions", "track", {});
                return;
            }

            const trackList = player.getOption("captions", "tracklist");
            const firstTrack = Array.isArray(trackList)
                ? trackList.find(isCaptionTrack)
                : undefined;
            const nextTrack = lastCaptionTrack ?? firstTrack;
            if (nextTrack) player.setOption("captions", "track", nextTrack);
        };

        const toggleFullscreen = () => {
            if (!player) return;
            const iframe = player.getIframe();

            if (document.fullscreenElement) {
                void document.exitFullscreen();
            } else {
                void iframe.requestFullscreen();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                !player ||
                !isReady ||
                event.defaultPrevented ||
                event.ctrlKey ||
                event.metaKey ||
                event.altKey ||
                isEditableTarget(event.target)
            ) {
                return;
            }

            const key = event.key.toLowerCase();
            const target = event.target;
            const spaceActivatesControl =
                key === " " &&
                target instanceof HTMLElement &&
                target.matches("button, a, summary, [role='button']");
            if (spaceActivatesControl) return;

            let handled = true;

            switch (key) {
                case " ":
                case "k":
                    if (player.getPlayerState() === YOUTUBE_PLAYER_STATE_PLAYING) {
                        player.pauseVideo();
                    } else {
                        player.playVideo();
                    }
                    break;
                case "arrowleft":
                    seekBy(-5);
                    break;
                case "arrowright":
                    seekBy(5);
                    break;
                case "j":
                    seekBy(-10);
                    break;
                case "l":
                    seekBy(10);
                    break;
                case "<":
                    changePlaybackRate(-1);
                    break;
                case ">":
                    changePlaybackRate(1);
                    break;
                case "f":
                    toggleFullscreen();
                    break;
                case "c":
                    toggleCaptions();
                    break;
                case "m":
                    if (player.isMuted()) {
                        player.unMute();
                    } else {
                        player.mute();
                    }
                    break;
                default:
                    handled = false;
            }

            if (handled) event.preventDefault();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("keydown", handleKeyDown);

        const createPlayer = () => {
            if (cancelled || !hostRef.current || !window.YT) return;
            player = new window.YT.Player(hostRef.current, {
                videoId,
                playerVars: {
                    color: "white",
                    controls: 1,
                    enablejsapi: 1,
                    fs: 1,
                    iv_load_policy: 3,
                    origin: window.location.origin,
                    playsinline: 1,
                    rel: 0,
                },
                events: {
                    onReady: () => {
                        isReady = true;
                        emitCurrentTime();
                    },
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
            isReady = false;
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
            document.removeEventListener("keydown", handleKeyDown);
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
