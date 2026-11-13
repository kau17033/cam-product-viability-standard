import json, sys
from .engine import evaluate
from .links import genre_links, links_block
from .translate import canon_product

def main():
    data = sys.stdin.read() if len(sys.argv) < 2 else open(sys.argv[1], encoding="utf-8").read()
    raw = json.loads(data)
    genre = raw.get("genre") if isinstance(raw, dict) else None
    # Input enters through the translator: loose EN/JP field names and
    # string numbers are canonized into the six items (+ checks fields)
    # before the engine runs. Complete canonical input is unchanged, so
    # output for it stays byte-identical to 1.0.0.
    product = canon_product(raw)
    r = evaluate(product)
    if r.get("incomplete"):
        print("CAM status: INCOMPLETE — missing: " + ", ".join(r["missing"]))
    else:
        print(f"CAM verdict: {r['verdict']} — profit ¥{r['profit']} per order")
    # Link carriage (1.2.0): only on an issued verdict, only for a genre
    # the caller explicitly passed, never inferred from the product.
    links = [] if r.get("incomplete") else genre_links(genre)
    if links:
        r["affiliateLinks"] = links
    print(json.dumps(r, ensure_ascii=False))
    if links:
        print(links_block(genre, links))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
