/**
 * Instructor portal facade — attendance and related instructor operations.
 * Delegates to attendanceService.
 */
import { attendanceService } from './attendanceService';

/** Convenience wrapper for instructor-portal API operations. */
export const instructorService = {
  getTodayAttendance: () => attendanceService.getTodayLogs(),
};
