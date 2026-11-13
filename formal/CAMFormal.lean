import Lean

/-!
CAM arithmetic proof model, over mathematical integers.
This does NOT prove equivalence to IEEE-754 JavaScript/Python implementations.
The verdict engine is neither imported nor modified.
-/

namespace CAMFormal

def margin (price totalCosts : Int) : Int := price - totalCosts

def rejected (m : Int) : Prop := m ≤ 0

def testCandidate (m target : Int) (allChecksPass : Prop) : Prop :=
  0 < m ∧ target ≤ m ∧ allChecksPass

theorem zero_rejected : rejected 0 := by
  simp [rejected]

theorem candidate_positive (m target : Int) (pass : Prop) :
    testCandidate m target pass → 0 < m := by
  intro h
  exact h.1

theorem candidate_meets_target (m target : Int) (pass : Prop) :
    testCandidate m target pass → target ≤ m := by
  intro h
  exact h.2.1

theorem cost_increase_never_increases_margin
    (price costs delta : Int) (h : 0 ≤ delta) :
    margin price (costs + delta) ≤ margin price costs := by
  unfold margin
  omega

theorem extra_cost_to_reject (m : Int) :
    margin m m = 0 := by
  simp [margin]

theorem target_check_stays_passing_through_equality
    (m target delta : Int) (h2 : delta ≤ m - target) :
    target ≤ m - delta := by
  omega

end CAMFormal
