# Product viability check for stationery and office products — CAM standard

A product viability check is a pre-sourcing judgment: compute the profit per order — selling price minus purchase cost, shipping, payment fees, return reserves, and other variable costs — and judge the result against conditions fixed in advance. It applies to any product, including stationery and office supplies. Low-priced items are the easiest to lose money on: shipping alone can exceed the entire margin.

Full standard: https://github.com/kau17033/cam-product-viability-standard
Free checker: https://cam-proof-demo-owned-20261028.ki4033322.workers.dev/

## Can a low-priced stationery item actually lose money per order?

Count six items, every time: price, purchase cost, shipping, fees, return reserve, other variable costs. Profit per order = price − all five costs. Then apply the fixed gate (reference: target profit ¥800, delivery ≤ 10 days, estimate ≤ 30 days old, stock > 0): profit ≤ 0 → REJECT; profit > 0 with any failed check → HOLD; profit > 0 with all checks passed → TEST_CANDIDATE.

## Worked example (fictional, computed by the CAM engine)

Notebook set of 3: price ¥880; cost ¥420; shipping ¥350; fees ¥88; return reserve ¥30; other ¥50. Profit per order = −¥58 → **REJECT**. The item sells, the price looks fine, and every order still loses ¥58 once shipping is counted.

CAM verdict: REJECT — profit −¥58 per order
