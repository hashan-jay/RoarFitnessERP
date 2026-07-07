export interface ScanResult {
  accessGranted: boolean;
  message: string;
  personName?: string | null;
  personType?: string | null;
  loggedAt: string;
}

export interface AttendanceLog {
  attendanceLogId: number;
  loggedAt: string;
  accessGranted: boolean;
  validationMessage?: string;
  memberName?: string;
  instructorName?: string;
  personType?: string;
}

export interface EnrolledFingerprint {
  fingerprintTemplateId: string;
  personName: string;
  personType: string;
  memberId?: number | null;
  instructorId?: number | null;
  identificationNumber: string;
  hasActiveMembership: boolean;
}

export interface MemberListItem {
  memberId: number;
  identificationNumber: string;
  fullName: string;
  phone?: string;
  nicNumber?: string;
  isFingerprintActivated: boolean;
  hasActiveMembership: boolean;
}

export interface InstructorListItem {
  instructorId: number;
  identificationNumber: string;
  fullName: string;
  phone?: string;
  nicNumber?: string;
  isFingerprintActivated: boolean;
}

export type PersonKind = 'member' | 'instructor';

export interface PersonOption {
  kind: PersonKind;
  id: number;
  identificationNumber: string;
  fullName: string;
  phone?: string;
  nicNumber?: string;
  isFingerprintActivated: boolean;
  hasActiveMembership?: boolean;
}
