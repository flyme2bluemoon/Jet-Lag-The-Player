"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedBudgetAmountProps = {
    value: number;
};

const animationDuration = 260;

function formatBudget(value: number) {
    return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function AnimatedBudgetAmount({ value }: AnimatedBudgetAmountProps) {
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
            const progress = Math.min((time - startTime) / animationDuration, 1);
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
    }, [value]);

    return <span aria-hidden="true">{formatBudget(displayValue)}</span>;
}
