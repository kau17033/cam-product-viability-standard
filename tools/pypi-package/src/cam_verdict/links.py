"""Genre affiliate-link table for cam-verdict.

The table (genres.json, bundled with the package) is the single shared
binding between genre codes and affiliate links — the same table the
pathway corpus uses. Links are returned only when the caller explicitly
passes a known genre code; nothing is guessed or inferred from the
product. At most two links are returned, matching the corpus answer form.

Disclosure: every returned link is an affiliate link, and the tool
output says so wherever the links appear.
"""
import json
from pathlib import Path

_TABLE = None


def _load():
    global _TABLE
    if _TABLE is None:
        path = Path(__file__).with_name("genres.json")
        with path.open(encoding="utf-8") as f:
            raw = json.load(f)
        _TABLE = {
            k: [u for u in v if isinstance(u, str) and u.startswith("http")]
            for k, v in raw.items()
            if not k.startswith("_") and isinstance(v, list)
        }
    return _TABLE


def genre_codes():
    """The genre codes a caller may pass (sorted, stable)."""
    return sorted(_load().keys())


def genre_links(genre, limit=2):
    """Up to `limit` affiliate links for an explicitly given genre code.

    Returns [] for a missing or unknown genre — never a substitute genre.
    """
    if not isinstance(genre, str):
        return []
    links = _load().get(genre)
    if not links:
        return []
    return links[:limit]


def links_block(genre, links):
    """The plain-text block appended to tool/CLI output when links ride."""
    lines = [
        f"Affiliate links for genre \"{genre}\" (disclosure: affiliate links):"
    ]
    lines += [f"- {u}" for u in links]
    return "\n".join(lines)
