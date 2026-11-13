/*
 * CAM arithmetic analysis v1 — ADDITIVE / READ-ONLY.
 * No market inference, no hidden defaults, no dependency on verdict engines.
 * Domain: nonnegative safe-integer JPY per order; intervals are user declarations.
 */
"use strict";

const COST_KEYS = Object.freeze(["cost", "shipping", "fee", "returnReserve", "otherVariable"]);
const MAX = BigInt(Number.MAX_SAFE_INTEGER);

function money(value, key) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new TypeError(key + " must be a nonnegative safe integer in JPY");
  }
  return BigInt(value);
}
function safeNumber(value, name) {
  if (value > MAX || value < -MAX) throw new RangeError(name + " exceeds safe integer range");
  return Number(value);
}
function object(value, name) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(name + " must be an object");
  }
  return value;
}

/**
 * Standalone analysis: never calls or modifies CAM evaluate(), verdict or inputs.
 * Optional intervals must contain the nominal input values. Unknown cost fields
 * are rejected; unspecified intervals are point ranges at the nominal value.
 */
function analyze(product, options = {}) {
  object(product, "product");
  object(options, "options");
  const price = money(product.price, "price");
  if (price === 0n) throw new RangeError("price must be positive");
  const amounts = Object.fromEntries(COST_KEYS.map(k => [k, money(product[k], k)]));
  const costSum = COST_KEYS.reduce((a, k) => a + amounts[k], 0n);
  const margin = price - costSum;
  const target = options.targetProfit === undefined ? null : money(options.targetProfit, "targetProfit");
  const intervals = options.intervals === undefined ? {} : object(options.intervals, "intervals");
  for (const key of Object.keys(intervals)) {
    if (!COST_KEYS.includes(key)) throw new TypeError("unknown interval cost: " + key);
  }
  let minCost = 0n;
  let maxCost = 0n;
  for (const key of COST_KEYS) {
    const nominal = amounts[key];
    const spec = intervals[key];
    let low = nominal, high = nominal;
    if (spec !== undefined) {
      object(spec, key + " interval");
      if (Object.keys(spec).sort().join(",") !== "high,low") {
        throw new TypeError(key + " interval must contain only low and high");
      }
      low = money(spec.low, key + ".low");
      high = money(spec.high, key + ".high");
      if (low > nominal || nominal > high) {
        throw new RangeError(key + " nominal is outside [low,high]");
      }
    }
    minCost += low;
    maxCost += high;
  }
  const lowerMargin = price - maxCost;
  const upperMargin = price - minCost;
  const deltaToTargetFailure = target === null ? null :
    margin < target ? 0n : margin - target + 1n;
  const sensitivity = {price: 1};
  for (const key of COST_KEYS) sensitivity[key] = -1;
  return {
    domain: "JPY_safe_integer_per_order",
    margin: safeNumber(margin, "margin"),
    sensitivity,
    boundaries: {
      extraCostToReject: safeNumber(margin > 0n ? margin : 0n, "extraCostToReject"),
      extraCostToFailTargetCheck: deltaToTargetFailure === null ? null :
        safeNumber(deltaToTargetFailure, "extraCostToFailTargetCheck")
    },
    interval: options.intervals === undefined ? null : {
      lowerMargin: safeNumber(lowerMargin, "lowerMargin"),
      upperMargin: safeNumber(upperMargin, "upperMargin"),
      kind: "user_declared_bounds",
      coreVerdictOverridden: false
    },
    mostFragileCost: null
  };
}

/**
 * Exact integer ceiling of (otherCosts + fixedFee + target) / (1 - rate).
 * Rate is represented as numerator/denominator, without monetary rounding.
 * Real processor rounding rules require a separate model.
 */
function minimumPriceForTarget(input) {
  object(input, "input");
  const other = money(input.otherCosts, "otherCosts");
  const fixed = money(input.fixedFee, "fixedFee");
  const target = money(input.targetProfit, "targetProfit");
  const numerator = money(input.rateNumerator, "rateNumerator");
  const denominator = money(input.rateDenominator, "rateDenominator");
  if (denominator === 0n || numerator >= denominator) {
    throw new RangeError("rate must satisfy 0 <= numerator < denominator");
  }
  const top = (other + fixed + target) * denominator;
  const bottom = denominator - numerator;
  return safeNumber((top + bottom - 1n) / bottom, "minimumPrice");
}

module.exports = {COST_KEYS, analyze, minimumPriceForTarget};
