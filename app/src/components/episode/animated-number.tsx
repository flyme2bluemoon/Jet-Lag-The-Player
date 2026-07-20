"use client";

import {
    useEffect,
    useRef,
    useState,
    type ComponentProps,
    type ReactNode,
} from "react";

type AnimatedNumberProps = Omit<ComponentProps<"span">, "children"> & {
    duration?: number;
    formatValue: (value: number) => ReactNode;
    value: number;
};

const defaultAnimationDuration = 260;

export function AnimatedNumber({
    duration = defaultAnimationDuration,
    formatValue,
    value,
    ...props
}: AnimatedNumberProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const displayValueRef = useRef(value);

    useEffect(() => {
        let animationFrame = 0;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            animationFrame = requestAnimationFrame(() => {
                displayValueRef.current = value;
                setDisplayValue(value);
            });
            return () => cancelAnimationFrame(animationFrame);
        }

        const startValue = displayValueRef.current;
        if (startValue === value) return;

        let startTime: number | undefined;

        const animate = (time: number) => {
            startTime ??= time;
            const progress = Math.min((time - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const nextValue = startValue + (value - startValue) * easedProgress;

            displayValueRef.current = nextValue;
            setDisplayValue(nextValue);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                displayValueRef.current = value;
                setDisplayValue(value);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [duration, value]);

    return <span {...props}>{formatValue(displayValue)}</span>;
}
