import { describe, expect, it } from "vitest";
import { getTrackerInterval } from "./tracker-engine";

describe("getTrackerInterval", () => {
    it("returns the same interval reference within a revision", () => {
        const first = getTrackerInterval("episode-1", 1000, "sam-amy");
        const sameRevision = getTrackerInterval("episode-1", 1000.25, "sam-amy");

        expect(sameRevision).toBe(first);
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

    it("keeps independent team projections on separate caches", () => {
        const samAmy = getTrackerInterval("episode-1", 1000, "sam-amy");
        const benAdam = getTrackerInterval("episode-1", 1000, "ben-adam");
        const samAmyAgain = getTrackerInterval("episode-1", 1000.5, "sam-amy");

        expect(samAmy.team).toBe("sam-amy");
        expect(benAdam.team).toBe("ben-adam");
        expect(samAmyAgain).toBe(samAmy);
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

    it("returns the earlier compiled interval after rewinding", () => {
        const earlier = getTrackerInterval("episode-1", 1000, "ben-adam");
        const later = getTrackerInterval("finale", 40 * 60, "ben-adam");
        const rewound = getTrackerInterval("episode-1", 1000, "ben-adam");

        expect(later).not.toBe(earlier);
        expect(later.id).not.toBe(earlier.id);
        // Snapshots are the compiled interval objects, so a rewind that lands
        // on the same revision returns the same reference.
        expect(rewound).toBe(earlier);
    });
});
