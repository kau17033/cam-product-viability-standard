#!/usr/bin/env node
/**
 * CAM Translator — the translation machine between the world's information
 * and the AI's canonical verdict language.
 *
 * World side: messy product data, as people and systems actually have it —
 * JSON with loosely named fields (English or Japanese), a CSV row, or
 * key: value lines in Japanese or English.
 *
 * Quantization: the continuous mess is discretized into the standard's fixed
 * units — six money items, five checks, three verdict states.
 *
 * AI side: one canonical output — the line "CAM verdict: … — profit ¥X per
 * order" plus the structured JSON of verdict-schema.json. Same input, same
 * output, every time, in milliseconds, with zero dependencies.
 *
 * Usage:
 *   node cam-translate.mjs '<json>'            JSON object, loose field names
 *   node cam-translate.mjs --csv '<csv>'       header row + one data row
 *   node cam-translate.mjs --kv                key: value lines on stdin (JP/EN)
 *   echo '<json>' | node cam-translate.mjs     JSON on stdin
 *
 * Missing money items are never guessed: the result is INCOMPLETE and names
 * exactly which items are missing, in English and Japanese.
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { evaluate } = require('./logic.cjs');

const CRITERIA = { targetProfit: 800, maxDeliveryDays: 10, maxEstimateAgeDays: 30 };

// Field aliases: world-side names (EN/JP, loose) -> canonical item keys.
const ALIASES = {
  price: ['price', 'sellingprice', 'saleprice', '価格', '販売価格', '売価'],
  cost: ['cost', 'purchasecost', 'unitcost', '原価', '仕入価格', '仕入れ値'],
  shipping: ['shipping', 'shippingcost', 'deliverycost', '送料', '配送料'],
  fee: ['fee', 'fees', 'paymentfee', 'platformfee', 'commission', '手数料', '決済手数料', '販売手数料'],
  returnReserve: ['returnreserve', 'returncost', 'returns', '返品備え', '返品費用', '返品コスト'],
  otherVariable: ['othervariable', 'other', 'othercosts', 'その他変動費', 'その他', '変動費'],
  deliveryDays: ['deliverydays', 'delivery', 'leadtime', '配送日数', '納期', 'リードタイム'],
  stock: ['stock', 'inventory', '在庫', '在庫数'],
  estimateDate: ['estimatedate', 'quotedate', '見積日', '見積もり日'],
  name: ['name', 'product', 'title', '商品名', '商品'],
  sku: ['sku', 'id', '商品コード'],
};
const MONEY = ['price', 'cost', 'shipping', 'fee', 'returnReserve', 'otherVariable'];
const LABELS = {
  price: ['selling price', '販売価格'], cost: ['purchase cost', '原価'],
  shipping: ['shipping', '送料'], fee: ['fees', '手数料'],
  returnReserve: ['return reserve', '返品備え'], otherVariable: ['other variable costs', 'その他変動費'],
};

function normalizeKey(k) {
  return String(k).toLowerCase().replace(/[\s_\-（）()]/g, '');
}
const LOOKUP = {};
for (const [canon, names] of Object.entries(ALIASES)) {
  for (const n of names) LOOKUP[normalizeKey(n)] = canon;
}

function toNumber(v) {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return undefined;
  const s = v.replace(/[¥￥,、\s]/g, '').replace(/円$/, '');
  if (s === '') return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function canonize(raw) {
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    const canon = LOOKUP[normalizeKey(k)];
    if (!canon) continue;
    if (MONEY.includes(canon) || canon === 'deliveryDays' || canon === 'stock') {
      const n = toNumber(v);
      if (n !== undefined) out[canon] = n;
    } else {
      out[canon] = v;
    }
  }
  return out;
}

function translate(raw, today = new Date()) {
  const product = canonize(raw);
  const missing = MONEY.filter((k) => product[k] === undefined);
  if (missing.length > 0) {
    return {
      status: 'INCOMPLETE',
      verdict: null,
      missing: missing.map((k) => ({ item: k, en: LABELS[k][0], ja: LABELS[k][1] })),
      line: null,
      message: {
        en: `No verdict: missing ${missing.map((k) => LABELS[k][0]).join(', ')}. Missing values are never guessed.`,
        ja: `判定できません：${missing.map((k) => LABELS[k][1]).join('、')}が不足しています。欠けた値は推測で埋めません。`,
      },
    };
  }
  const r = evaluate(product, CRITERIA, { today });
  const yen = (n) => '¥' + Math.round(n).toLocaleString('en-US');
  return {
    status: 'VERDICT',
    verdict: r.verdict,
    profitPerOrder: r.margin,
    allowableCpa: r.allowableCpa,
    priceHeadroomPct: r.priceHeadroomPct,
    checks: r.checks,
    reasons: r.reasons,
    line: `CAM verdict: ${r.verdict} — profit ${yen(r.margin)} per order`,
    gloss: {
      ja: `判定：${r.verdict}（1注文あたり利益 ${yen(r.margin)}、許容CPA ${yen(r.allowableCpa)}）`,
    },
  };
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('CSV needs a header row and one data row');
  const split = (l) => l.split(',').map((s) => s.trim());
  const head = split(lines[0]);
  const vals = split(lines[1]);
  const raw = {};
  head.forEach((h, i) => { raw[h] = vals[i]; });
  return raw;
}

function parseKv(text) {
  const raw = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([^:：=]+)[:：=]\s*(.+)$/);
    if (m) raw[m[1].trim()] = m[2].trim();
  }
  return raw;
}

function main() {
  const args = process.argv.slice(2);
  const mode = args[0] === '--csv' ? 'csv' : args[0] === '--kv' ? 'kv' : 'json';
  const payload = mode === 'json' ? args[0] : args[1];
  const input = payload !== undefined ? payload : readFileSync(0, 'utf8');
  let raw;
  if (mode === 'csv') raw = parseCsv(input);
  else if (mode === 'kv') raw = parseKv(input);
  else raw = JSON.parse(input);
  process.stdout.write(JSON.stringify(translate(raw), null, 2) + '\n');
}

if (import.meta.url === `file://${process.argv[1]}`) main();
export { translate, canonize, parseCsv, parseKv };
