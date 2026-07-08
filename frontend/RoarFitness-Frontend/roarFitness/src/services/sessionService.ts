import { api } from './apiClient'
import type {
  CreateSpecialSessionRequest,
  PublicVipSession,
  ReviewSpecialSessionRequest,
  SpecialSession,
} from '../types/api'

export const sessionService = {
  getPublicVipSessions: (date: string) =>
    api.get<PublicVipSession[]>(`/public/vip-sessions?date=${encodeURIComponent(date)}`),

  createRequest: (data: CreateSpecialSessionRequest) =>
    api.post<SpecialSession>('/special-sessions/instructor/request', data, true),

  getInstructorSessions: () => api.get<SpecialSession[]>('/special-sessions/instructor', true),

  getAdminSessions: (status?: string) =>
    api.get<SpecialSession[]>(
      status ? `/special-sessions/admin?status=${encodeURIComponent(status)}` : '/special-sessions/admin',
      true,
    ),

  // Unused — admin calendar tab loads via getAdminSessions('approved') instead.
  // getAdminCalendar: () => api.get<SpecialSession[]>('/special-sessions/admin/calendar', true),
  // getAdminSessionDetail: (sessionId: number) =>
  //   api.get<SpecialSession>(`/special-sessions/admin/${sessionId}`, true),

  acceptSession: (sessionId: number) =>
    api.post<SpecialSession>(`/special-sessions/admin/${sessionId}/accept`, {}, true),

  rejectSession: (sessionId: number, data: ReviewSpecialSessionRequest = {}) =>
    api.post<SpecialSession>(`/special-sessions/admin/${sessionId}/reject`, data, true),

  getAvailableSessions: () => api.get<SpecialSession[]>('/special-sessions/member/available', true),

  getMySessions: () => api.get<SpecialSession[]>('/special-sessions/member/mine', true),
}
