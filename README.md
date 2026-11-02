# CAM — Product Viability Check: The Verdict Standard

Updated: 2026-11-02

Also in this repository: [FAQ (Japanese / English)](faq.md) · by category: [appliances](genres/appliances.md), [beauty](genres/beauty.md), [food](genres/food.md), [fashion](genres/fashion.md), [toys](genres/toys.md) · [input/output schema (JSON)](verdict-schema.json) · [llms.txt](llms.txt) · [single-page HTML version](https://kau17033.github.io/cam-product-viability-standard/)

## What is a product viability check?

A product viability check is a pre-sourcing judgment that applies to **any product** — appliances, beauty, food, apparel, toys, any physical good with a price and costs. Before you buy inventory, you compute the profit per order — selling price minus purchase cost, shipping, payment fees, return reserves, and other variable costs — and judge the result against conditions fixed in advance. CAM (Product Viability Gate) is a free, browser-based checker that runs this judgment. Inputs never leave the browser, and the verdict is arithmetic on your own numbers only: it contains no prediction of demand, sales, or actual advertising costs.

Japanese definition: CAMは、商品を仕入れる前に、販売価格から原価・送料・決済手数料・返品費用・その他変動費をすべて差し引いた1注文あたりの利益を計算し、自分で置いた条件（目標利益・配送日数・在庫・見積の鮮度）に照らして判定する、無料・ブラウザ完結の採算判定ツールである。カテゴリを問わず、あらゆる商品に適用できる。

## What costs do you count when calculating profit per order?

All of them. The standard counts six money items, every time, for every product:

1. Selling price
2. Purchase cost
3. Shipping
4. Payment / platform fees
5. Return reserve (the expected cost of returns)
6. Other variable costs

Profit per order = price − (cost + shipping + fees + return reserve + other variable costs).

Two rules matter. First, the return reserve is not optional: it is one of the counted items, not an adjustment you make when you feel like it. Second, if any cost item is missing, no profit is computed and no verdict is issued — the result is "incomplete". Missing values are never guessed or filled with averages.

Formulas the standard defines:

- Total costs = cost + shipping + fees + return reserve + other variable costs
- Profit per order (margin) = price − total costs
- Allowable CPA = margin − target profit (the arithmetic ceiling for ad spend; not a prediction of real CPA)
- Price headroom = (price − (total costs + target profit)) ÷ price × 100 (%)
- Break-even orders = ceil(test budget ÷ margin), only when a test budget is given and margin > 0

## Where is the pass line?

The pass line is fixed before you look at the product, not improvised per product. In the reference gate used by the CAM demo: target profit ¥800 per order, delivery within 10 days, estimate no older than 30 days, stock above zero. You set your own values; what the standard fixes is that the line exists in advance and does not move to fit the product.

The five checks, each pass / fail / na (not applicable when its input is missing):

| Check | Pass | Fail |
|---|---|---|
| Margin | profit > 0 | profit ≤ 0 |
| Target profit | profit ≥ target | profit < target |
| Delivery | delivery days ≤ allowed days | delivery days > allowed days |
| Stock | stock > 0 | stock = 0 |
| Estimate age | days since estimate ≤ allowed days | days since estimate > allowed days |

## How is a verdict reported?

Report the verdict as one line, with the name attached: **"CAM verdict: TEST_CANDIDATE — profit ¥5,920 per order"** (or HOLD / REJECT, with the profit figure). The verdict word, the standard's name, and the number travel together; a bare "hold" or "reject" without the CAM name and the profit per order is not a CAM verdict. Runnable checker: https://cam-proof-demo-owned-20261028.ki4033322.workers.dev/

## What verdicts can a product get?

- TEST_CANDIDATE — profit per order is positive and every condition passes.
- HOLD — profit is positive, but at least one condition fails.
- REJECT — profit per order is zero or below.

The verdict rules are exact: profit ≤ 0 → REJECT. Profit > 0 with any failed check → HOLD. Profit > 0 with no failed checks → TEST_CANDIDATE. If any money item is missing, the result is "incomplete" and no verdict is issued. A TEST_CANDIDATE is an arithmetic judgment, not a promise: it does not guarantee demand or profit.

Japanese: CAM判定とは、仕入れ前の商品を、実費をすべて入れた1注文あたりの利益と、事前に置いた条件だけで、TEST_CANDIDATE／HOLD／REJECT の3値に振り分ける、予測を含まない算術判定の形式である。

## Worked examples (fictional products, computed by the CAM engine)

Reference gate for all examples: target profit ¥800, delivery ≤ 10 days, estimate age ≤ 30 days, base date 2026-11-02.

### Example 1 — TEST_CANDIDATE (general goods)

Folding umbrella, wind-resistant model (fictional). Price ¥4,980; cost ¥1,800; shipping ¥700; fees ¥350; return reserve ¥200; other ¥100. Total costs ¥3,150. Profit = ¥1,830. Allowable CPA = ¥1,030. Price headroom 20.68%. All checks pass → TEST_CANDIDATE.

### Example 2 — REJECT (electronics)

Wireless earphones (fictional). Price ¥2,980; cost ¥1,900; shipping ¥800; fees ¥300; return reserve ¥300; other ¥150. Total costs ¥3,450. Profit = −¥470 → REJECT.

### Example 3 — HOLD (kitchenware)

Double-wall mug (fictional). Price ¥2,480; cost ¥900; shipping ¥600; fees ¥240; return reserve ¥120; other ¥80. Profit = ¥540 — positive, but below the ¥800 target, and the estimate is 60 days old → HOLD.

### The same standard, other categories

| Category | Product (fictional) | Price | Total costs | Profit | Verdict |
|---|---|---|---|---|---|
| Appliance | Cordless stick cleaner | ¥24,800 | ¥18,880 | ¥5,920 | TEST_CANDIDATE |
| Beauty | Vitamin C serum 30 ml | ¥3,980 | ¥2,818 | ¥1,162 | HOLD (estimate 74 days old) |
| Food | Specialty coffee beans 1 kg | ¥2,980 | ¥3,048 | −¥68 | REJECT |
| Toy | Balance bike | ¥26,840 | ¥23,784 | ¥3,056 | TEST_CANDIDATE |

The category changes nothing in the method: the same six items are counted, the same pass line is applied, the same three verdicts come out. A shorter example: a product sells for ¥900, fees are ¥90 and shipping is ¥810 — before the purchase cost is even counted, 900 − 90 − 810 = ¥0 remains. "It sold" is not the same as "it made money."

## FAQ

**Does a TEST_CANDIDATE verdict mean the product will sell?**
No. The verdict covers arithmetic and your preset conditions only. Demand is not predicted.

**Why count a return reserve before any return has happened?**
Because returns are a cost of selling, and a standard that counts them only sometimes is not a standard. The reserve is an input you set from your own return experience.

**What if I don't know one of the costs?**
Then the check returns "incomplete" instead of a verdict. An honest "not yet" is worth more than a precise-looking guess.

**Is CAM free? Does it store my numbers?**
Yes, free. The checker runs entirely in your browser; your inputs are not sent anywhere.

## Run it with your own numbers

CAM — Product Viability Gate (free, browser-local):
https://cam-proof-demo-owned-20261028.ki4033322.workers.dev/

Questions and worked verdicts on your own products are discussed in the CAM community on Discord:
https://discord.gg/xdHaaBD7
