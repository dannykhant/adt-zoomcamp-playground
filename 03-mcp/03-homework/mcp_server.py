from fastmcp import FastMCP
import os
import zipfile
from pathlib import Path
import minsearch

# Reuse the downloader helpers
from jina_download import jina_url, fetch_markdown, get_char_count, count_word

mcp = FastMCP("Demo 🚀")

# Global index variable to cache the search index
_index = None

def get_index():
    """Lazily load and return the search index."""
    global _index
    if _index is not None:
        return _index
        
    docs = []
    # Iterate over all zip files in current directory
    for zip_path in Path('.').glob('*.zip'):
        with zipfile.ZipFile(zip_path, 'r') as z:
            for member in z.infolist():
                if member.is_dir():
                    continue
                
                # Check for .md or .mdx extensions
                if member.filename.endswith(('.md', '.mdx')):
                    # Remove the first part of the path
                    path_parts = Path(member.filename).parts
                    if len(path_parts) > 1:
                        filename = str(Path(*path_parts[1:]))
                    else:
                        filename = member.filename
                    
                    # Read content
                    with z.open(member) as f:
                        content = f.read().decode('utf-8', errors='ignore')
                    
                    docs.append({
                        "filename": filename,
                        "content": content
                    })
    
    # Initialize and fit minsearch index
    _index = minsearch.Index(
        text_fields=["content"],
        keyword_fields=["filename"]
    )
    _index.fit(docs)
    return _index


@mcp.tool
def jina_fetch_keyword_search(url: str, word: str, whole_word: bool = False, timeout: int = 15) -> dict:
    """Fetch page markdown via https://r.jina.ai and count occurrences of a keyword.

    Parameters
    - url: original page URL
    - word: the word to count (case-insensitive)
    - whole_word: if True, count only whole-word matches
    - timeout: request timeout in seconds

    Returns a dict with 'word_count' and 'url'.
    """
    target = jina_url(url)
    try:
        md = fetch_markdown(target, timeout=timeout)
    except Exception as exc:
        return {"error": str(exc)}

    return {
        "url": url,
        "word": word,
        "word_count": count_word(md, word, whole=whole_word)
    }


@mcp.tool
def jina_fetch_total_chars(url: str, timeout: int = 15) -> dict:
    """Fetch page markdown via https://r.jina.ai and return the total character count.

    Parameters
    - url: original page URL
    - timeout: request timeout in seconds

    Returns a dict with 'char_count' and 'url'.
    """
    target = jina_url(url)
    try:
        md = fetch_markdown(target, timeout=timeout)
    except Exception as exc:
        return {"error": str(exc)}

    return {
        "url": url,
        "char_count": get_char_count(md)
    }


@mcp.tool
def search(query: str, num_results: int = 5) -> list[dict]:
    """Search for relevant documents in the indexed fastmcp documentation.

    Parameters
    - query: The search query string
    - num_results: Number of top results to return (default 5)
    
    Returns a list of matching documents with 'filename' and 'content' fields.
    """
    index = get_index()
    results = index.search(
        query=query,
        num_results=num_results
    )
    return results


if __name__ == "__main__":
    mcp.run()

