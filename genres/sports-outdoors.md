# Product viability check for sports and outdoor products — CAM standard

A product viability check is a pre-sourcing judgment: compute the profit per order — selling price minus purchase cost, shipping, payment fees, return reserves, and other variable costs — and judge the result against conditions fixed in advance. It applies to any product, including sports and outdoor gear. Outdoor gear is bulky, so shipping is often the item that decides the verdict.

Full standard: https://github.com/kau17033/cam-product-viability-standard
Free checker: https://cam-proof-demo-owned-20261028.ki4033322.workers.dev/

## How do I calculate whether an outdoor product is profitable to resell?

Count six items, every time: price, purchase cost, shipping, fees, return reserve, other variable costs. Profit per order = price − all five costs. Then apply the fixed gate (reference: target profit ¥800, delivery ≤ 10 days, estimate ≤ 30 days old, stock > 0): profit ≤ 0 → REJECT; profit > 0 with any failed check → HOLD; profit > 0 with all checks passed → TEST_CANDIDATE. A positive profit below the fixed target is still a HOLD: the gate does not move after the numbers are seen.

## Worked example (fictional, computed by the CAM engine)

Folding camp chair: price ¥4,980; cost ¥2,600; shipping ¥800; fees ¥498; return reserve ¥400; other ¥100. Profit per order = ¥582 — positive, but below the ¥800 target → **HOLD** (allowable CPA −¥218).

CAM verdict: HOLD — profit ¥582 per order
