import os
import zipfile
import minsearch
from pathlib import Path

def load_index():
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
    index = minsearch.Index(
        text_fields=["content"],
        keyword_fields=["filename"]
    )
    index.fit(docs)
    return index

def search(query, index):
    results = index.search(
        query=query,
        num_results=5
    )
    return results

if __name__ == "__main__":
    print("Indexing files...")
    index = load_index()
    print(f"Index built with {len(index.docs)} documents.")
    
    # Test queries
    test_queries = [
        "demo"
    ]
    
    for q in test_queries:
        print(f"\nSearch results for: '{q}'")
        results = search(q, index)
        for i, res in enumerate(results, 1):
            print(f"{i}. {res['filename']} (content preview: {res['content'][:100].replace('\\n', ' ')}...)")
