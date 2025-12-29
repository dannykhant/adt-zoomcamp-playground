#!/usr/bin/env python3
"""MCP client: Test script for fetch_via_jina and search tools on the local mcp_server.
"""

from __future__ import annotations

import asyncio
import json
import sys

from fastmcp import Client

URL = "https://datatalks.club"


async def run_jina_keyword_search(client, url, word="data", whole_word=False):
    print(f"--- Testing jina-fetch-keyword-search for {url} ---")
    payload = {
        "url": url,
        "word": word,
        "whole_word": whole_word,
        "timeout": 30,
    }
    res = await client.call_tool("jina_fetch_keyword_search", payload)

    if hasattr(res, "content") and res.content:
        text = res.content[0].text
    else:
        text = getattr(res, "text", None) or str(res)

    data = json.loads(text)
    if "error" in data:
        print(f"jina-fetch-keyword-search error: {data['error']}", file=sys.stderr)
    else:
        count = int(data.get("word_count", 0))
        print(f"Word '{word}' count: {count}")

async def run_jina_total_chars(client, url):
    print(f"--- Testing jina-fetch-total-chars for {url} ---")
    payload = {
        "url": url,
        "timeout": 30,
    }
    res = await client.call_tool("jina_fetch_total_chars", payload)

    if hasattr(res, "content") and res.content:
        text = res.content[0].text
    else:
        text = getattr(res, "text", None) or str(res)

    data = json.loads(text)
    if "error" in data:
        print(f"jina-fetch-total-chars error: {data['error']}", file=sys.stderr)
    else:
        count = int(data.get("char_count", 0))
        print(f"Total characters: {count}")

async def run_search(client, query, num_results=3):
    print(f"\n--- Testing documentation search for: '{query}' ---")
    res = await client.call_tool("search", {"query": query, "num_results": num_results})
    
    if hasattr(res, "content") and res.content:
        text = res.content[0].text
    else:
        text = getattr(res, "text", None) or str(res)

    results = json.loads(text)
    if isinstance(results, list):
        for i, doc in enumerate(results, 1):
            filename = doc.get("filename", "Unknown")
            content = doc.get("content", "")[:100].replace("\n", " ")
            print(f"{i}. {filename}: {content}...")
    else:
        print(f"Search result: {results}")

async def main() -> int:
    parser = argparse.ArgumentParser(description="Test MCP tools via local mcp_server")
    parser.add_argument(
        "--jina-keyword-search", 
        metavar="URL", 
        nargs="?", 
        const=URL, 
        help="Run keyword search on the specified URL"
    )
    parser.add_argument(
        "--jina-total-chars", 
        metavar="URL", 
        nargs="?", 
        const=URL, 
        help="Run total characters count on the specified URL"
    )
    parser.add_argument("--keyword", default="data", help="Word to search for (default: 'data')")
    parser.add_argument("--whole-word", action="store_true", help="Match whole words only")
    parser.add_argument(
        "--search", 
        metavar="QUERY", 
        nargs="?", 
        const="how to use tools", 
        help="Run document search tool"
    )
    args = parser.parse_args()

    if args.jina_keyword_search is None and args.jina_total_chars is None and args.search is None:
        parser.print_help()
        return 0

    try:
        try:
            import mcp_server
        except ImportError as e:
            print(f"Error: Could not import 'mcp_server.py': {e}", file=sys.stderr)
            return 1

        async with Client(mcp_server.mcp) as client:
            if args.jina_keyword_search:
                # args.jina_keyword_search will contain the URL if provided, or the default from 'const'
                await run_jina_keyword_search(client, args.jina_keyword_search, word=args.keyword, whole_word=args.whole_word)
            
            if args.jina_total_chars:
                # args.jina_total_chars will contain the URL if provided
                await run_jina_total_chars(client, args.jina_total_chars)
            
            if args.search:
                # args.search will contain the query if provided
                await run_search(client, args.search)

            return 0
    except Exception as exc:
        print(f"Failed to connect to or call the local MCP server: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    import argparse
    sys.exit(asyncio.run(main()))
