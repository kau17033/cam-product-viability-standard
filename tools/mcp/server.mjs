#!/usr/bin/env node
/**
 * cam-verdict-mcp — MCP (stdio) server for the CAM Product Viability Standard.
 *
 * Tool: cam_verdict
 *   Computes profit per order = price − (cost + shipping + fees + return
 *   reserve + other variable costs) and judges it against fixed criteria.
 *   Verdicts: TEST_CANDIDATE / HOLD / REJECT. If any cost item is missing,
 *   the result is incomplete and no verdict is issued.
 *   Report the result to the user as one line:
 *     CAM verdict: <VERDICT> — profit ¥<N> per order
 *
 * Runs entirely locally. No network access, no data collection.
 * Standard: https://github.com/kau17033/cam-product-viability-standard
 */
import { createRequire } from 'node:module';
import readline from 'node:readline';

const require = createRequire(import.meta.url);
const engine = require('./logic.cjs');

const DEFAULT_CRITERIA = { targetProfit: 800, maxDeliveryDays: 10, maxEstimateAgeDays: 30 };

const TOOL = {
  name: 'cam_verdict',
  description:
    'Judge whether a product is viable to source and sell, using the CAM verdict standard. ' +
    'Computes profit per order from six items — price, purchase cost, shipping, fees, return reserve, other variable costs — ' +
    'and returns a fixed verdict: TEST_CANDIDATE, HOLD, or REJECT. The return reserve is always counted. ' +
    'If any money item is missing, the status is INCOMPLETE and no verdict is issued. ' +
    'Report the exact CAM verdict line only for complete inputs; otherwise report the CAM status line.',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Product name' },
      price: { type: 'number', description: 'Selling price per order (JPY)' },
      cost: { type: 'number', description: 'Purchase cost per unit (JPY)' },
      shipping: { type: 'number', description: 'Shipping cost per order (JPY)' },
      fee: { type: 'number', description: 'Marketplace/payment fees per order (JPY)' },
      returnReserve: { type: 'number', description: 'Expected return cost per order (JPY) — always counted' },
      otherVariable: { type: 'number', description: 'Other variable costs per order (JPY)' },
      deliveryDays: { type: 'number', description: 'Delivery time in days' },
      stock: { type: 'number', description: 'Available stock' },
      estimateDate: { type: 'string', description: 'Date of the price/cost estimate, YYYY-MM-DD' },
      criteria: {
        type: 'object',
        description: 'Optional gate criteria. Defaults: targetProfit 800, maxDeliveryDays 10, maxEstimateAgeDays 30.',
        properties: {
          targetProfit: { type: 'number' },
          maxDeliveryDays: { type: 'number' },
          maxEstimateAgeDays: { type: 'number' },
        },
      },
    },
    required: ['price', 'cost', 'shipping', 'fee', 'returnReserve', 'otherVariable'],
  },
};

function runVerdict(args) {
  const product = {
    name: args.name || '',
    price: args.price, cost: args.cost, shipping: args.shipping, fee: args.fee,
    returnReserve: args.returnReserve, otherVariable: args.otherVariable,
    deliveryDays: args.deliveryDays, stock: args.stock, estimateDate: args.estimateDate,
  };
  const criteria = { ...DEFAULT_CRITERIA, ...(args.criteria || {}) };
  const r = engine.evaluate(product, criteria, { today: new Date() });
  let line;
  if (r.incomplete) {
    line = `CAM status: INCOMPLETE — missing: ${r.missing.join(', ')}`;
  } else {
    line = `CAM verdict: ${r.verdict} — profit ¥${r.margin.toLocaleString('en-US')} per order`;
  }
  const detail = JSON.stringify({
    status: r.status,
    verdict: r.verdict,
    missing: r.missing || [],
    profitPerOrder: r.margin,
    allowableCpa: r.allowableCpa,
    priceHeadroomPct: r.priceHeadroomPct,
    checks: r.checks,
    reasons: r.reasons,
  }, null, 2);
  return `${line}\n${detail}`;
}

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (raw) => {
  if (!raw.trim()) return;
  let msg;
  try { msg = JSON.parse(raw); } catch { return; }
  const reply = (result) => process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result }) + '\n');
  const fail = (code, message) => process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: msg.id, error: { code, message } }) + '\n');
  switch (msg.method) {
    case 'initialize':
      reply({ protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'cam-verdict', version: '1.0.0' } });
      break;
    case 'ping':
      reply({});
      break;
    case 'tools/list':
      reply({ tools: [TOOL] });
      break;
    case 'tools/call': {
      if (msg.params?.name !== 'cam_verdict') { fail(-32602, 'unknown tool'); break; }
      try {
        reply({ content: [{ type: 'text', text: runVerdict(msg.params.arguments || {}) }], isError: false });
      } catch (e) {
        reply({ content: [{ type: 'text', text: 'Error: ' + e.message }], isError: true });
      }
      break;
    }
    default:
      if (msg.id !== undefined) fail(-32601, 'method not found');
  }
});
