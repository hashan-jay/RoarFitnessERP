import type { MemberPlanRequest, PlanInstructorOption } from '../types/api'
import type { PlanRequest, PlanRequestStatus, PlanRequestType } from '../utils/planRequests'

function mapPlanStatus(status: string): PlanRequestStatus {
  const normalized = status.toLowerCase()
  if (normalized === 'approved') return 'completed'
  if (normalized === 'completed') return 'completed'
  if (normalized === 'rejected' || normalized === 'declined') return 'declined'
  return 'pending'
}

function mapPlanType(category: string): PlanRequestType {
  return category.toLowerCase().includes('meal') ? 'meal' : 'workout'
}

export function mapMemberPlanRequest(
  request: MemberPlanRequest,
  memberEmail = '',
): PlanRequest & {
  requestId: number
  memberId: number
  memberName: string
  memberIdentificationNumber: string
  memberEmail: string
} {
  return {
    requestId: request.requestId,
    id: String(request.requestId),
    type: mapPlanType(request.planCategory),
    instructorId: String(request.instructorId),
    instructorName: request.instructorName,
    notes: request.memberNote?.trim() ?? '',
    status: mapPlanStatus(request.status),
    createdAt: request.createdAt,
    memberId: request.memberId,
    memberName: request.memberName,
    memberIdentificationNumber: request.memberIdentificationNumber,
    memberEmail: memberEmail || request.memberIdentificationNumber,
  }
}

export interface InstructorOption {
  id: string
  name: string
  specialization: string
}

export function mapInstructorOption(instructor: PlanInstructorOption): InstructorOption {
  return {
    id: String(instructor.instructorId),
    name: instructor.fullName,
    specialization: instructor.specialization?.trim() || 'General fitness',
  }
}
