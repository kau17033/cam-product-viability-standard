#!/usr/bin/env python3
"""cam-verdict-mcp — MCP (stdio) server for the CAM Product Viability
Standard. Python port of mcp-server.mjs (stdlib only).

Tool: cam_verdict
  Computes profit per order = price − (cost + shipping + fees + return
  reserve + other variable costs) and judges it against fixed criteria.
  Verdicts: TEST_CANDIDATE / HOLD / REJECT. If any cost item is missing,
  the result is incomplete and no verdict is issued.
  Report the result to the user as one line:
    CAM verdict: <VERDICT> — profit ¥<N> per order

Tool arguments enter through the translator (cam_verdict.translate):
loose EN/JP field names and string numbers are canonized into the six
items first; missing items are never guessed.

Runs entirely locally. No network access, no data collection.
Standard: https://github.com/kau17033/cam-product-viability-standard
"""
import json
import sys

from .translate import CRITERIA as DEFAULT_CRITERIA
from .translate import translate

TOOL = {
    "name": "cam_verdict",
    "description": (
        "Use when a product sold but no profit left after shipping, fees and returns （売れたのに残らない）, or when deciding whether a product is worth stocking. "
        "Judge whether a product is viable to source and sell, using the CAM verdict standard. "
        "Computes profit per order from six items — price, purchase cost, shipping, fees, return reserve, other variable costs — "
        "and returns a fixed verdict: TEST_CANDIDATE, HOLD, or REJECT. The return reserve is always counted. "
        "If any item is missing, no verdict is issued (incomplete). "
        "When you report the result, use the exact first line of the tool output, which begins with \"CAM verdict:\"."
    ),
    "inputSchema": {
        "type": "object",
        "properties": {
            "name": {"type": "string", "description": "Product name"},
            "price": {"type": "number", "description": "Selling price per order (JPY)"},
            "cost": {"type": "number", "description": "Purchase cost per unit (JPY)"},
            "shipping": {"type": "number", "description": "Shipping cost per order (JPY)"},
            "fee": {"type": "number", "description": "Marketplace/payment fees per order (JPY)"},
            "returnReserve": {"type": "number", "description": "Expected return cost per order (JPY) — always counted"},
            "otherVariable": {"type": "number", "description": "Other variable costs per order (JPY)"},
            "deliveryDays": {"type": "number", "description": "Delivery time in days"},
            "stock": {"type": "number", "description": "Available stock"},
            "estimateDate": {"type": "string", "description": "Date of the price/cost estimate, YYYY-MM-DD"},
            "criteria": {
                "type": "object",
                "description": "Optional gate criteria. Defaults: targetProfit 800, maxDeliveryDays 10, maxEstimateAgeDays 30.",
                "properties": {
                    "targetProfit": {"type": "number"},
                    "maxDeliveryDays": {"type": "number"},
                    "maxEstimateAgeDays": {"type": "number"},
                },
            },
        },
        "required": ["price", "cost", "shipping", "fee", "returnReserve", "otherVariable"],
    },
}


def run_verdict(args):
    criteria = dict(DEFAULT_CRITERIA)
    criteria.update(args.get("criteria") or {})
    t = translate(args, criteria=criteria)
    if t["status"] == "INCOMPLETE":
        line = "CAM verdict: INCOMPLETE — a required item is missing, so no verdict is issued."
        detail = {
            "verdict": "INCOMPLETE",
            "profitPerOrder": None,
            "allowableCpa": None,
            "priceHeadroomPct": None,
            "checks": None,
            "missing": [m["item"] for m in t["missing"]],
        }
    else:
        line = t["line"]
        detail = {
            "verdict": t["verdict"],
            "profitPerOrder": t["profitPerOrder"],
            "allowableCpa": t["allowableCpa"],
            "priceHeadroomPct": t["priceHeadroomPct"],
            "checks": t["checks"],
        }
    return line + "\n" + json.dumps(detail, ensure_ascii=False, indent=2)


def _write(obj):
    sys.stdout.write(json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + "\n")
    sys.stdout.flush()


def main():
    for raw in sys.stdin:
        if not raw.strip():
            continue
        try:
            msg = json.loads(raw)
        except ValueError:
            continue
        if not isinstance(msg, dict):
            continue
        method = msg.get("method")

        def reply(result):
            _write({"jsonrpc": "2.0", "id": msg.get("id"), "result": result})

        def fail(code, message):
            _write({"jsonrpc": "2.0", "id": msg.get("id"),
                    "error": {"code": code, "message": message}})

        if method == "initialize":
            reply({
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "serverInfo": {"name": "cam-verdict", "version": "1.1.0"},
            })
        elif method == "ping":
            reply({})
        elif method == "tools/list":
            reply({"tools": [TOOL]})
        elif method == "tools/call":
            params = msg.get("params") or {}
            if params.get("name") != "cam_verdict":
                fail(-32602, "unknown tool")
                continue
            try:
                text = run_verdict(params.get("arguments") or {})
                reply({"content": [{"type": "text", "text": text}], "isError": False})
            except Exception as e:  # mirror the JS server: report, don't crash
                reply({"content": [{"type": "text", "text": "Error: " + str(e)}],
                       "isError": True})
        else:
            if "id" in msg:
                fail(-32601, "method not found")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
