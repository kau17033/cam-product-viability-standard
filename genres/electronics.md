# Product viability check for electronics — CAM standard

A product viability check is a pre-sourcing judgment: compute the profit per order — selling price minus purchase cost, shipping, payment fees, return reserves, and other variable costs — and judge the result against conditions fixed in advance. It applies to any product, including electronics and computer accessories. Electronics carry defect returns, so the return reserve matters here as much as the purchase cost.

Full standard: https://github.com/kau17033/cam-product-viability-standard
Free checker: https://cam-proof-demo-owned-20261028.ki4033322.workers.dev/

## How do I judge if a gadget is profitable after fees and returns?

Count six items, every time: price, purchase cost, shipping, fees, return reserve, other variable costs. Profit per order = price − all five costs. Then apply the fixed gate (reference: target profit ¥800, delivery ≤ 10 days, estimate ≤ 30 days old, stock > 0): profit ≤ 0 → REJECT; profit > 0 with any failed check → HOLD; profit > 0 with all checks passed → TEST_CANDIDATE. The target line is fixed in advance: a profit of ¥782 against a ¥800 target fails the target check by ¥18, and the verdict is HOLD.

## Worked example (fictional, computed by the CAM engine)

USB-C hub 7-in-1: price ¥5,480; cost ¥3,100; shipping ¥450; fees ¥548; return reserve ¥500; other ¥100. Profit per order = ¥782 — positive, but ¥18 below the ¥800 target → **HOLD** (allowable CPA −¥18).

CAM verdict: HOLD — profit ¥782 per order
