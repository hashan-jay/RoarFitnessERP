/**
 * Gym access control — fingerprint scan, logs, and activation for members and instructors.
 * API: /attendance (scan is public; logs and activation require auth).
 */
import { api } from './apiClient';

import type { AttendanceLog } from '../types';

/**
 * Fingerprint scanning at entry, daily log retrieval, and fingerprint enrollment.
 */
export const attendanceService = {
  scan: (fingerprintTemplateId: string, scannerDeviceId?: string) =>
    api.post<{
      accessGranted: boolean;
      message: string;
      personName?: string;
      personType?: string;
      loggedAt: string;
    }>('/attendance/scan', { fingerprintTemplateId, scannerDeviceId }),

  getTodayLogs: () =>
    api.get<AttendanceLog[]>('/attendance/logs/today', true),

  activateMemberFingerprint: (memberId: number, fingerprintTemplateId: string) =>
    api.post<{ message: string }>(
      '/attendance/fingerprint/member/activate',
      { memberId, fingerprintTemplateId },
      true
    ),

  activateInstructorFingerprint: (instructorId: number, fingerprintTemplateId: string) =>
    api.post<{ message: string }>(
      '/attendance/fingerprint/instructor/activate',
      { instructorId, fingerprintTemplateId },
      true
    ),
};
