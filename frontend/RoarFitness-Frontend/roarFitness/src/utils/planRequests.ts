/** Meal vs workout plan request — used by memberPlanAdapter and portal pages. */
export type PlanRequestType = 'meal' | 'workout'

export type PlanRequestStatus = 'pending' | 'in_progress' | 'completed' | 'declined'

/** View-model for plan requests (mapped from API via memberPlanAdapter). */
export interface PlanRequest {
  id: string
  type: PlanRequestType
  instructorId: string
  instructorName: string
  notes: string
  status: PlanRequestStatus
  createdAt: string
}

export interface PlanRequestWithMember extends PlanRequest {
  memberEmail: string
  memberName?: string
}

/*
 * LEGACY — localStorage CRUD for plan requests before memberPlanService existed.
 * All live flows use POST/GET /api/member-plans. Not imported anywhere.
 *
const REQUESTS_KEY = 'roar_plan_requests'
function readAll(): RequestsByMember { ... }
function writeAll(data: RequestsByMember): void { ... }
function memberKey(email: string): string { ... }
export function getPlanRequests(email: string): PlanRequest[] { ... }
export function createPlanRequest(...): PlanRequest[] { ... }
export function getAllPlanRequests(): PlanRequestWithMember[] { ... }
export function updatePlanRequestStatus(...): void { ... }
 */
