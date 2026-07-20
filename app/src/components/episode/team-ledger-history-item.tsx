import type { ReactNode } from "react";
import { formatEpisodeLabel, formatTimestamp } from "@/lib/timestamps";

type TeamLedgerHistoryItemProps = {
    amount: ReactNode;
    amountLabel?: string;
    at: number;
    description: ReactNode;
    episode: string;
    icon: ReactNode;
    isCredit: boolean;
    wrapDescription?: boolean;
};

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
                    {formatEpisodeLabel(episode)} · {formatTimestamp(at)}
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
