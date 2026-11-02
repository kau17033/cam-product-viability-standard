import { translate } from './cam-translate.mjs';
const today = new Date('2026-11-02T00:00:00+09:00');
const cases = [
  [{ price: 3980, cost: 1450, shipping: 520, fee: 318, returnReserve: 160, otherVariable: 370, deliveryDays: 5, stock: 20, estimateDate: '2026-08-20' }, 'CAM verdict: HOLD — profit ¥1,162 per order'],
  [{ price: 24800, cost: 13900, shipping: 1100, fee: 2480, returnReserve: 0, otherVariable: 1400, deliveryDays: 3, stock: 50, estimateDate: '2026-10-25' }, 'CAM verdict: TEST_CANDIDATE — profit ¥5,920 per order'],
  [{ '価格': 2980, '原価': 1900, '送料': 680, '手数料': 298, '返品備え': 0, 'その他変動費': 170, '配送日数': 4, '在庫': 100, '見積日': '2026-10-28' }, 'CAM verdict: REJECT — profit ¥-68 per order'],
];
let fail = 0;
for (const [input, want] of cases) {
  const got = translate(input, today).line;
  if (got !== want) { console.log('FAIL', got, '!=', want); fail++; }
}
const inc = translate({ price: 1000, cost: 500 }, today);
if (inc.status !== 'INCOMPLETE' || inc.missing.length !== 4) { console.log('FAIL incomplete', JSON.stringify(inc)); fail++; }
console.log(fail === 0 ? 'ALL TESTS PASS (3 formats/cases + incomplete)' : `${fail} FAILURES`);
