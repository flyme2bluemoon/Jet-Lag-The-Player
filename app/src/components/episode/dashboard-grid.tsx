import type { ReactNode } from "react";

type DashboardGridProps = {
    featured: ReactNode;
    primary?: ReactNode;
    secondary?: ReactNode;
};

/**
 * Responsive dashboard shell with independently packed card stacks.
 *
 * On wide screens, featured content leads the primary column, while the
 * secondary column starts alongside it. On smaller screens, secondary cards
 * follow the featured content so high-priority status stays near the video.
 */
export function DashboardGrid({ featured, primary, secondary }: DashboardGridProps) {
    return (
        <div className="mx-auto mt-6 flex w-full flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(24rem,.85fr)] lg:grid-rows-[auto_auto] lg:items-start">
            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
                {featured}
            </div>

            {secondary && (
                <div className="flex min-w-0 flex-col gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1">
                    {secondary}
                </div>
            )}

            {primary && (
                <div className="flex min-w-0 flex-col gap-5 lg:col-start-1 lg:row-start-2">
                    {primary}
                </div>
            )}
        </div>
    );
}
