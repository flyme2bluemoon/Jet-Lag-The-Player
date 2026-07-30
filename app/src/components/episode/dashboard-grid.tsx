import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardColumnRatio = readonly [
  left: number,
  middle: number,
  right: number,
];

type DashboardGridProps = ComponentProps<"div"> & {
  left: ReactNode;
  middle: ReactNode;
  video: ReactNode;
  right: ReactNode;
  wideColumnRatio?: DashboardColumnRatio;
};

type DashboardGridStyle = CSSProperties &
  Record<
    | "--dashboard-left-track"
    | "--dashboard-middle-track"
    | "--dashboard-right-track",
    `${number}fr`
  >;

const DEFAULT_WIDE_COLUMN_RATIO = [1, 1.15, 1] as const;

/**
 * Responsive dashboard shell. The video leads on small screens, sits in the
 * wider left stack on desktop, and spans the first two columns once the
 * dashboard is wide enough for three season-configurable columns. On
 * ultrawide screens, the video moves into the middle column, the right lane
 * moves left, and the two lanes that were below the video stack on the right.
 * Desktop stacks flow independently. Wide tracks use season-configurable
 * proportions, while the ultrawide layout uses a fixed 1:2:1 ratio.
 */
export function DashboardGrid({
  className,
  left,
  middle,
  style,
  video,
  wideColumnRatio = DEFAULT_WIDE_COLUMN_RATIO,
  right,
  ...props
}: DashboardGridProps) {
  const dashboardStyle: DashboardGridStyle = {
    ...style,
    "--dashboard-left-track": `${wideColumnRatio[0]}fr`,
    "--dashboard-middle-track": `${wideColumnRatio[1]}fr`,
    "--dashboard-right-track": `${wideColumnRatio[2]}fr`,
  };

  return (
    <div className="mx-auto mt-6 w-full">
      <div
        className={cn(
          "grid w-full grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] 2xl:grid-cols-[minmax(0,var(--dashboard-left-track))_minmax(0,var(--dashboard-middle-track))_minmax(0,var(--dashboard-right-track))] ultrawide:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]",
          className,
        )}
        style={dashboardStyle}
        {...props}
      >
        <div className="contents lg:col-start-1 lg:flex lg:min-w-0 lg:flex-col lg:gap-5 2xl:contents">
          <div className="flex min-w-0 flex-col gap-5 lg:col-start-1 lg:row-start-1 2xl:col-span-2 2xl:col-start-1 ultrawide:col-span-1 ultrawide:col-start-2 ultrawide:row-span-2 ultrawide:row-start-1">
            {video}
          </div>

          <div className="flex min-w-0 flex-col gap-5 lg:col-start-1 lg:row-start-2 2xl:col-start-1 ultrawide:col-start-3 ultrawide:row-start-1 ultrawide:self-stretch">
            {left}
          </div>
        </div>

        <div className="contents lg:col-start-2 lg:flex lg:min-w-0 lg:flex-col lg:gap-5 2xl:contents">
          <div className="flex min-w-0 flex-col gap-5 lg:order-2 2xl:order-none 2xl:col-start-2 2xl:row-start-2 ultrawide:col-start-3">
            {middle}
          </div>
          <div className="flex min-w-0 flex-col gap-5 lg:order-1 2xl:order-none 2xl:col-start-3 2xl:row-span-2 2xl:row-start-1 ultrawide:col-start-1">
            {right}
          </div>
        </div>
      </div>
    </div>
  );
}
