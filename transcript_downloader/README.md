# Jet Lag transcript downloader

Downloads every available English caption track from the official **Jet Lag:
The Game** YouTube channel. It does not download video or audio.

```sh
python -m pip install -r requirements.txt
python download_transcripts.py
```

Files are grouped into season and episode directories, such as
`transcripts/season9/episode01/`. Each episode directory contains timestamped
`.vtt` captions, a plain `.txt` transcript, and matching `.info.json` video
metadata. Re-running the script downloads only newly published videos.

Running without `--season` downloads every listed season. A custom `--url` is
placed under `transcripts/season-custom/`, with playlist order used for episode
numbers.

## Output files

A full download has the following structure:

```text
transcripts/
├── season1/
│   ├── .download-archive.txt
│   ├── episode01/
│   │   ├── YYYYMMDD_VIDEO-ID_VIDEO-TITLE.en.vtt
│   │   ├── YYYYMMDD_VIDEO-ID_VIDEO-TITLE.en.txt
│   │   └── YYYYMMDD_VIDEO-ID_VIDEO-TITLE.info.json
│   ├── episode02/
│   │   └── ...
│   └── episode03/
│       └── ...
├── season2/
│   └── ...
├── season13.5/
│   └── ...
└── season18/
    └── ...
```

The filename begins with the video's upload date, followed by its YouTube ID
and title. Each episode directory contains:

- `.vtt`: the original caption track with timestamps.
- `.txt`: a readable plain-text version of the captions.
- `.info.json`: metadata from YouTube, including the title, description, URL,
  upload date, and video ID.

Each season directory also contains `.download-archive.txt`. The script uses
this file to remember completed videos and skip them on later runs. When
`--output` is specified, the entire structure is created inside that directory
instead of `transcripts/`.

Useful options:

```sh
# Test with one video
python download_transcripts.py --limit 1

# Download only season 9
python download_transcripts.py --season 9

# Use a particular playlist and output directory
python download_transcripts.py --url PLAYLIST_URL --output another-directory

# Only accept creator-provided subtitles
python download_transcripts.py --no-auto-captions
```

## Seasons

| Season | Game |
| ---: | --- |
| 1 | Connect Four Across America |
| 2 | Circumnavigation |
| 3 | Tag Eur It |
| 4 | Battle 4 America |
| 5 | Race To The End Of The World |
| 6 | Capture The Flag Across Japan |
| 7 | Tag Eur It 2 |
| 8 | Arctic Escape |
| 9 | Hide + Seek |
| 10 | AU$TRALIA |
| 11 | Tag Eur It 3 |
| 12 | Hide + Seek: Japan |
| 13 | Schengen Showdown |
| 13.5 | Hide and Seek Across NYC |
| 14 | SnaKe |
| 15 | Tag: All Stars |
| 16 | Hide & Seek: U.K. |
| 17 | Taiwan Rail Rush |
| 18 | Stateside Scramble |

Season 13.5 is the two-part *Hide and Seek Across NYC* special.
