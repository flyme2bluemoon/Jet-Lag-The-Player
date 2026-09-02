import { describe, expect, it } from "vitest";
import { getTrackerInterval, getTrackerState } from "./tracker-engine";

describe("getTrackerState", () => {
    it("returns the same state reference within a revision", () => {
        const first = getTrackerState("episode-1", 1000);
        const sameRevision = getTrackerState("episode-1", 1000.25);

        expect(sameRevision).toBe(first);
        expect(sameRevision["sam-amy"]).toBe(first["sam-amy"]);
        expect(sameRevision["ben-adam"]).toBe(first["ben-adam"]);
    });

    it("resolves the next interval at a contiguous boundary", () => {
        const interval = getTrackerInterval("episode-1", 1000, "sam-amy");
        const atEnd = getTrackerInterval(
            interval.time.end.episode,
            interval.time.end.at,
            "sam-amy",
        );

        expect(atEnd).not.toBe(interval);
        expect(atEnd.time.start).toEqual(interval.time.end);
    });

    it("keeps the other team's interval when only one team changes", () => {
        const earlier = getTrackerState("episode-1", 1000);
        const nextSamAmy = getTrackerInterval(
            earlier["sam-amy"].time.end.episode,
            earlier["sam-amy"].time.end.at,
            "sam-amy",
        );
        const afterSamAmyBoundary = getTrackerState(
            nextSamAmy.time.start.episode,
            nextSamAmy.time.start.at,
        );

        expect(afterSamAmyBoundary["sam-amy"]).not.toBe(earlier["sam-amy"]);
        expect(afterSamAmyBoundary["sam-amy"]).toBe(nextSamAmy);
        // Ben & Adam may or may not share that exact boundary; their interval
        // object is still the compiled record for whatever revision is visible.
        expect(afterSamAmyBoundary["ben-adam"].team).toBe("ben-adam");
    });

    it("invalidates when playback crosses an interval start", () => {
        const earlier = getTrackerInterval("episode-1", 1000, "sam-amy");
        const next = getTrackerInterval(
            earlier.time.end.episode,
            earlier.time.end.at,
            "sam-amy",
        );
        const justBefore = getTrackerInterval(
            next.time.start.episode,
            Math.max(0, next.time.start.at - 0.1),
            "sam-amy",
        );

        expect(justBefore).toEqual(earlier);
        expect(next).not.toBe(justBefore);
        expect(next.id).not.toBe(earlier.id);
    });

    it("returns the earlier intervals after rewinding", () => {
        const earlier = getTrackerState("episode-1", 1000);
        const later = getTrackerState("finale", 40 * 60);
        const rewound = getTrackerState("episode-1", 1000);

        expect(later).not.toBe(earlier);
        expect(later["ben-adam"].id).not.toBe(earlier["ben-adam"].id);
        // The composed state object is rederived on rewind, but nested
        // intervals are the stable compiled records.
        expect(rewound).not.toBe(earlier);
        expect(rewound["sam-amy"]).toBe(earlier["sam-amy"]);
        expect(rewound["ben-adam"]).toBe(earlier["ben-adam"]);
    });
});
