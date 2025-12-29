#!/usr/bin/env python3
"""Download webpage content as markdown via https://r.jina.ai/

Usage examples:
  python jina_download.py https://datatalks.club
  python jina_download.py datatalks.club -o datatalks.md
  python jina_download.py example.com https://r.jina.ai/https://other.site -d downloads/
"""

from __future__ import annotations

import argparse
import os
import sys
import re
from urllib.parse import urlparse

import requests


def jina_url(original_url: str) -> str:
    """Return the r.jina.ai URL for the given page URL.

    If the provided URL already starts with r.jina.ai it is returned unchanged.
    If no scheme is present, https:// is added.
    """
    if original_url.startswith("https://r.jina.ai/") or original_url.startswith("http://r.jina.ai/"):
        return original_url
    if not original_url.startswith("http://") and not original_url.startswith("https://"):
        original_url = "https://" + original_url
    return f"https://r.jina.ai/{original_url}"


def filename_from_url(original_url: str) -> str:
    parsed = urlparse(original_url)
    host = parsed.netloc or parsed.path
    safe = host.replace(":", "_")
    return f"{safe}.md"


def fetch_markdown(url: str, timeout: int = 15) -> str:
    headers = {"User-Agent": "jina-downloader/1.0 (+https://github.com/)"}
    resp = requests.get(url, timeout=timeout, headers=headers)
    resp.raise_for_status()
    return resp.text


def get_char_count(text: str) -> int:
    """Return the number of characters in the text."""
    return len(text)


def count_word(text: str, word: str, whole: bool = False) -> int:
    """Count occurrences of ``word`` in ``text``.

    By default performs a case-insensitive substring match. If ``whole`` is True,
    uses a whole-word regex match (case-insensitive).
    """
    if whole:
        pattern = rf"\b{re.escape(word)}\b"
    else:
        pattern = re.escape(word)
    return len(re.findall(pattern, text, flags=re.IGNORECASE))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Download webpage content (markdown) via https://r.jina.ai/ (uses requests)."
    )
    parser.add_argument("urls", nargs="+", help="One or more page URLs (with or without http(s) scheme).")
    parser.add_argument("-o", "--output", help="Output file (for single URL) or prefix (for multiple URLs). If omitted, content is printed to stdout and the character count is shown on the last line.")
    parser.add_argument("-d", "--dir", default=".", help="Output directory (default: current dir)")
    parser.add_argument("-q", "--quiet", action="store_true", help="Suppress status messages")
    parser.add_argument("--count-only", action="store_true", help="Print only the character count (integer) for each URL and no other output")
    parser.add_argument("--word", help="Count occurrences of this word (case-insensitive substring match by default)")
    parser.add_argument("--whole-word", action="store_true", help="When used with --word, match whole words only")
    args = parser.parse_args()

    os.makedirs(args.dir, exist_ok=True)

    for i, orig in enumerate(args.urls):
        target = jina_url(orig)
        try:
            md = fetch_markdown(target)
        except requests.RequestException as exc:
            print(f"ERROR: Failed to fetch {orig!r}: {exc}", file=sys.stderr)
            continue

        if args.output:
            if len(args.urls) == 1:
                out_name = args.output
            else:
                base, ext = os.path.splitext(args.output)
                out_name = f"{base}_{i+1}{ext or '.md'}"
            out_path = os.path.join(args.dir, out_name)
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(md)
            count = get_char_count(md)
            if args.count_only:
                # Print only the integer count
                print(count)
                continue
            if not args.quiet:
                print(f"Saved: {out_path} ({count} chars)")
            if args.word and not args.quiet:
                wcount = count_word(md, args.word, whole=args.whole_word)
                print(f"Word '{args.word}' count: {wcount}")
        else:
            # Print markdown to stdout unless count-only is requested
            if not args.count_only:
                print(md, end="" if md.endswith("\n") else "\n")
            count = get_char_count(md)
            if args.count_only:
                # Print only the integer count
                print(count)
            else:
                print(f"Character count: {count}")
                if args.word:
                    wcount = count_word(md, args.word, whole=args.whole_word)
                    print(f"Word '{args.word}' count: {wcount}")
            # Separate multiple outputs for readability
            if i != len(args.urls) - 1:
                print()


if __name__ == "__main__":
    main()
