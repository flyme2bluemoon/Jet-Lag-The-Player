import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardColumnRatio = readonly [
  left: number,
  middle: number,
  right: number,
];

type DashboardWideBreakpoint = "xl" | "2xl";

type DashboardGridProps = ComponentProps<"div"> & {
  left: ReactNode;
  middle: ReactNode;
  /** Which two-column stack the middle lane joins before the wide breakpoint. */
  middleStack?: "left" | "right";
  video: ReactNode;
  right: ReactNode;
  /** Screen width at which the dashboard opens up to three columns. */
  wideBreakpoint?: DashboardWideBreakpoint;
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
 * Tailwind needs whole class names at build time, so each wide-breakpoint
 * variant spells out its own set rather than composing a prefix.
 */
const WIDE_CLASSES = {
  xl: {
    grid: "xl:grid-cols-[minmax(0,var(--dashboard-left-track))_minmax(0,var(--dashboard-middle-track))_minmax(0,var(--dashboard-right-track))] xl:grid-rows-[auto_minmax(0,1fr)]",
    stack: "xl:contents",
    video: "xl:col-span-2 xl:col-start-1",
    left: "xl:col-start-1",
    middle: "xl:order-none xl:col-start-2 xl:row-start-2",
    right: "xl:order-none xl:col-start-3 xl:row-span-2 xl:row-start-1",
  },
  "2xl": {
    grid: "2xl:grid-cols-[minmax(0,var(--dashboard-left-track))_minmax(0,var(--dashboard-middle-track))_minmax(0,var(--dashboard-right-track))] 2xl:grid-rows-[auto_minmax(0,1fr)]",
    stack: "2xl:contents",
    video: "2xl:col-span-2 2xl:col-start-1",
    left: "2xl:col-start-1",
    middle: "2xl:order-none 2xl:col-start-2 2xl:row-start-2",
    right: "2xl:order-none 2xl:col-start-3 2xl:row-span-2 2xl:row-start-1",
  },
} as const satisfies Record<DashboardWideBreakpoint, Record<string, string>>;

/**
 * Responsive dashboard shell. The video leads on small screens, sits in the
 * wider left stack on desktop, and spans the first two columns once the
 * dashboard is wide enough for three season-configurable columns. Desktop
 * stacks flow independently, while the wide left, middle, and right lanes
 * remain one column wide.
 */
export function DashboardGrid({
  className,
  left,
  middle,
  middleStack = "right",
  style,
  video,
  wideBreakpoint = "2xl",
  wideColumnRatio = DEFAULT_WIDE_COLUMN_RATIO,
  right,
  ...props
}: DashboardGridProps) {
  const wide = WIDE_CLASSES[wideBreakpoint];
  const dashboardStyle: DashboardGridStyle = {
    ...style,
    "--dashboard-left-track": `${wideColumnRatio[0]}fr`,
    "--dashboard-middle-track": `${wideColumnRatio[1]}fr`,
    "--dashboard-right-track": `${wideColumnRatio[2]}fr`,
  };

  const middleLane = (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-5",
        middleStack === "right" && "lg:order-2",
        wide.middle,
      )}
    >
      {middle}
    </div>
  );

  return (
    <div className="mx-auto mt-6 w-full">
      <div
        className={cn(
          "grid w-full grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",
          wide.grid,
          className,
        )}
        style={dashboardStyle}
        {...props}
      >
        <div
          className={cn(
            "contents lg:col-start-1 lg:flex lg:min-w-0 lg:flex-col lg:gap-5",
            wide.stack,
          )}
        >
          <div
            className={cn(
              "flex min-w-0 flex-col gap-5 lg:col-start-1 lg:row-start-1",
              wide.video,
            )}
          >
            {video}
          </div>

          <div
            className={cn(
              "flex min-w-0 flex-col gap-5 lg:col-start-1 lg:row-start-2",
              wide.left,
            )}
          >
            {left}
          </div>

          {middleStack === "left" && middleLane}
        </div>

        <div
          className={cn(
            "contents lg:col-start-2 lg:flex lg:min-w-0 lg:flex-col lg:gap-5",
            wide.stack,
          )}
        >
          {middleStack === "right" && middleLane}
          <div
            className={cn(
              "flex min-w-0 flex-col gap-5 lg:order-1",
              wide.right,
            )}
          >
            {right}
          </div>
        </div>
      </div>
    </div>
  );
}
