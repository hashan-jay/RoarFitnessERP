/**
 * Instructor and member fitness plan management.
 * API: /member-plans/instructor, /member-plans/member (authenticated).
 */
import { api } from './apiClient';
import type {
  CreateMemberFitnessPlanRequest,
  MemberFitnessPlan,
  MemberFitnessPlanSummary,
  MemberPlanMemberOption,
  UpdateMemberFitnessPlanRequest,
} from '../types';

/**
 * CRUD for workout/meal plans — instructors manage plans; members view assigned plans.
 */
export const memberPlanService = {
  getMembersForPlanning: () =>
    api.get<MemberPlanMemberOption[]>('/member-plans/instructor/members', true),

  getInstructorPlans: () =>
    api.get<MemberFitnessPlanSummary[]>('/member-plans/instructor', true),

  getInstructorPlan: (planId: number) =>
    api.get<MemberFitnessPlan>(`/member-plans/instructor/${planId}`, true),

  createPlan: (data: CreateMemberFitnessPlanRequest) =>
    api.post<MemberFitnessPlan>('/member-plans/instructor', data, true),

  updatePlan: (planId: number, data: UpdateMemberFitnessPlanRequest) =>
    api.put<MemberFitnessPlan>(`/member-plans/instructor/${planId}`, data, true),

  deletePlan: (planId: number) =>
    api.delete<{ message: string }>(`/member-plans/instructor/${planId}`, true),

  getMemberPlans: () =>
    api.get<MemberFitnessPlanSummary[]>('/member-plans/member', true),

  getMemberPlan: (planId: number) =>
    api.get<MemberFitnessPlan>(`/member-plans/member/${planId}`, true),
};
