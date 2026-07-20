# Jet Lag: The Player

## Game reference

Jet Lag: The Game is a travel game show in which teams or individual players compete while traveling through a region.

There are 18 full seasons plus the _Hide and Seek Across NYC_ mini-season. Use the teams below when creating season graphics. The colors refer to the color palette below. In individual games, “team” and “player” may be used interchangeably.

| Season | Game                          | Team 1                      | Team 2                   | Team 3      |
| -----: | ----------------------------- | --------------------------- | ------------------------ | ----------- |
|      1 | Connect Four Across America   | Sam & Brian                 | Ben & Adam               |             |
|      2 | Circumnavigation              | Sam & Joseph                | Ben & Adam               |             |
|      3 | Tag Eur It                    | Sam                         | Adam                     | Ben         |
|      4 | Battle 4 America              | Sam & Brian (jet-lag-green) | Ben & Adam (jet-lag-red) |             |
|      5 | Race To The End Of The World  | Sam & Toby                  | Ben & Adam               |             |
|      6 | Capture The Flag Across Japan | Sam & Scotty                | Ben & Adam               |             |
|      7 | Tag Eur It 2                  | Sam                         | Adam                     | Ben         |
|      8 | Arctic Escape                 | Sam & Michelle              | Ben & Adam               |             |
|      9 | Hide + Seek                   | Sam                         | Adam                     | Ben         |
|     10 | AU$TRALIA                     | Sam & Toby                  | Ben & Adam               |             |
|     11 | Tag Eur It 3                  | Sam                         | Adam                     | Ben         |
|     12 | Hide + Seek: Japan            | Sam                         | Adam                     | Ben         |
|     13 | Schengen Showdown             | Sam & Tom                   | Ben & Adam               |             |
|   13.5 | Hide and Seek Across NYC      | Sam & Amy                   | Adam & Ben               |             |
|     14 | SnaKe                         | Sam                         | Adam                     | Ben         |
|     15 | Tag: All Stars                | Sam & Toby                  | Michelle & Adam          | Ben & Brian |
|     16 | Hide & Seek: U.K.             | Sam                         | Adam                     | Ben         |
|     17 | Taiwan Rail Rush              | Sam & Michael               | Ben & Adam               |             |
|     18 | Stateside Scramble            | Sam & Amy (jet-lag-yellow)  | Ben & Adam (jet-lag-red) |             |

