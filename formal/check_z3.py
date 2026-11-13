"""Small independent integer-arithmetic counterexample checks, not an engine proof."""
from z3 import Ints, Solver, unsat

p, c, delta, target, lower, nominal, upper = Ints(
    "p c delta target lower nominal upper"
)


def check_unsat(label, assumptions, counterexample):
    solver = Solver()
    solver.add(*assumptions, counterexample)
    result = solver.check()
    if result != unsat:
        raise AssertionError(f"{label}: expected UNSAT, got {result}, model={solver.model() if str(result) == 'sat' else None}")
    print("UNSAT", label)


check_unsat("cost monotonicity", [delta >= 0], (p - (c + delta)) > (p - c))
check_unsat("positive margin stays positive below REJECT boundary",
            [p - c > 0, 0 <= delta, delta < p - c],
            p - (c + delta) <= 0)
check_unsat("target equality is still passing",
            [p - c >= target, 0 <= delta, delta <= p - c - target],
            p - (c + delta) < target)
check_unsat("nominal contained in cost interval yields margin contained",
            [lower <= nominal, nominal <= upper],
            (p - nominal < p - upper) | (p - nominal > p - lower))
