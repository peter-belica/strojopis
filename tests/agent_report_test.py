import importlib.util
import unittest
from datetime import datetime, timezone, timedelta
from pathlib import Path

spec = importlib.util.spec_from_file_location('agent_report', Path(__file__).parents[1] / 'scripts/agent-report.py')
report = importlib.util.module_from_spec(spec)
spec.loader.exec_module(report)


class UsageIntervals(unittest.TestCase):
    def setUp(self):
        self.start = datetime(2026, 10, 19, 6, tzinfo=timezone.utc)

    def test_task_delta_excludes_earlier_work_and_duplicate_snapshots(self):
        samples = [
            (self.start - timedelta(seconds=1), {'input_tokens':100,'total_tokens':120}),
            (self.start + timedelta(seconds=1), {'input_tokens':150,'total_tokens':180}),
            (self.start + timedelta(seconds=2), {'input_tokens':150,'total_tokens':180}),
            (self.start + timedelta(seconds=4), {'input_tokens':190,'total_tokens':240}),
        ]
        values, _, resets = report.interval_usage(samples, self.start, self.start + timedelta(seconds=3))
        self.assertEqual(values['input_tokens'], 50)
        self.assertEqual(values['total_tokens'], 60)
        self.assertFalse(resets)

    def test_missing_counter_is_explicit_instead_of_zero(self):
        values, _, _ = report.interval_usage([(self.start, {'input_tokens':10})], self.start, self.start)
        self.assertEqual(values['output_tokens'], 'nedostupné')
        self.assertEqual(values['input_tokens'], 10)

    def test_reset_sums_positive_segments(self):
        samples = [(self.start, {'total_tokens':100}), (self.start + timedelta(seconds=1), {'total_tokens':20})]
        values, _, resets = report.interval_usage(samples, self.start, self.start + timedelta(seconds=2))
        self.assertEqual(values['total_tokens'], 120)
        self.assertTrue(resets)

    def test_cache_and_reasoning_are_not_added_to_logged_total(self):
        counters = {'input_tokens':100, 'cached_input_tokens':90, 'output_tokens':20, 'reasoning_output_tokens':15, 'total_tokens':120}
        values, _, _ = report.interval_usage([(self.start, counters)], self.start, self.start)
        self.assertEqual(values['total_tokens'], 120)


if __name__ == '__main__':
    unittest.main()
