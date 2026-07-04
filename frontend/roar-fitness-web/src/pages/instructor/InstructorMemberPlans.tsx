/**
 * Create and edit personalized workout and meal plans for assigned members.
 * Role: Instructor.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { memberPlanService, ApiError } from '../../services';
import { LoadingSpinner } from '../../components/common';
import { formatAppDate } from '../../lib/formatters';
import type {
  CreateMemberFitnessPlanRequest,
  MemberFitnessPlan,
  MemberFitnessPlanSummary,
  MemberPlanMemberOption,
  UpdateMemberFitnessPlanRequest,
} from '../../types';

const emptyForm = {
  memberId: '',
  title: '',
  fitnessGoal: '',
  workoutPlan: '',
  mealPlan: '',
  notes: '',
};

export function InstructorMemberPlans() {
  const [plans, setPlans] = useState<MemberFitnessPlanSummary[]>([]);
  const [members, setMembers] = useState<MemberPlanMemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MemberFitnessPlan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [planList, memberList] = await Promise.all([
        memberPlanService.getInstructorPlans(),
        memberPlanService.getMembersForPlanning(),
      ]);
      setPlans(planList);
      setMembers(memberList);
    } catch {
      setError('Could not load member plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingPlan(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = async (planId: number) => {
    setError('');
    try {
      const plan = await memberPlanService.getInstructorPlan(planId);
      setEditingPlan(plan);
      setForm({
        memberId: String(plan.memberId),
        title: plan.title,
        fitnessGoal: plan.fitnessGoal,
        workoutPlan: plan.workoutPlan,
        mealPlan: plan.mealPlan,
        notes: plan.notes ?? '',
      });
      setModalOpen(true);
    } catch {
      setError('Could not load plan for editing.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingPlan) {
        const payload: UpdateMemberFitnessPlanRequest = {
          title: form.title.trim(),
          fitnessGoal: form.fitnessGoal.trim(),
          workoutPlan: form.workoutPlan.trim(),
          mealPlan: form.mealPlan.trim(),
          notes: form.notes.trim() || undefined,
        };
        await memberPlanService.updatePlan(editingPlan.planId, payload);
        setSuccess('Plan updated successfully.');
      } else {
        const payload: CreateMemberFitnessPlanRequest = {
          memberId: Number(form.memberId),
          title: form.title.trim(),
          fitnessGoal: form.fitnessGoal.trim(),
          workoutPlan: form.workoutPlan.trim(),
          mealPlan: form.mealPlan.trim(),
          notes: form.notes.trim() || undefined,
        };
        await memberPlanService.createPlan(payload);
        setSuccess('Plan created and shared with the member.');
      }

      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (planId: number) => {
    if (!window.confirm('Delete this plan? The member will no longer be able to access it.')) return;
    setError('');
    try {
      await memberPlanService.deletePlan(planId);
      setSuccess('Plan deleted.');
      await load();
    } catch {
      setError('Could not delete plan.');
    }
  };

  return (
    <>
      <div className="page-title">
        <h1>Member Plans</h1>
        <p>Create personalized workout and meal plans based on each member&apos;s fitness goals.</p>
      </div>

      <div className="dashboard-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div />
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          Create plan
        </button>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : plans.length === 0 ? (
        <div className="card">
          <p>No plans created yet. Select a member and build their first workout and meal plan.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Title</th>
                <th>Goal</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.planId}>
                  <td>{plan.memberName}</td>
                  <td>{plan.title}</td>
                  <td>{plan.fitnessGoal}</td>
                  <td>{formatAppDate(plan.updatedAt)}</td>
                  <td>
                    <div className="session-card__actions">
                      <button type="button" className="btn btn--outline btn--sm" onClick={() => openEdit(plan.planId)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn--outline btn--sm" onClick={() => handleDelete(plan.planId)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>{editingPlan ? 'Edit member plan' : 'Create member plan'}</h2>
              <button type="button" className="modal__close" onClick={() => setModalOpen(false)} aria-label="Close">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              {!editingPlan && (
                <div className="form-group">
                  <label htmlFor="planMember">Member</label>
                  <select
                    id="planMember"
                    required
                    value={form.memberId}
                    onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                  >
                    <option value="">Select member</option>
                    {members.map((member) => (
                      <option key={member.memberId} value={member.memberId}>
                        {member.fullName} · {member.identificationNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="planTitle">Plan title</label>
                  <input id="planTitle" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="planGoal">Fitness goal</label>
                  <input id="planGoal" required placeholder="e.g. Fat loss, muscle gain" value={form.fitnessGoal} onChange={(e) => setForm({ ...form, fitnessGoal: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="planWorkout">Workout plan</label>
                <textarea id="planWorkout" required rows={8} placeholder="Day-by-day exercises, sets, reps, rest..." value={form.workoutPlan} onChange={(e) => setForm({ ...form, workoutPlan: e.target.value })} />
              </div>

              <div className="form-group">
                <label htmlFor="planMeal">Meal plan</label>
                <textarea id="planMeal" required rows={8} placeholder="Daily meals, macros, hydration notes..." value={form.mealPlan} onChange={(e) => setForm({ ...form, mealPlan: e.target.value })} />
              </div>

              <div className="form-group">
                <label htmlFor="planNotes">Notes (optional)</label>
                <textarea id="planNotes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>

              <div className="modal__actions">
                <button type="button" className="btn btn--outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Saving...' : editingPlan ? 'Update plan' : 'Save plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
