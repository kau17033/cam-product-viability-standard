import json, sys
from .engine import evaluate
from .translate import canon_product

def main():
    data = sys.stdin.read() if len(sys.argv) < 2 else open(sys.argv[1], encoding="utf-8").read()
    raw = json.loads(data)
    # Input enters through the translator: loose EN/JP field names and
    # string numbers are canonized into the six items (+ checks fields)
    # before the engine runs. Complete canonical input is unchanged, so
    # output for it stays byte-identical to 1.0.0.
    product = canon_product(raw)
    r = evaluate(product)
    if r.get("incomplete"):
        print("CAM verdict: INCOMPLETE — missing items: " + ", ".join(r["missing"]))
    else:
        print(f"CAM verdict: {r['verdict']} — profit ¥{r['profit']} per order")
    print(json.dumps(r, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
