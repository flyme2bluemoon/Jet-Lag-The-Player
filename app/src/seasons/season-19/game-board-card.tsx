"use client";

import type { Feature, Polygon, Position } from "geojson";
import { useId, useMemo } from "react";
import { Map, MapControls, MapGeoJSON, useMap } from "@/components/ui/map";
import { MAPLIBRE_COUNTRY_MASK_COLORS } from "@/components/ui/map-colors";
import { useJapanGeoJson, type JapanGeoJson } from "@/lib/japan-geojson";

const JAPAN_BOARD_BOUNDS: [[number, number], [number, number]] = [
  [127, 26],
  [146, 46],
];
const WORLD_RING: Position[] = [
  [-180, -85],
  [180, -85],
  [180, 85],
  [-180, 85],
  [-180, -85],
];

export function GameBoardCard() {
  const titleId = useId();
  const japanGeoJson = useJapanGeoJson();
  const japanMask = useMemo(
    () => japanGeoJson && createJapanMask(japanGeoJson),
    [japanGeoJson],
  );

  return (
    <section
      className="border-paper/25 bg-panel w-full overflow-hidden rounded-lg border"
      aria-labelledby={titleId}
    >
      <header className="border-paper/20 border-b p-6">
        <h2
          id={titleId}
          className="font-heading text-3xl leading-none font-bold tracking-tight uppercase"
        >
          Game Board
        </h2>
      </header>

      <div className="bg-map-canvas relative h-96 overflow-hidden">
        {japanMask && (
          <Map
            bounds={JAPAN_BOARD_BOUNDS}
            fitBoundsOptions={{ padding: 24 }}
            minZoom={2}
            maxZoom={14}
            dragRotate={false}
            touchPitch={false}
          >
            <JapanMask mask={japanMask} />
            <MapControls
              resetView={{ bounds: JAPAN_BOARD_BOUNDS, padding: 24 }}
            />
          </Map>
        )}
      </div>
    </section>
  );
}

function createJapanMask(japan: JapanGeoJson) {
  const feature = japan.features[0];
  if (!feature) throw new RangeError("Japan boundary has no features.");

  return {
    type: "Feature",
    properties: { id: "season-nineteen-japan-mask" },
    geometry: {
      type: "Polygon",
      coordinates: [
        WORLD_RING,
        ...feature.geometry.coordinates.map(([outerRing]) =>
          orientRing(outerRing, true),
        ),
      ],
    },
  } satisfies Feature<Polygon, { id: string }>;
}

function orientRing(ring: Position[], clockwise: boolean) {
  const signedArea = ring.reduce((area, coordinate, index) => {
    const next = ring[(index + 1) % ring.length]!;
    return area + coordinate[0]! * next[1]! - next[0]! * coordinate[1]!;
  }, 0) / 2;
  const isClockwise = signedArea < 0;

  return isClockwise === clockwise ? ring : ring.toReversed();
}

function JapanMask({ mask }: { mask: Feature<Polygon, { id: string }> }) {
  const { resolvedTheme } = useMap();

  return (
    <MapGeoJSON
      id="season-nineteen-japan-mask"
      data={mask}
      fillPaint={{
        "fill-color": MAPLIBRE_COUNTRY_MASK_COLORS[resolvedTheme],
        "fill-opacity": 1,
      }}
      linePaint={false}
    />
  );
}
