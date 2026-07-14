"use client";

import { useMemo } from "react";
import { Map, MapGeoJSON, MapMarker, MarkerContent } from "@/components/ui/map";
import { getStateOwners, type TeamId } from "./state-claims";

const US_STATES_GEOJSON = "/seasons/season-4/geojson/us-states.geojson";
const CANADA_GEOJSON = "/seasons/season-4/geojson/canada.geojson";

const teams: Record<TeamId, { name: string; color: string }> = {
    "sam-brian": { name: "Sam & Brian", color: "#63A26B" },
    "ben-adam": { name: "Ben & Adam", color: "#DC4742" },
};

type ClaimsCardProps = {
    episodeSlug: string;
    currentTime: number;
};

export function ClaimsCard({ episodeSlug, currentTime }: ClaimsCardProps) {
    const owners = useMemo(
        () => getStateOwners(episodeSlug, currentTime),
        [currentTime, episodeSlug],
    );
    const statesByTeam = useMemo(() => {
        const result: Record<TeamId, string[]> = { "sam-brian": [], "ben-adam": [] };
        for (const [state, team] of owners) result[team].push(state);
        result["sam-brian"].sort();
        result["ben-adam"].sort();
        return result;
    }, [owners]);

    const fillColor = useMemo(() => {
        const expression: unknown[] = [
            "match",
            ["get", "name"],
            "Puerto Rico",
            "rgba(0, 0, 0, 0)",
        ];
        for (const [state, team] of owners) {
            if (state !== "District of Columbia") expression.push(state, teams[team].color);
        }
        expression.push("#233744");
        return expression as never;
    }, [owners]);

    const stateLineColor = [
        "case",
        ["==", ["get", "name"], "Puerto Rico"],
        "rgba(0, 0, 0, 0)",
        "#071722",
    ] as never;

    return (
        <section className="border-paper/25 bg-panel flex min-h-0 w-full flex-col border" aria-labelledby="claims-title">
            <header className="border-paper/20 border-b px-6 py-6 sm:px-8 sm:py-7">
                <h2 id="claims-title" className="font-display text-3xl leading-none font-black tracking-tight uppercase">States claimed</h2>
            </header>
            <div className="relative h-64 min-h-64 overflow-hidden bg-[#071722]">
                <Map
                    blank
                    theme="dark"
                    center={[-116, 48]}
                    zoom={1.55}
                    minZoom={1.25}
                    maxZoom={5}
                    attributionControl={false}
                    dragRotate={false}
                    touchPitch={false}
                >
                    <MapGeoJSON
                        id="season-four-canada"
                        data={CANADA_GEOJSON}
                        fillPaint={{
                            "fill-color": [
                                "case",
                                ["==", ["get", "ADM0_A3"], "CAN"],
                                "#172a35",
                                "rgba(0, 0, 0, 0)",
                            ],
                            "fill-opacity": 1,
                        }}
                        linePaint={false}
                    />
                    <MapGeoJSON
                        id="season-four-states"
                        data={US_STATES_GEOJSON}
                        fillPaint={{ "fill-color": fillColor, "fill-opacity": 0.96 }}
                        linePaint={{ "line-color": stateLineColor, "line-width": 1 }}
                    />
                    {owners.get("District of Columbia") && (
                        <MapMarker longitude={-77.0369} latitude={38.9072}>
                            <MarkerContent>
                                <span
                                    className="block size-2.5 rounded-full border-2 border-white shadow"
                                    style={{ backgroundColor: teams[owners.get("District of Columbia")!].color }}
                                    aria-label="District of Columbia"
                                />
                            </MarkerContent>
                        </MapMarker>
                    )}
                </Map>
            </div>
            <div className="border-paper/20 grid flex-1 grid-cols-2 border-t">
                {(Object.keys(teams) as TeamId[]).map((team, index) => (
                    <div key={team} className={`h-full min-w-0 p-4 ${index === 0 ? "border-paper/20 border-r" : ""}`}>
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="size-2.5 shrink-0" style={{ backgroundColor: teams[team].color }} />
                                <h3 className="truncate font-mono text-[10px] font-bold tracking-wider uppercase">{teams[team].name}</h3>
                            </div>
                            <span className="font-display text-xl leading-none">{statesByTeam[team].length}</span>
                        </div>
                        {statesByTeam[team].length ? (
                            <ul className="text-card-meta space-y-1.5 text-xs leading-tight">
                                {statesByTeam[team].map((state) => (
                                    <li key={state} className="border-paper/10 border-b pb-1.5 last:border-0 last:pb-0">
                                        {state === "District of Columbia" ? "D.C." : state}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-card-meta text-xs">No states yet</p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
