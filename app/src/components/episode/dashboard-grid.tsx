import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Responsive grid shell. Dashboard implementations define their own item
 * spans and placement so each season can use the layout that suits its cards.
 */
export function DashboardGrid({ className, ...props }: ComponentProps<"div">) {
    return (
        <div
            className={cn(
                "mx-auto mt-6 grid w-full grid-cols-1 items-start gap-5 lg:grid-cols-12",
                className,
            )}
            {...props}
        />
    );
}
