"""CAM verdict engine — Python port of the canonical JS engine (logic.cjs).
Verified output-identical on the canonical cases (see test_port.py).
Criteria defaults mirror the demo: target profit 800, delivery <= 10 days,
estimate age <= 30 days. All money in JPY per order."""

COST_KEYS = ["cost", "shipping", "fee", "returnReserve", "otherVariable"]

def evaluate(product, criteria=None, today=None):
    criteria = criteria or {}
    target = criteria.get("targetProfit", 800)
    max_delivery = criteria.get("maxDeliveryDays", 10)
    max_age = criteria.get("maxEstimateAgeDays", 30)

    price = product.get("price")
    missing = [k for k in COST_KEYS if product.get(k) is None]
    if price is None or missing:
        return {"verdict": "HOLD", "incomplete": True, "profit": None,
                "missing": (["price"] if price is None else []) + missing}
    total_cost = sum(product[k] for k in COST_KEYS)
    profit = price - total_cost

    checks = {}
    checks["margin"] = profit > 0
    checks["target"] = profit >= target
    dd = product.get("deliveryDays")
    checks["delivery"] = (dd <= max_delivery) if dd is not None else None
    stock = product.get("stock")
    checks["stock"] = (stock is None or stock > 0)
    age = product.get("estimateAgeDays")
    checks["estimateAge"] = (age <= max_age) if age is not None else None

    if profit <= 0:
        verdict = "REJECT"
    elif any(v is False for v in checks.values()):
        verdict = "HOLD"
    else:
        verdict = "TEST_CANDIDATE"
    return {"verdict": verdict, "incomplete": False, "profit": profit,
            "allowableCpa": profit - target, "checks": checks}
