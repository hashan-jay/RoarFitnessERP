import { api } from '../api/client';
import type { AttendanceLog, EnrolledFingerprint, ScanResult } from '../types';

export const attendanceApi = {
  scan: (fingerprintTemplateId: string, scannerDeviceId = 'SIM-GATE-01') =>
    api.post<ScanResult>('/attendance/scan', { fingerprintTemplateId, scannerDeviceId }),

  getEnrolled: () => api.get<EnrolledFingerprint[]>('/attendance/fingerprint/enrolled', true),

  activateMember: (memberId: number, fingerprintTemplateId: string) =>
    api.post<{ message: string }>(
      '/attendance/fingerprint/member/activate',
      { memberId, fingerprintTemplateId },
      true
    ),

  activateInstructor: (instructorId: number, fingerprintTemplateId: string) =>
    api.post<{ message: string }>(
      '/attendance/fingerprint/instructor/activate',
      { instructorId, fingerprintTemplateId },
      true
    ),

  getTodayLogs: () => api.get<AttendanceLog[]>('/attendance/logs/today', true),
};
