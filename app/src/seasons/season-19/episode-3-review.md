# Episode 3 extraction

Source: [We Raced The Entire Length Of Japan, Episode 3](https://www.youtube.com/watch?v=uzr_gkc81SQ). Reviewed using T3 Code Browser Use, the video frames, and the English transcript displayed by YouTube. Gameplay ends at approximately 60:04; the following promotion is excluded.

The data extends the existing event streams in `timeline-data.ts`. Episode timestamps are seconds into this YouTube upload. The dashboard and episode catalog are unchanged. The extraction's timestamp type explicitly permits `episode-3` ahead of its catalog release.

## Checks against the footage

| Event | Timestamp |
| --- | --- |
| Sam & Ben complete the landscape challenge; Okayama unlocks | [16:01](https://www.youtube.com/watch?v=uzr_gkc81SQ&t=961s) |
| Adam & Tom play Unlock Any Prefecture for Kagawa | [20:59](https://www.youtube.com/watch?v=uzr_gkc81SQ&t=1259s) |
| Adam & Tom complete the garden challenge; Okayama unlocks | [32:37](https://www.youtube.com/watch?v=uzr_gkc81SQ&t=1957s) |
| Adam & Tom play Magic Mirror | [36:33](https://www.youtube.com/watch?v=uzr_gkc81SQ&t=2193s) |
| Sam & Ben complete the ropeway challenge; Hyogo unlocks for both teams | [43:49](https://www.youtube.com/watch?v=uzr_gkc81SQ&t=2629s) |
| Adam & Tom fail their house-of-cards attempt | [59:42](https://www.youtube.com/watch?v=uzr_gkc81SQ&t=3582s) |

- The opening recognition sequence repeats Episode 2's completed challenge. Its completion and Ehime unlock are not duplicated. The tripled reward produces three groups of five pulls, with one retained card from each group.
- Magic Mirror creates an additional unlock and reward for Adam & Tom, without a second challenge completion or a second removal from the board. Direct card unlocks identify the card instead of inventing a challenge.
- Attempt starts follow the active challenge graphic. The landscape's failed rounds and the ropeway's failed ascent end before their retries. Practice during the house challenge is not recorded as a series of failed attempts. Adam & Tom's declared attempt fails; Sam & Ben's pursuit remains open at the episode cut.
- Team routes retain the existing alternating stationary/transit model. The Matsuyama tram uses the existing `train` mode. Stops and local walking are recorded where shown, rather than assigning off-camera departures real-world times.
- The Kasaoka location covers the dinosaur park and neighboring coastline used for hiding. The Nunobiki location covers the ropeway and hillside while the teammates separate: Sam hikes and hides; Ben rides up and down. It is a team-level location, not a claim that both players ride the gondola.
- The Shin-Kobe–Sannomiya transfer is represented by the walking footage and the named interchange shown in the edit. No unshown intermediate vehicle boarding or station stop is asserted.

## Repeat the review

Run the timeline and catalog tests from `app/`:

```sh
pnpm test src/seasons/season-19/timeline-data.test.ts src/data/season-19.test.ts
```

For visual review, open the source URL in T3 Code Browser Use. Read `review-episode-3.mjs`, remove its `export default` prefix, and evaluate the function expression with up to four timestamps, for example `(<function source>)([960, 961, 2628, 2629])`, with promise awaiting enabled. Then take a T3 browser snapshot. The helper waits for each seek and draws labeled frames in an overlay without downloading video. Reload the page to remove the overlay.
