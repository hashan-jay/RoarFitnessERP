/**
 * Special session requests and enrollment across instructor, admin, and member portals.
 * API: /special-sessions (authenticated).
 */
import { api } from './apiClient';
import type {
  CreateSpecialSessionRequest,
  ReviewSpecialSessionRequest,
  SpecialSession,
} from '../types';

/**
 * Session lifecycle: instructor requests, admin review/calendar, member browse and enrollment.
 */
export const sessionService = {
  createRequest: (data: CreateSpecialSessionRequest) =>
    api.post<SpecialSession>('/special-sessions/instructor/request', data, true),

  getInstructorSessions: () =>
    api.get<SpecialSession[]>('/special-sessions/instructor', true),

  getAdminSessions: (status?: string) =>
    api.get<SpecialSession[]>(
      status ? `/special-sessions/admin?status=${encodeURIComponent(status)}` : '/special-sessions/admin',
      true
    ),

  getAdminCalendar: () =>
    api.get<SpecialSession[]>('/special-sessions/admin/calendar', true),

  getAdminSessionDetail: (sessionId: number) =>
    api.get<SpecialSession>(`/special-sessions/admin/${sessionId}`, true),

  acceptSession: (sessionId: number) =>
    api.post<SpecialSession>(`/special-sessions/admin/${sessionId}/accept`, {}, true),

  rejectSession: (sessionId: number, data: ReviewSpecialSessionRequest) =>
    api.post<SpecialSession>(`/special-sessions/admin/${sessionId}/reject`, data, true),

  getAvailableSessions: () =>
    api.get<SpecialSession[]>('/special-sessions/member/available', true),

  getMySessions: () =>
    api.get<SpecialSession[]>('/special-sessions/member/mine', true),
};
