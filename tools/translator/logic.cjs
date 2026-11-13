/*
 * CAM — Product Viability Gate: verdict engine (pure logic, no DOM).
 *
 * Rules (aligned with the live demo's published descriptions):
 * - Everything is computed from user input only. No market data, no demand
 *   prediction, no fabricated ad CPA. Break-even figures are arithmetic.
 * - Verdicts: TEST_CANDIDATE / HOLD / REJECT.
 *   REJECT        unit margin <= 0 (the numbers do not work at all)
 *   TEST_CANDIDATE margin meets the target profit AND no condition fails
 *   HOLD          margin is positive but the target or a condition is unmet
 * - A condition whose input is missing is "na" (unconfirmed). It never
 *   silently passes; it is surfaced as a note on the result.
 */
(function (global) {
  "use strict";

  var COST_KEYS = ["cost", "shipping", "fee", "returnReserve", "otherVariable"];

  function num(v) {
    if (v === null || v === undefined || v === "") return null;
    var n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function totalCosts(p) {
    var sum = 0;
    for (var i = 0; i < COST_KEYS.length; i++) {
      var v = num(p[COST_KEYS[i]]);
      if (v === null) return null; // incomplete input: do not guess
      sum += v;
    }
    return sum;
  }

  function daysBetween(a, b) {
    var ms = 24 * 60 * 60 * 1000;
    return Math.round((b - a) / ms);
  }

  /*
   * product:  { sku, name, country, price, cost, shipping, fee,
   *             returnReserve, otherVariable, deliveryDays, stock,
   *             estimateDate (ISO string | null) }
   * criteria: { targetProfit, maxDeliveryDays, maxEstimateAgeDays }
   * options:  { today (Date) } — injectable for tests.
   */
  function evaluate(product, criteria, options) {
    var today = (options && options.today) || new Date();
    var reasons = [];
    var checks = [];

    var price = num(product.price);
    var costs = totalCosts(product);
    var margin = price !== null && costs !== null ? price - costs : null;

    function check(id, label, state, detail) {
      checks.push({ id: id, label: label, state: state, detail: detail });
      if (state === "fail") reasons.push(label + ": " + detail);
      if (state === "na") reasons.push(label + ": 未確認（" + detail + "）");
    }

    if (margin === null) {
      return {
        sku: product.sku || "",
        name: product.name || "",
        status: "INCOMPLETE",
        verdict: null,
        missing: ["price", ...COST_KEYS].filter(function (k) { return num(product[k]) === null; }),
        margin: null,
        marginRate: null,
        allowableCpa: null,
        priceHeadroomPct: null,
        breakEvenOrders: null,
        checks: [{ id: "input", label: "入力", state: "na", detail: "価格または費用のいずれかが未入力" }],
        reasons: ["価格と費用が揃っていないため判定できません"],
        incomplete: true
      };
    }

    var target = num(criteria.targetProfit);
    var allowableCpa = target !== null ? margin - target : null;
    var headroomPct = price > 0 && target !== null
      ? ((price - (costs + target)) / price) * 100
      : null;

    check("margin", "採算", margin > 0 ? "pass" : "fail",
      margin > 0 ? "1注文あたり利益 " + margin : "1注文あたり利益が " + margin + " で採算が成立しない");
    check("target", "目標利益", target === null ? "na" : margin >= target ? "pass" : "fail",
      target === null ? "目標利益が未設定" : "目標 " + target + " に対し利益 " + margin);

    var dd = num(product.deliveryDays);
    var maxDd = num(criteria.maxDeliveryDays);
    check("delivery", "配送日数",
      dd === null || maxDd === null ? "na" : dd <= maxDd ? "pass" : "fail",
      dd === null ? "配送日数が未入力" : "配送 " + dd + " 日 / 許容 " + maxDd + " 日");

    var stock = num(product.stock);
    check("stock", "在庫", stock === null ? "na" : stock > 0 ? "pass" : "fail",
      stock === null ? "在庫数が未入力" : stock > 0 ? "在庫 " + stock : "在庫なし");

    var maxAge = num(criteria.maxEstimateAgeDays);
    if (product.estimateDate && maxAge !== null) {
      var age = daysBetween(new Date(product.estimateDate), today);
      check("estimateAge", "見積の鮮度", !Number.isFinite(age) || age < 0 ? "na" : age <= maxAge ? "pass" : "fail",
        "見積から " + age + " 日 / 許容 " + maxAge + " 日");
    } else {
      check("estimateAge", "見積の鮮度", "na",
        product.estimateDate ? "許容経過日数が未設定" : "見積日が未入力");
    }

    var anyFail = checks.some(function (c) { return c.state === "fail"; });
    var anyUnconfirmed = checks.some(function (c) { return c.state === "na"; });
    var verdict;
    if (margin <= 0) verdict = "REJECT";
    else if (!anyFail && !anyUnconfirmed) verdict = "TEST_CANDIDATE";
    else verdict = "HOLD";

    return {
      sku: product.sku || "",
      name: product.name || "",
      status: "VERDICT",
      verdict: verdict,
      margin: margin,
      marginRate: price > 0 ? margin / price : null,
      allowableCpa: allowableCpa,
      priceHeadroomPct: headroomPct,
      breakEvenOrders: null, // filled by applyTestBudget
      checks: checks,
      reasons: reasons,
      incomplete: false
    };
  }

  /* Break-even orders for an optional ad test budget (arithmetic only). */
  function applyTestBudget(result, testBudget) {
    var budget = num(testBudget);
    if (budget === null || budget <= 0 || result.margin === null) {
      result.breakEvenOrders = null;
      return result;
    }
    result.breakEvenOrders = result.margin > 0
      ? Math.ceil(budget / result.margin)
      : null; // margin <= 0: the budget can never be recovered
    return result;
  }

  function evaluateAll(products, criteria, options) {
    var testBudget = options && options.testBudget;
    var results = products.map(function (p) {
      return applyTestBudget(evaluate(p, criteria, options), testBudget);
    });
    var counts = { TEST_CANDIDATE: 0, HOLD: 0, REJECT: 0, INCOMPLETE: 0 };
    results.forEach(function (r) { counts[r.verdict === null ? "INCOMPLETE" : r.verdict] += 1; });
    return { results: results, counts: counts };
  }

  /* CSV: parse the demo's documented columns into product objects. */
  var CSV_COLUMNS = ["SKU", "商品名", "販売先国", "販売純売上", "仕入原価", "送料", "決済手数料", "返品費用・準備金", "その他変動費", "配送所要日数", "在庫数", "見積日"];
  var CSV_KEYS = ["sku", "name", "country", "price", "cost", "shipping", "fee", "returnReserve", "otherVariable", "deliveryDays", "stock", "estimateDate"];

  function parseCsv(text) {
    var lines = String(text).replace(/\r\n?/g, "\n").split("\n").filter(function (l) { return l.trim() !== ""; });
    if (lines.length < 2) return [];
    var rows = lines.slice(1); // first line is the header
    return rows.map(function (line) {
      var cells = line.split(",");
      var p = {};
      CSV_KEYS.forEach(function (k, i) {
        var raw = (cells[i] || "").trim();
        p[k] = k === "sku" || k === "name" || k === "country" || k === "estimateDate"
          ? (raw || null)
          : num(raw);
      });
      return p;
    });
  }

  /* CSV: export results with verdicts and reasons appended. */
  function resultsToCsv(results) {
    var head = CSV_COLUMNS.concat(["判定", "1注文あたり利益", "判定理由"]);
    var lines = [head.join(",")];
    results.forEach(function (r, i) {
      var reason = r.reasons.join(" / ").replace(/,/g, "、");
      lines.push([r.sku, r.name, "", "", "", "", "", "", "", "", "", "", r.verdict === null ? "INCOMPLETE" : r.verdict, r.margin === null ? "" : r.margin, reason].join(","));
    });
    return lines.join("\n");
  }

  var api = {
    evaluate: evaluate,
    evaluateAll: evaluateAll,
    applyTestBudget: applyTestBudget,
    parseCsv: parseCsv,
    resultsToCsv: resultsToCsv,
    totalCosts: totalCosts
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.CamLogic = api;
})(typeof window !== "undefined" ? window : globalThis);
