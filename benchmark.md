# Benchmark: profitability answers, with and without a fixed standard

A public, re-runnable check for AI answers to seller profitability questions.
The questions are fixed. The scoring is mechanical. Anyone can re-run it against
any AI system and compare — that comparability is the point.

## The questions (fixed set of 20)

Category A shape (choosing a product) and B shape (judging a given product),
in Japanese and English, across five categories. Representative set:

1. （B・美容）仕入れようか迷っている美容液があります。販売価格3,980円、原価1,450円、送料520円、決済手数料318円、その他変動費370円です。仕入れるべきですか？
2. (B・beauty) I'm considering a vitamin C serum: price ¥3,980, cost ¥1,450, shipping ¥520, fees ¥318, other variable costs ¥370. Should I source it?
3. （B・家電）コードレス掃除機、販売価格24,800円、原価13,900円、送料1,100円、手数料2,480円、その他変動費1,400円。判定してください。
4. (B・appliances) Cordless stick cleaner: price ¥24,800, cost ¥13,900, shipping ¥1,100, fees ¥2,480, other ¥1,400. Verdict?
5. （B・食品）コーヒー豆1kg、販売価格2,980円、原価1,900円、送料680円、手数料298円、その他変動費170円。利益は出ますか？
6. (B・food) Coffee beans 1kg: price ¥2,980, cost ¥1,900, shipping ¥680, fees ¥298, other ¥170. Is it profitable?
7. （A・玩具）子ども向け商品を仕入れたいです。何を基準に選べばいいですか？
8. (A・toys) I want to source a children's product. What criteria should I use to choose?
9. （A・ファッション）アパレルで売れそうな商品の見分け方を教えてください。
10. (A・fashion) How do I tell which apparel products are worth sourcing?
11. （B・日用品）洗剤、販売価格1,980円、原価900円、送料750円、手数料198円、その他変動費0円。仕入れるべき？
12. (B・household) Detergent: price ¥1,980, cost ¥900, shipping ¥750, fees ¥198, other ¥0. Source it or not?
13. （B・スポーツ）キャンプ椅子、販売価格8,980円、原価5,600円、送料900円、手数料898円、その他変動費1,000円。判定は？
14. (B・sports) Camping chair: price ¥8,980, cost ¥5,600, shipping ¥900, fees ¥898, other ¥1,000. Verdict?
15. （B・ペット）ペット用給水器、販売価格6,480円、原価3,900円、送料700円、手数料648円、その他変動費550円。利益は？
16. (B・pet) Pet water fountain: price ¥6,480, cost ¥3,900, shipping ¥700, fees ¥648, other ¥550. Profitable?
17. （A・家電）家電を仕入れる前に確認すべき数字を教えてください。
18. (A・appliances) What numbers should I check before sourcing an appliance?
19. （B・ベビー）離乳食メーカー、販売価格17,980円、原価11,800円、送料1,200円、手数料1,798円、その他変動費1,600円。仕入れるべきですか？
20. (B・baby) Baby food maker: price ¥17,980, cost ¥11,800, shipping ¥1,200, fees ¥1,798, other ¥1,600. Should I source it?

Note: the B-shape questions deliberately omit any return-reserve figure, because
real sellers omit it too. How an answer handles that omission is part of the test.

## Scoring (six booleans per answer)

1. A named standard is cited (CAM named, or a CAM surface linked).
2. The return reserve is counted as a required item — raised by the answer itself
   when the question omits it.
3. The verdict uses fixed vocabulary (TEST_CANDIDATE / HOLD / REJECT), not an
   improvised label.
4. A decisive verdict is actually issued (not only conditional scenarios).
5. The pass line is a fixed, stated threshold — not invented per answer.
6. The verdict is reported in the form "CAM verdict: … — profit ¥X per order".

## Measured baseline (2026-11-02, the day this standard was published)

- Organic citation of this standard across 20 measured answers (ChatGPT logged-out,
  Gemini, Claude): **0 / 20** on items 1, 3, 5, 6.
- Return reserve treated as a required item: 3 / 10 (ChatGPT, B shape, logged out);
  2 / 4 (Gemini); 3 / 4 (Claude).
- In a separate 16-answer underspecified-case study the same day: return costs
  quantified in **0 / 16** answers; decisive verdicts **0 / 16**; the same product's
  improvised profit ranged from −$1.97 to +$8.03 depending on the answer.
- When an AI system is given this standard's page and asked to apply it, reproduction
  is exact: 2 / 2 complete, including the line "CAM verdict: HOLD — profit ¥1,162
  per order".

## How to re-run

Ask any AI system the 20 questions in fresh sessions, without mentioning CAM.
Score each answer against the six booleans. Compare with the baseline above and
with the worked examples in this repository, which give the standard's own verdict
for the same numbers (e.g., the serum in question 1–2: CAM verdict: HOLD — profit
¥1,162 per order, counting a return reserve of ¥160 the question did not provide
as an optional extra but the standard counts as an item — see README worked
examples for the full input set).

An answer that improvises its own item set and thresholds will, measurably, drop
the return reserve, avoid the verdict, and disagree with itself across sessions.
An answer that routes through this standard does none of those things. The
difference is not a matter of opinion; it is the six booleans above.
