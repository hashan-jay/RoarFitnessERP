import { api } from './apiClient'
import type {
  AttendanceLog,
  AdminAttendanceLog,
  AdminMemberAttendanceLog,
  MemberAttendanceEntry,
} from '../types/api'

function mapAttendanceEntry(raw: Record<string, unknown>): MemberAttendanceEntry {
  return {
    attendanceLogId: Number(raw.attendanceLogId ?? raw.AttendanceLogId ?? 0),
    loggedAt: String(raw.loggedAt ?? raw.LoggedAt ?? ''),
    accessGranted: Boolean(raw.accessGranted ?? raw.AccessGranted),
    validationMessage:
      typeof raw.validationMessage === 'string'
        ? raw.validationMessage
        : typeof raw.ValidationMessage === 'string'
          ? raw.ValidationMessage
          : undefined,
  }
}

async function fetchMyLogs(year: number, month: number): Promise<MemberAttendanceEntry[]> {
  const data = await api.get<Record<string, unknown>[]>(
    `/attendance/logs/me?year=${year}&month=${month}`,
    true,
  )
  return data.map(mapAttendanceEntry).filter((entry) => entry.attendanceLogId > 0 && entry.loggedAt)
}

function mapAdminAttendanceLog(raw: Record<string, unknown>): AdminAttendanceLog {
  return {
    attendanceLogId: Number(raw.attendanceLogId ?? raw.AttendanceLogId ?? 0),
    loggedAt: String(raw.loggedAt ?? raw.LoggedAt ?? ''),
    accessGranted: Boolean(raw.accessGranted ?? raw.AccessGranted),
    validationMessage:
      typeof raw.validationMessage === 'string'
        ? raw.validationMessage
        : typeof raw.ValidationMessage === 'string'
          ? raw.ValidationMessage
          : undefined,
    personType: String(raw.personType ?? raw.PersonType ?? 'Unknown'),
    identificationNumber:
      typeof raw.identificationNumber === 'string'
        ? raw.identificationNumber
        : typeof raw.IdentificationNumber === 'string'
          ? raw.IdentificationNumber
          : undefined,
    personName: String(raw.personName ?? raw.PersonName ?? 'Unknown'),
  }
}

export type AdminAttendanceFilter = 'all' | 'members' | 'instructors'

export const attendanceService = {
  scan: (fingerprintTemplateId: string, scannerDeviceId?: string) =>
    api.post<{
      accessGranted: boolean
      message: string
      personName?: string
      personType?: string
      loggedAt: string
    }>('/attendance/scan', { fingerprintTemplateId, scannerDeviceId }),

  getTodayLogs: () => api.get<AttendanceLog[]>('/attendance/logs/today', true),

  getMemberLogsByDate: (date: string) =>
    api.get<AdminMemberAttendanceLog[]>(
      `/attendance/logs/members?date=${encodeURIComponent(date)}`,
      true,
    ),

  getAdminLogsByDate: async (date: string, filter: AdminAttendanceFilter = 'all') => {
    const data = await api.get<Record<string, unknown>[]>(
      `/attendance/logs/admin?date=${encodeURIComponent(date)}&filter=${encodeURIComponent(filter)}`,
      true,
    )
    return data
      .map(mapAdminAttendanceLog)
      .filter((log) => log.attendanceLogId > 0 && log.loggedAt)
  },

  getMyLogs: fetchMyLogs,

  getMyInstructorLogs: fetchMyLogs,

  activateMemberFingerprint: (memberId: number, fingerprintTemplateId: string) =>
    api.post<{ message: string }>(
      '/attendance/fingerprint/member/activate',
      { memberId, fingerprintTemplateId },
      true,
    ),

  activateInstructorFingerprint: (instructorId: number, fingerprintTemplateId: string) =>
    api.post<{ message: string }>(
      '/attendance/fingerprint/instructor/activate',
      { instructorId, fingerprintTemplateId },
      true,
    ),
}
