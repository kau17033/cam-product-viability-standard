"""CAM Translator — Python port of cam-translate.mjs.

The translation machine between the world's information and the AI's
canonical verdict language.

World side: messy product data, as people and systems actually have it —
JSON with loosely named fields (English or Japanese), a CSV row, or
key: value lines in Japanese or English.

Quantization: the continuous mess is discretized into the standard's fixed
units — six money items, five checks, three verdict states.

AI side: one canonical output — the line "CAM verdict: ... — profit ¥X per
order" plus the structured verdict. Same input, same output, every time,
with zero dependencies beyond the standard library.

Missing money items are never guessed: the result is INCOMPLETE and names
exactly which items are missing, in English and Japanese.

Deliberate deviation from the JS original (for backward compatibility with
this package's 1.0.0 engine-level inputs): the canonical key
``estimateAgeDays`` is accepted as a pass-through alias. The JS translator
accepts only ``estimateDate``; the Python engine consumes
``estimateAgeDays``, and 1.0.0 callers may supply it directly. When both
are present, the explicit ``estimateAgeDays`` wins; otherwise the age is
derived from ``estimateDate`` relative to ``today``, exactly as logic.cjs
does.
"""
import math
import re
from datetime import date, datetime, timezone

from .engine import evaluate

CRITERIA = {"targetProfit": 800, "maxDeliveryDays": 10, "maxEstimateAgeDays": 30}

# Field aliases: world-side names (EN/JP, loose) -> canonical item keys.
ALIASES = {
    "price": ["price", "sellingprice", "saleprice", "価格", "販売価格", "売価"],
    "cost": ["cost", "purchasecost", "unitcost", "原価", "仕入価格", "仕入れ値"],
    "shipping": ["shipping", "shippingcost", "deliverycost", "送料", "配送料"],
    "fee": ["fee", "fees", "paymentfee", "platformfee", "commission",
            "手数料", "決済手数料", "販売手数料"],
    "returnReserve": ["returnreserve", "returncost", "returns",
                      "返品備え", "返品費用", "返品コスト"],
    "otherVariable": ["othervariable", "other", "othercosts",
                      "その他変動費", "その他", "変動費"],
    "deliveryDays": ["deliverydays", "delivery", "leadtime", "配送日数", "納期", "リードタイム"],
    "stock": ["stock", "inventory", "在庫", "在庫数"],
    "estimateDate": ["estimatedate", "quotedate", "見積日", "見積もり日"],
    # Python-port addition (see module docstring): canonical pass-through.
    "estimateAgeDays": ["estimateagedays"],
    "name": ["name", "product", "title", "商品名", "商品"],
    "sku": ["sku", "id", "商品コード"],
}
MONEY = ["price", "cost", "shipping", "fee", "returnReserve", "otherVariable"]
COST_KEYS = ["cost", "shipping", "fee", "returnReserve", "otherVariable"]
LABELS = {
    "price": ["selling price", "販売価格"],
    "cost": ["purchase cost", "原価"],
    "shipping": ["shipping", "送料"],
    "fee": ["fees", "手数料"],
    "returnReserve": ["return reserve", "返品備え"],
    "otherVariable": ["other variable costs", "その他変動費"],
}
_NUMERIC_KEYS = set(MONEY) | {"deliveryDays", "stock", "estimateAgeDays"}

_KEY_STRIP = re.compile(r"[\s_\-（）()]")


def normalize_key(k):
    return _KEY_STRIP.sub("", str(k).lower())


LOOKUP = {}
for _canon, _names in ALIASES.items():
    for _n in _names:
        LOOKUP[normalize_key(_n)] = _canon


def _int_if_integral(n):
    if isinstance(n, float) and math.isfinite(n) and n == int(n):
        return int(n)
    return n


def to_number(v):
    """Mirror of the JS translator's toNumber: numbers pass through,
    numeric strings are cleaned (currency marks, separators, trailing 円)
    and parsed; anything else is None (never guessed)."""
    if isinstance(v, bool):
        return None
    if isinstance(v, (int, float)):
        return _int_if_integral(v)
    if not isinstance(v, str):
        return None
    s = re.sub(r"[¥￥,、\s]", "", v)
    s = re.sub(r"円$", "", s)
    if s == "":
        return None
    try:
        n = float(s)
    except ValueError:
        try:
            n = float(int(s, 0))  # JS Number() also accepts 0x / 0o / 0b forms
        except ValueError:
            return None
    if not math.isfinite(n):
        return None
    return _int_if_integral(n)


def canonize(raw):
    """Map a loose world-side dict onto canonical item keys."""
    out = {}
    for k, v in raw.items():
        canon = LOOKUP.get(normalize_key(k))
        if canon is None:
            continue
        if canon in _NUMERIC_KEYS:
            n = to_number(v)
            if n is not None:
                out[canon] = n
        else:
            out[canon] = v
    return out


