"use strict";
const assert = require("node:assert/strict");
const analysis = require("../analysis/analysis.cjs");
const core = require("../tools/mcp/logic.cjs");
const DATE = new Date("2026-11-13T00:00:00Z");
const criteria = Object.freeze({targetProfit: 800, maxDeliveryDays: 10, maxEstimateAgeDays: 30});
const base = {price: 4980, cost: 1800, shipping: 700, fee: 350,
  returnReserve: 200, otherVariable: 100, deliveryDays: 5,
  stock: 3, estimateDate: "2026-11-02"};
const expected = core.evaluate(base, criteria, {today: DATE});
assert.equal(expected.margin, 1830);
assert.equal(expected.verdict, "TEST_CANDIDATE");
const before = JSON.stringify(base);
const a = analysis.analyze(Object.freeze({...base}), {
  targetProfit: 800, intervals: {shipping: {low: 600, high: 900}}
});
assert.deepEqual(a.boundaries, {extraCostToReject: 1830, extraCostToFailTargetCheck: 1031});
assert.deepEqual(a.interval, {lowerMargin: 1630, upperMargin: 1930,
  kind: "user_declared_bounds", coreVerdictOverridden: false});
assert.equal(a.mostFragileCost, null);
assert.equal(JSON.stringify(base), before);
assert.deepEqual(core.evaluate(base, criteria, {today: DATE}), expected);
assert.equal(analysis.minimumPriceForTarget({
  otherCosts: 1300, fixedFee: 100, targetProfit: 800,
  rateNumerator: 3, rateDenominator: 100
}), 2269);
const invalid = [
  () => analysis.analyze({...base, cost: null}),
  () => analysis.analyze({...base, cost: 0.1}),
  () => analysis.analyze(base, {intervals: {shipping: {low: 901, high: 900}}}),
  () => analysis.analyze(base, {intervals: {shipping: {low: 700, high: 699}}}),
  () => analysis.analyze(base, {intervals: {shipping: {low: 600, high: 800, mode: "guess"}}}),
  () => analysis.analyze(base, {intervals: {unknown: {low: 0, high: 1}}}),
  () => analysis.minimumPriceForTarget({otherCosts: 1, fixedFee: 1,
    targetProfit: 1, rateNumerator: 1, rateDenominator: 1})
];
for (const fn of invalid) assert.throws(fn);
// Deterministic, independent metamorphic/interval checks.
let seed = 20261113;
function next() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; }
for (let i = 0; i < 3000; i++) {
  const p = {price: (next() % 5000) + 1};
  for (const key of analysis.COST_KEYS) p[key] = next() % 700;
  Object.assign(p, {deliveryDays: 2, stock: 1, estimateDate: "2026-11-02"});
  const c = {targetProfit: next() % 1000, maxDeliveryDays: 10, maxEstimateAgeDays: 30};
  const original = core.evaluate(p, c, {today: DATE});
  const nominal = analysis.analyze(p, {targetProfit: c.targetProfit});
  assert.equal(nominal.margin, original.margin);
  assert.equal(nominal.boundaries.extraCostToReject, Math.max(0, original.margin));
  const delta = next() % 100;
  const adjusted = {...p, cost: p.cost + delta};
  assert.equal(core.evaluate(adjusted, c, {today: DATE}).margin, original.margin - delta);
  const bounds = {cost: {low: p.cost, high: p.cost + delta}};
  const result = analysis.analyze(p, {targetProfit: c.targetProfit, intervals: bounds});
  assert.equal(result.interval.lowerMargin, original.margin - delta);
  assert.equal(result.interval.upperMargin, original.margin);
  if (original.margin > 0) {
    const crossing = {...p, cost: p.cost + original.margin};
    assert.equal(core.evaluate(crossing, c, {today: DATE}).verdict, "REJECT");
  }
  assert.deepEqual(core.evaluate(p, c, {today: DATE}), original);
}
for (let x = 0; x <= 100; x++) {
  const f = {otherCosts: 1200 + x, fixedFee: 50, targetProfit: 400,
    rateNumerator: x, rateDenominator: 101};
  const minimum = analysis.minimumPriceForTarget(f);
  const satisfies = p => BigInt(p) * BigInt(101 - x) >=
    BigInt(f.otherCosts + f.fixedFee + f.targetProfit) * 101n;
  assert.equal(satisfies(minimum), true);
  if (minimum > 0) assert.equal(satisfies(minimum - 1), false);
}
console.log("PASS analysis contract: 3000 seeded cases, 101 price inversions, 7 invalid inputs");
