/**
 * View instructor-assigned workout and meal plans. Role: Member.
 */
import { useEffect, useState } from 'react';
import { memberPlanService } from '../../services';
import { LoadingSpinner, formatAppDate } from '../../components/common';
import type { MemberFitnessPlan, MemberFitnessPlanSummary } from '../../types';

export function MemberMyPlans() {
  const [plans, setPlans] = useState<MemberFitnessPlanSummary[]>([]);
  const [selected, setSelected] = useState<MemberFitnessPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    memberPlanService.getMemberPlans()
      .then(setPlans)
      .catch(() => setError('Could not load your plans.'))
      .finally(() => setLoading(false));
  }, []);

  const openPlan = async (planId: number) => {
    setDetailLoading(true);
    setError('');
    try {
      const plan = await memberPlanService.getMemberPlan(planId);
      setSelected(plan);
    } catch {
      setError('Could not load plan details.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <>
      <div className="page-title">
        <h1>My Plans</h1>
        <p>Personalized workout and meal plans prepared by your instructor.</p>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : plans.length === 0 ? (
        <div className="card">
          <p>No plans assigned yet. Your instructor will publish workout and meal plans here when ready.</p>
        </div>
      ) : (
        <div className="grid grid--2">
          <div className="plan-list">
            {plans.map((plan, index) => (
              <button
                key={plan.planId}
                type="button"
                className={`card plan-list__item ${selected?.planId === plan.planId ? 'plan-list__item--active' : ''}`}
                onClick={() => openPlan(plan.planId)}
              >
                {index === 0 && <span className="badge">Latest</span>}
                <h3>{plan.title}</h3>
                <p className="plan-list__goal">{plan.fitnessGoal}</p>
                <p className="plan-list__meta">
                  Coach: {plan.instructorName} · Updated {formatAppDate(plan.updatedAt)}
                </p>
              </button>
            ))}
          </div>

          <div className="card plan-detail">
            {detailLoading ? (
              <LoadingSpinner />
            ) : selected ? (
              <>
                <div className="plan-detail__header">
                  <div>
                    <h2>{selected.title}</h2>
                    <p className="plan-list__goal">Goal: {selected.fitnessGoal}</p>
                    <p className="plan-list__meta">Prepared by {selected.instructorName}</p>
                  </div>
                </div>

                <section className="plan-detail__section">
                  <h3>Workout plan</h3>
                  <pre className="plan-detail__content">{selected.workoutPlan}</pre>
                </section>

                <section className="plan-detail__section">
                  <h3>Meal plan</h3>
                  <pre className="plan-detail__content">{selected.mealPlan}</pre>
                </section>

                {selected.notes && (
                  <section className="plan-detail__section">
                    <h3>Coach notes</h3>
                    <pre className="plan-detail__content">{selected.notes}</pre>
                  </section>
                )}
              </>
            ) : (
              <p>Select a plan to view your workout and meal details.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
