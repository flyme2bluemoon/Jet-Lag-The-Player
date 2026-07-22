import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardColumnRatio = readonly [left: number, video: number, right: number];

type DashboardGridProps = ComponentProps<"div"> & {
    left: ReactNode;
    video: ReactNode;
    right: ReactNode;
    wideColumnRatio?: DashboardColumnRatio;
};

type DashboardGridStyle = CSSProperties & Record<
    | "--dashboard-left-track"
    | "--dashboard-video-track"
    | "--dashboard-right-track",
    `${number}fr`
>;

const DEFAULT_WIDE_COLUMN_RATIO = [1, 1.15, 1] as const;

/**
 * Responsive dashboard shell. The video leads on small screens, sits in the
 * wider left column on desktop, and moves between the side lanes once the
 * dashboard itself is wide enough for three season-configurable columns.
 */
export function DashboardGrid({
    className,
    left,
    style,
    video,
    wideColumnRatio = DEFAULT_WIDE_COLUMN_RATIO,
    right,
    ...props
}: DashboardGridProps) {
    const dashboardStyle: DashboardGridStyle = {
        ...style,
        "--dashboard-left-track": `${wideColumnRatio[0]}fr`,
        "--dashboard-video-track": `${wideColumnRatio[1]}fr`,
        "--dashboard-right-track": `${wideColumnRatio[2]}fr`,
    };

    return (
        <div className="mx-auto mt-6 w-full">
            <div
                className={cn(
                    "grid w-full grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] 2xl:grid-cols-[minmax(0,var(--dashboard-left-track))_minmax(0,var(--dashboard-video-track))_minmax(0,var(--dashboard-right-track))]",
                    className,
                )}
                style={dashboardStyle}
                {...props}
            >
                <div className="flex min-w-0 flex-col gap-5 2xl:order-2">
                    {video}
                </div>

                <div className="flex min-w-0 flex-col gap-5 2xl:contents">
                    <div className="flex min-w-0 flex-col gap-5 2xl:order-1">
                        {left}
                    </div>
                    <div className="flex min-w-0 flex-col gap-5 2xl:order-3">
                        {right}
                    </div>
                </div>
            </div>
        </div>
    );
}
