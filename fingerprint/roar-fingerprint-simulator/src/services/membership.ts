import { api } from '../api/client';
import type { InstructorListItem, MemberListItem, PersonOption } from '../types';

function pickString(raw: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'string') return value;
  }
  return '';
}

function mapMember(raw: Record<string, unknown>): MemberListItem {
  return {
    memberId: Number(raw.memberId ?? raw.MemberId ?? 0),
    identificationNumber: pickString(raw, 'identificationNumber', 'IdentificationNumber'),
    fullName: pickString(raw, 'fullName', 'FullName'),
    phone: pickString(raw, 'phone', 'Phone') || undefined,
    nicNumber: pickString(raw, 'nicNumber', 'NicNumber') || undefined,
    isFingerprintActivated: Boolean(raw.isFingerprintActivated ?? raw.IsFingerprintActivated),
    hasActiveMembership: Boolean(raw.hasActiveMembership ?? raw.HasActiveMembership),
  };
}

function mapInstructor(raw: Record<string, unknown>): InstructorListItem {
  return {
    instructorId: Number(raw.instructorId ?? raw.InstructorId ?? 0),
    identificationNumber: pickString(raw, 'identificationNumber', 'IdentificationNumber'),
    fullName: pickString(raw, 'fullName', 'FullName'),
    phone: pickString(raw, 'phone', 'Phone') || undefined,
    nicNumber: pickString(raw, 'nicNumber', 'NicNumber') || undefined,
    isFingerprintActivated: Boolean(raw.isFingerprintActivated ?? raw.IsFingerprintActivated),
  };
}

export const membershipApi = {
  listMembers: async (section = 'all'): Promise<MemberListItem[]> => {
    const data = await api.get<Record<string, unknown>[]>(
      `/membership/members?section=${section}`,
      true
    );
    return data.map(mapMember);
  },

  listInstructors: async (section = 'all'): Promise<InstructorListItem[]> => {
    const data = await api.get<Record<string, unknown>[]>(
      `/membership/instructors?section=${section}`,
      true
    );
    return data.map(mapInstructor);
  },

  listPeopleForEnrollment: async (): Promise<PersonOption[]> => {
    const [members, instructors] = await Promise.all([
      membershipApi.listMembers('all'),
      membershipApi.listInstructors('all'),
    ]);

    const memberOptions: PersonOption[] = members.map((m) => ({
      kind: 'member',
      id: m.memberId,
      identificationNumber: m.identificationNumber,
      fullName: m.fullName,
      phone: m.phone,
      nicNumber: m.nicNumber,
      isFingerprintActivated: m.isFingerprintActivated,
      hasActiveMembership: m.hasActiveMembership,
    }));

    const instructorOptions: PersonOption[] = instructors.map((i) => ({
      kind: 'instructor',
      id: i.instructorId,
      identificationNumber: i.identificationNumber,
      fullName: i.fullName,
      phone: i.phone,
      nicNumber: i.nicNumber,
      isFingerprintActivated: i.isFingerprintActivated,
    }));

    return [...memberOptions, ...instructorOptions].sort((a, b) =>
      a.fullName.localeCompare(b.fullName)
    );
  },
};
