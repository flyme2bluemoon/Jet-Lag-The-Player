import type { ReactNode } from "react";
import { seasonFourEpisodeOrder } from "./state-claims";

type TeamLedgerHistoryItemProps = {
    amount: ReactNode;
    amountLabel?: string;
    at: number;
    description: ReactNode;
    episode: (typeof seasonFourEpisodeOrder)[number];
    icon: ReactNode;
    isCredit: boolean;
    wrapDescription?: boolean;
};

const episodeLabels: Record<(typeof seasonFourEpisodeOrder)[number], string> = {
    "episode-1": "EP 1",
    "episode-2": "EP 2",
    "episode-3": "EP 3",
    "episode-4": "EP 4",
    finale: "FINALE",
};

function formatTimestamp(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function TeamLedgerHistoryItem({
    amount,
    amountLabel,
    at,
    description,
    episode,
    icon,
    isCredit,
    wrapDescription = false,
}: TeamLedgerHistoryItemProps) {
    return (
        <>
            {icon}
            <div className="min-w-0">
                <p
                    className={wrapDescription
                        ? "wrap-break-words text-xs leading-snug font-bold whitespace-normal"
                        : "truncate text-xs font-bold"}
                >
                    {description}
                </p>
                <p className="text-card-meta text-4xs mt-0.5 font-sans font-bold tracking-wider uppercase">
                    {episodeLabels[episode]} · {formatTimestamp(at)}
                </p>
            </div>
            <span
                className={`font-sans text-sm font-bold tabular-nums ${isCredit ? "text-budget-credit" : "text-budget-debit"}`}
                aria-label={amountLabel}
            >
                {amount}
            </span>
        </>
    );
}
