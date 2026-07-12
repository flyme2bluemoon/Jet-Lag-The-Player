#!/usr/bin/env python3
"""Download transcripts for every season of Jet Lag: The Game.

The script downloads captions only (never the videos), retaining the original
WebVTT files and also producing plain-text versions.
"""

from __future__ import annotations

import argparse
import html
import re
import sys
from pathlib import Path


SEASON_PLAYLISTS = {
    "1": "PLB7ZcpBcwdC7z1fCZetTI8TPeLlgagF9v",  # Connect Four Across America
    "2": "PLB7ZcpBcwdC7rGYl6StHarkLlgeZX66oL",  # Circumnavigation
    "3": "PLB7ZcpBcwdC5B-l2FQNOPJVFpqF0QVxfG",  # Tag Eur It
    "4": "PLB7ZcpBcwdC7ogXbMvwuBSfj3LHVRCqLc",  # Battle 4 America
    "5": "PLB7ZcpBcwdC4SeH7qNw05wgU03HlRGiiS",  # Race To The End Of The World
    "6": "PLB7ZcpBcwdC6OjHpxnkSL2RzbmC2moNt1",  # Capture The Flag Across Japan
    "7": "PLB7ZcpBcwdC6wkQRczVE4Fz-4kUOIc3d1",  # Tag Eur It 2
    "8": "PLB7ZcpBcwdC6zyXJyImHgVdrC4Vl8SNG9",  # Arctic Escape
    "9": "PLB7ZcpBcwdC7gTO_IVdiBv8nVPLKbqNa4",  # Hide + Seek
    "10": "PLB7ZcpBcwdC4dhXkpNzUVsGFZp72v0UqL",  # AU$TRALIA
    "11": "PLB7ZcpBcwdC56V3DHxfFVTMDzera__IFi",  # Tag Eur It 3
    "12": "PLB7ZcpBcwdC79KvPUh76PhFZ8x7q18hOW",  # Hide + Seek: Japan
    "13": "PLB7ZcpBcwdC64gYhvs3PyyM_fRKpjq1l0",  # Schengen Showdown
    "13.5": "PLB7ZcpBcwdC5aiPqLOh4v2mGGxm2_gmu6",  # Hide and Seek Across NYC
    "14": "PLB7ZcpBcwdC4ZwbTbCqICVjsZbgn80SaK",  # SnaKe
    "15": "PLB7ZcpBcwdC7X7UoXDLnT8pPbAH6a45jM",  # Tag: All Stars
    "16": "PLB7ZcpBcwdC5V7encRbWQdst2keI78jyL",  # Hide & Seek: U.K.
    "17": "PLB7ZcpBcwdC7lbptiTx9d-eQLZuYvHeBm",  # Taiwan Rail Rush
    "18": "PLB7ZcpBcwdC4gFeZSxp55tgVXo4tJCsrv",  # Stateside Scramble
}
TIMESTAMP_RE = re.compile(
    r"^\s*(?:\d{2}:)?\d{2}:\d{2}\.\d{3}\s+-->\s+"
    r"(?:\d{2}:)?\d{2}:\d{2}\.\d{3}"
)
TAG_RE = re.compile(r"<[^>]+>")


def vtt_to_text(vtt: str) -> str:
    """Turn a WebVTT caption file into readable, de-duplicated text."""
    lines: list[str] = []
    previous = ""

    for raw_line in vtt.splitlines():
        line = raw_line.strip()
        if (
            not line
            or line == "WEBVTT"
            or line.startswith(("Kind:", "Language:", "NOTE ", "STYLE"))
            or line.isdigit()
            or TIMESTAMP_RE.match(line)
        ):
            continue

        line = html.unescape(TAG_RE.sub("", line)).strip()
        if line and line != previous:
            lines.append(line)
            previous = line

    return "\n".join(lines) + ("\n" if lines else "")


def create_text_transcripts(output_dir: Path) -> int:
    """Create a .txt companion for every downloaded .vtt file."""
    count = 0
    for vtt_path in output_dir.rglob("*.vtt"):
        text_path = vtt_path.with_suffix(".txt")
        text_path.write_text(
            vtt_to_text(vtt_path.read_text(encoding="utf-8-sig")),
            encoding="utf-8",
        )
        count += 1
    return count


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("transcripts"),
        help="Output directory (default: transcripts)",
    )
    source = parser.add_mutually_exclusive_group()
    source.add_argument(
        "--url",
        help="Channel or playlist URL to process",
    )
    source.add_argument(
        "--season",
        metavar="N",
        choices=SEASON_PLAYLISTS,
        help="Download one season (1-18, including 13.5)",
    )
    parser.add_argument(
        "--language",
        default="en",
        help="Caption language, such as en or de (default: en)",
    )
    parser.add_argument(
        "--no-auto-captions",
        action="store_true",
        help="Do not fall back to YouTube's automatically generated captions",
    )
    parser.add_argument(
        "--limit",
        type=int,
        metavar="N",
        help="Process only the first N videos (useful for testing)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        import yt_dlp
    except ImportError:
        print(
            "Missing dependency: install it with `python -m pip install -r requirements.txt`.",
            file=sys.stderr,
        )
        return 2

    output_dir = args.output.expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    if args.season is not None:
        sources = [(args.season, SEASON_PLAYLISTS[args.season])]
    elif args.url:
        sources = [("custom", args.url)]
    else:
        sources = list(SEASON_PLAYLISTS.items())

    if args.limit is not None:
        if args.limit < 1:
            raise SystemExit("--limit must be at least 1")

    print(f"Downloading caption tracks to {output_dir}")
    error_code = 0
    for season, playlist in sources:
        season_dir = output_dir / f"season{season}"
        season_dir.mkdir(parents=True, exist_ok=True)
        source_url = (
            playlist
            if playlist.startswith(("http://", "https://"))
            else f"https://www.youtube.com/playlist?list={playlist}"
        )
        options: dict[str, object] = {
            "skip_download": True,
            "writesubtitles": True,
            "writeautomaticsub": not args.no_auto_captions,
            "subtitleslangs": [args.language, f"{args.language}-orig"],
            "subtitlesformat": "vtt/best",
            "writeinfojson": True,
            "ignoreerrors": True,
            "continuedl": True,
            "download_archive": str(season_dir / ".download-archive.txt"),
            "outtmpl": str(
                season_dir
                / "episode%(playlist_index)02d"
                / "%(upload_date)s_%(id)s_%(title).150B.%(ext)s"
            ),
            "sleep_interval_requests": 1,
        }
        if args.limit is not None:
            options["playlistend"] = args.limit

        print(f"Processing season {season}")
        with yt_dlp.YoutubeDL(options) as downloader:
            error_code |= downloader.download([source_url])

    count = create_text_transcripts(output_dir)
    print(f"Created {count} plain-text transcript(s).")
    if error_code:
        print(
            "Some videos could not be processed; see the messages above.",
            file=sys.stderr,
        )
    return error_code


if __name__ == "__main__":
    raise SystemExit(main())
