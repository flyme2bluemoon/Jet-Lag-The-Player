# Jet Lag: The Player

## About the game

Jet Lag: The Game is a travel game show where in each season teams or individuals compete in a game while traveling some part of the world.

The transcripts for the show are available in `transcript_downloader/transcripts/`. Do not run the transcript downloader on your own. If you can't find the transcripts, stop and ask the user to download them instead.

### Seasons

There are 18 full length seasons and a special Hide and Seek Across NYC mini season. Each team has a primary and one or more secondary colors to be used in graphics to denote that team. Some games only have two teams and thus the third column is empty. In individual games (e.g., Tag, Hide & Seek), player and team may be used interchangably.

| Season | Game                          | Team 1                              | Team 2                             | Team 3    |
| -----: | ----------------------------- | ----------------------------------- | ---------------------------------- | --------- |
|      1 | Connect Four Across America   | Sam/Brian                           | Ben/Adam                           |           |
|      2 | Circumnavigation              | Sam/Joseph                          | Ben/Adam                           |           |
|      3 | Tag Eur It                    | Sam                                 | Adam                               | Ben       |
|      4 | Battle 4 America              | Sam/Brian (#63A26B/#3E8C5A/#C9DECE) | Ben/Adam (#DC4742/#941D13/#EFB9BD) |           |
|      5 | Race To The End Of The World  | Sam/Toby                            | Ben/Adam                           |           |
|      6 | Capture The Flag Across Japan | Sam/Scotty                          | Ben/Adam                           |           |
|      7 | Tag Eur It 2                  | Sam                                 | Adam                               | Ben       |
|      8 | Arctic Escape                 | Sam/Michelle                        | Ben/Adam                           |           |
|      9 | Hide + Seek                   | Sam                                 | Adam                               | Ben       |
|     10 | AU$TRALIA                     | Sam/Toby                            | Ben/Adam                           |           |
|     11 | Tag Eur It 3                  | Sam                                 | Adam                               | Ben       |
|     12 | Hide + Seek: Japan            | Sam                                 | Adam                               | Ben       |
|     13 | Schengen Showdown             | Sam/Tom                             | Ben/Adam                           |           |
|   13.5 | Hide and Seek Across NYC      | Sam/Amy                             | Adam/Ben                           |           |
|     14 | SnaKe                         | Sam                                 | Adam                               | Ben       |
|     15 | Tag: All Stars                | Sam/Toby                            | Michelle/Adam                      | Ben/Brian |
|     16 | Hide & Seek: U.K.             | Sam                                 | Adam                               | Ben       |
|     17 | Taiwan Rail Rush              | Sam/Michael                         | Ben/Adam                           |           |
|     18 | Stateside Scramble            | Sam/Amy                             | Ben/Adam                           |           |

#### Season specific notes

- Season 4: Battle 4 America
    - Information on challenges can be found here: https://jetlag.fandom.com/wiki/Battle_4_America/Challenges

## Dashboards

- Each season has a custom dashboard.
- When creating new cards, make sure this card is synced with the timestamp of the YouTube video by using the YouTube IFrame Player API.
- Most cards will be the same for all episodes in a dashboard but it may be possible that a card should only be shown for certain episodes.