def _round_half_up(x):
    # JS Math.round: round half toward +infinity.
    return math.floor(x + 0.5)


def _days_between(a, b):
    return _round_half_up((b - a).total_seconds() / 86400.0)


def _parse_estimate_date(value):
    """Parse an estimateDate the way JS `new Date(...)` would for the
    shapes this standard uses: a bare date is UTC midnight; an offset
    datetime keeps its offset; a naive datetime is local time."""
    if isinstance(value, datetime):
        dt = value
    elif isinstance(value, date):
        return datetime(value.year, value.month, value.day, tzinfo=timezone.utc)
    elif isinstance(value, str):
        t = value.strip()
        if not t:
            return None
        try:
            if re.fullmatch(r"\d{4}-\d{2}-\d{2}", t):
                return datetime.fromisoformat(t).replace(tzinfo=timezone.utc)
            dt = datetime.fromisoformat(t.replace("Z", "+00:00").replace("z", "+00:00"))
        except ValueError:
            return None
    else:
        return None
    if dt.tzinfo is None:
        dt = dt.astimezone()  # naive datetime = local time, as in JS
    return dt


def _coerce_today(today):
    if today is None:
        return datetime.now().astimezone()
    if isinstance(today, datetime):
        return today if today.tzinfo is not None else today.astimezone()
    if isinstance(today, date):
        return datetime(today.year, today.month, today.day).astimezone()
    return datetime.now().astimezone()


def canon_product(raw, today=None):
    """Canonize raw input into an engine-ready product dict, deriving
    estimateAgeDays from estimateDate (relative to today) when the age
    was not supplied directly."""
    product = canonize(raw)
    if product.get("estimateDate") is not None and "estimateAgeDays" not in product:
        est = _parse_estimate_date(product["estimateDate"])
        if est is not None:
            product["estimateAgeDays"] = _days_between(est, _coerce_today(today))
    return product


def _yen(n):
    return "¥" + format(_round_half_up(n), ",")


def translate(raw, today=None, criteria=None):
    """Translate loose world-side input into the canonical verdict.

    Returns the JS translator's output shape: a VERDICT result with the
    canonical report line, or an INCOMPLETE result naming every missing
    money item (values are never guessed). ``checks`` comes from this
    package's engine and is a dict of True/False/None per check id,
    where the JS original returns a list of {id, label, state, detail}
    and a ``reasons`` list; verdicts and profit figures are identical.
    """
    product = canon_product(raw, today=today)
    missing = [k for k in MONEY if product.get(k) is None]
    if missing:
        return {
            "status": "INCOMPLETE",
            "verdict": None,
            "missing": [
                {"item": k, "en": LABELS[k][0], "ja": LABELS[k][1]} for k in missing
            ],
            "line": None,
            "message": {
                "en": "No verdict: missing "
                      + ", ".join(LABELS[k][0] for k in missing)
                      + ". Missing values are never guessed.",
                "ja": "判定できません："
                      + "、".join(LABELS[k][1] for k in missing)
                      + "が不足しています。欠けた値は推測で埋めません。",
            },
        }
    crit = dict(CRITERIA)
    if criteria:
        crit.update(criteria)
    r = evaluate(product, crit)
    profit = r["profit"]
    target = crit.get("targetProfit", 800)
    total_cost = sum(product[k] for k in COST_KEYS)
    price = product["price"]
    headroom = ((price - (total_cost + target)) / price) * 100 if price > 0 else None
    return {
        "status": "VERDICT",
        "verdict": r["verdict"],
        "profitPerOrder": profit,
        "allowableCpa": r["allowableCpa"],
        "priceHeadroomPct": headroom,
        "checks": r["checks"],
        "line": f"CAM verdict: {r['verdict']} — profit {_yen(profit)} per order",
        "gloss": {
            "ja": f"判定：{r['verdict']}（1注文あたり利益 {_yen(profit)}、"
                  f"許容CPA {_yen(r['allowableCpa'])}）",
        },
    }


def parse_csv(text):
    """Header row + one data row, as in the JS translator."""
    lines = text.strip().splitlines()
    if len(lines) < 2:
        raise ValueError("CSV needs a header row and one data row")
    split = lambda l: [s.strip() for s in l.split(",")]
    head = split(lines[0])
    vals = split(lines[1])
    raw = {}
    for i, h in enumerate(head):
        raw[h] = vals[i] if i < len(vals) else None
    return raw


_KV_LINE = re.compile(r"^([^:：=]+)[:：=]\s*(.+)$")


def parse_kv(text):
    """key: value lines (JP/EN separators), as in the JS translator."""
    raw = {}
    for line in text.splitlines():
        m = _KV_LINE.match(line)
        if m:
            raw[m.group(1).strip()] = m.group(2).strip()
    return raw
