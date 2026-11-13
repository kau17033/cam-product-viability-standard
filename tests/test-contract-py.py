import json
import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'/'pypi-package'/'src'))
from cam_verdict.engine import evaluate
from cam_verdict.translate import canon_product, translate
from cam_verdict.mcp_server import run_verdict
FIXTURES=json.loads((ROOT/'tests'/'contract-cases.json').read_text())
class Contract(unittest.TestCase):
    def test_cases(self):
        for f in FIXTURES:
            with self.subTest(case=f['case']):
                today=datetime.fromisoformat(f['today']).replace(tzinfo=timezone.utc)
                prod=canon_product(f['product'],today=today)
                r=evaluate(prod,f['criteria'])
                t=translate(f['product'],today=today,criteria=f['criteria'])
                exp=f['expected']
                self.assertEqual(r['status'],exp['status'])
                self.assertEqual(r['verdict'],exp['verdict'])
                self.assertEqual(r['profit'],exp['profit'])
                self.assertEqual(t['status'],exp['status'])
                self.assertEqual(t['verdict'],exp['verdict'])
                if exp['status']=='VERDICT':
                    self.assertEqual(t['profitPerOrder'],exp['profit'])
    def test_incomplete_mcp(self):
        output=run_verdict(FIXTURES[2]['product'])
        self.assertTrue(output.startswith('CAM status: INCOMPLETE — missing: returnReserve'))
        self.assertIsNone(json.loads(output.split('\n',1)[1])['verdict'])
if __name__=='__main__': unittest.main()