For Season 4 challenge data, use the [Battle 4 America challenge reference](https://jetlag.fandom.com/wiki/Battle_4_America/Challenges).
For Season 18 challenge data, use the [Stateside Scramble challenge reference](https://jetlag.fandom.com/wiki/Stateside_Scramble/Challenges).

## Repository layout

- `app/` is the web application: a Next.js 16, React 19, TypeScript, and Tailwind CSS project. Run its package scripts from this directory with pnpm (`pnpm dev`, `pnpm lint`, `pnpm build`, and `pnpm start`).
- `transcript_downloader/` is a standalone Python utility that downloads English YouTube caption tracks for the listed seasons. It never downloads video or audio; it saves WebVTT captions, readable text transcripts, and YouTube metadata under `transcript_downloader/transcripts/`, which is generated and gitignored. See `transcript_downloader/README.md` for usage and options. Run it from that directory using its existing `.venv` virtual environment; install dependencies through that environment only when needed.

## Playwright browser checks

Use the bundled Playwright CLI wrapper for browser automation. Do not run it from the repository or `app/`: the CLI writes `.playwright-cli/` artifacts to its working directory. Instead, run it from a temporary directory while targeting the local application:

```sh
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
mkdir -p /tmp/jet-lag-playwright
cd /tmp/jet-lag-playwright
"$PWCLI" open http://localhost:3000
"$PWCLI" snapshot
```

Use a fresh snapshot before interacting with element references, re-snapshot after navigation or major UI changes, and close the browser session when finished with `"$PWCLI" close`. Keep any screenshots, PDFs, and traces in `/tmp/jet-lag-playwright`; do not add test artifacts to the repository.

## Dashboard conventions

- Each season has a custom dashboard. Keep its UI and data in `app/src/seasons/season-<n>/`.
- Use Tailwind utilities rather than raw CSS. Prefer theme variables to one-off values.
- Use `font-sans` (Rubik) by default, especially for body copy, descriptions, longer titles, and dense or wrapping data.
- Use `font-heading` (Barlow Condensed) for short, bold, uppercase structural labels: pages, sections, cards, tabs, and controls.
- Use `font-display` (Barlow Condensed) for prominent or live data: large scores, compact status text, overlines, badges, and short navigation labels.
- Do not use `font-mono` by default. Reserve it for a deliberate semantic treatment, such as a passport stamp or code-like content.
- New cards must be synchronized to the YouTube video timestamp through the YouTube IFrame Player API. Cards may be limited to selected episodes when the season requires it.

## Season setup and shared helpers

When adding a reusable helper function or component, document its purpose, import path, and key usage constraints in this section so future work can discover and use it consistently.

To add a season:

1. Add episode metadata in `app/src/data/season-<n>.ts`.
2. Register it in `app/src/data/season-pages.ts`.
3. Add its branch to `EpisodeDashboard` in `app/src/components/episode/episode-dashboard.tsx`.

Routes, static params, episode navigation, and page metadata are then provided automatically.

- Use `cn(...classes)` from `@/lib/utils` whenever a component accepts a `className` override.
- Use `DashboardGrid` from `@/components/episode/dashboard-grid` for responsive dashboard layouts. It is single-column on small screens and uses 12 columns at `lg`; set season-specific tracks and spans with `className`.
- Use `TeamDefinition`, `TailwindThemeColor`, and `MapHexColor` from `@/components/episode/types` for team display data. UI colors must be Tailwind theme-variable references; the separate hex value is only for APIs such as MapLibre that cannot resolve CSS custom properties.
- Use `TeamLedgerCard` from `@/components/episode/team-ledger-card` for timestamped balances shared by multiple teams. Supply the season, ordered team IDs, team names/colors, visible ledger items, and season-specific balance/history renderers; items without a `team` apply to every team.
- Use `TeamLedgerHistoryItem` from `@/components/episode/team-ledger-history-item` for shared ledger history rows. Use `AnimatedNumber` from `@/components/episode/animated-number` for reduced-motion-aware numeric transitions; supply a `formatValue` callback and appropriate accessibility attributes. Use `formatBudgetAmount` from `@/lib/formatters` for two-decimal budget formatting.
- `YouTubePlayer` from `@/components/episode/youtube-player` owns the IFrame Player API lifecycle. Keep `currentTime` state in the season dashboard, update it through `onTimeChange` (every 250 ms), and pass it to time-aware cards. Never create one player per card.
- Use `compareTimestamps(season, left, right)` from `@/lib/timestamps` for visibility windows, sorting, and event-derived state across episodes. It compares `{ episode, at }` using `season.episodes` order and throws for an unknown episode.
- Use `isTimestampInRange(season, current, start, end)` from `@/lib/timestamps` for half-open visibility windows where the start is included and the end is excluded.
- Use `formatEpisodeLabel(episode)` and `formatTimestamp(seconds)` from `@/lib/timestamps` for compact episode metadata such as `Ep. 1 · 4:05`; episode values should be standard `episode-<n>` slugs or `finale`.
- Start accessible controls and disclosures with the shared primitives in `@/components/ui/` (`Button`, `Select`, `Drawer`, `Accordion`, `Collapsible`, and `Skeleton`). Preserve their keyboard and focus-visible behavior when composing them.

### Maps and travel visuals

- `@/components/ui/map` provides MapLibre components: `Map`, `MapGeoJSON`, `MapArc`, `MapRoute`, `MapMarker`, marker popups/tooltips/labels, `MapControls`, and `MapClusterLayer`. Render map children inside `Map`. Use `<Map blank>` for a transparent, tile-free visualization; otherwise use the theme-aware Carto basemap. Set `MapMarker`'s optional `positionTransitionDuration` to interpolate coordinate updates; it defaults to immediate movement and respects reduced-motion preferences.
- `@/components/ui/map-colors` is the single source for raw MapLibre color literals. Reuse its typed palette and theme maps whenever an API cannot resolve Tailwind CSS variables; do not repeat those hex values in season files.
- `@/components/ui/flight` provides travel-timeline helpers: `FlightAirport`, `FlightRoute`, `FlightRoutes`, `FlightMultiRoute`, `generateArcGeometry`, and `generateArcCoordinates`. Airport references accept IATA codes or `[longitude, latitude]` tuples. Use `resolveAirport` when coordinates are required and `getAirportInfo` for optional lookup.

### Time-based data

Store factual events as typed records with `episode` and `at`. Sort and filter them with `compareTimestamps`, and expose focused query functions such as `getVisible…(episodeSlug, currentTime)`. Across all season dashboards, event-derived query functions must return stable cached object, array, and `Map` references while the visible event revision is unchanged; rebuild results only when playback crosses a source-data event boundary so React memoization and imperative consumers such as MapLibre can skip redundant work. Season 4 examples include `state-claims.ts`, `budget-data.ts`, `battle-status-data.ts`, and `hand-data.ts`; reuse the pattern, not that season’s teams, claims, or card rules.

## Palette

| Token                  | Hex       |
| ---------------------- | --------- |
| `jet-lag-yellow`       | `#F5C25A` |
| `jet-lag-red`          | `#D94641` |
| `jet-lag-green`        | `#63A06A` |
| `jet-lag-blue`         | `#204DAC` |
| `jet-lag-navy-blue`    | `#242F3F` |
| `jet-lag-curse-purple` | `#411771` |
| `jet-lag-orange`       | `#D17849` |

## Color system

- Define reusable application colors as Tailwind theme variables in the `@theme inline` block in `app/src/app/globals.css`. Consume them through generated utilities such as `bg-jet-lag-red`, `text-paper`, and `border-card`, rather than raw hex, RGB, or stock Tailwind palette classes.
- Prefer semantic theme colors for foundational UI: `background`/`foreground` for the page, `card`/`card-foreground` and `panel`/`paper` for surfaces, `muted` and metadata tokens for secondary content, and `border`, `input`, and `ring` for controls. Keep the existing light and dark page background and foreground values unchanged.
- Use the `jet-lag-*` palette tokens for brand accents, teams, status graphics, maps, and travel visuals. Apply transparency with Tailwind opacity modifiers or `color-mix()` based on a theme variable instead of introducing a second hard-coded shade.
- Avoid `white`, `black`, and Tailwind's stock color families when an existing semantic or Jet Lag token communicates the same role. Fixed high-contrast artwork may use `challenge-card-paper` and `challenge-card-ink`.
- Dynamic inline styles are acceptable when a runtime value selects a team color, but the value must originate from a Tailwind theme variable such as `var(--color-jet-lag-green)`. Do not append hex alpha suffixes to CSS variables; use `color-mix()`.
- Raw color literals are exceptions for APIs that cannot resolve CSS custom properties, such as MapLibre paint expressions or constrained third-party options. Keep those values centralized, document why the exception exists, and mirror the corresponding theme color exactly when applicable.
- Bespoke illustration colors may be one-off, but repeated artwork colors should still receive narrowly named theme variables so the artwork remains auditable and consistent.
