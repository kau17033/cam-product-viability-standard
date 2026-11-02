import json, sys
from .engine import evaluate

def main():
    data = sys.stdin.read() if len(sys.argv) < 2 else open(sys.argv[1], encoding="utf-8").read()
    product = json.loads(data)
    r = evaluate(product)
    if r.get("incomplete"):
        print("CAM verdict: INCOMPLETE — missing items: " + ", ".join(r["missing"]))
    else:
        print(f"CAM verdict: {r['verdict']} — profit ¥{r['profit']} per order")
    print(json.dumps(r, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
