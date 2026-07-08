import { api } from './apiClient'
import type {
  ApproveMemberPlanRequest,
  CreateMemberPlanRequest,
  MemberFitnessPlan,
  MemberFitnessPlanSummary,
  MemberPlanRequest,
  PlanInstructorOption,
} from '../types/api'

export const memberPlanService = {
  getInstructors: () => api.get<PlanInstructorOption[]>('/member-plans/instructors', true),

  createPlanRequest: (data: CreateMemberPlanRequest) =>
    api.post<MemberPlanRequest>('/member-plans/member/requests', data, true),

  getMemberPendingRequests: () => api.get<MemberPlanRequest[]>('/member-plans/member/requests', true),

  getPendingRequests: () => api.get<MemberPlanRequest[]>('/member-plans/instructor/pending', true),

  approvePlanRequest: (requestId: number, data: ApproveMemberPlanRequest) =>
    api.post(`/member-plans/instructor/pending/${requestId}/approve`, data, true),

  getMemberPlans: () => api.get<MemberFitnessPlanSummary[]>('/member-plans/member', true),

  getMemberPlan: (planId: number) =>
    api.get<MemberFitnessPlan>(`/member-plans/member/${planId}`, true),

  getInstructorPlans: () => api.get<MemberFitnessPlanSummary[]>('/member-plans/instructor', true),

  getInstructorPlan: (planId: number) =>
    api.get<MemberFitnessPlan>(`/member-plans/instructor/${planId}`, true),
}
