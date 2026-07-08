import { api } from './apiClient'
import type {
  AdminInstructorListItem,
  AdminMemberListItem,
  AdminUpdateMemberAccountRequest,
  AdminUpdateInstructorAccountRequest,
  CreateInstructorRequest,
  CreateMemberRequest,
  InstructorListSection,
  InstructorProfile,
  MemberListSection,
  MemberProfile,
  MembershipRenewBill,
  MemberRenewSearchItem,
  RegisterRequest,
  UpdateProfileRequest,
} from '../types/api'

type ProfileResponse = {
  memberId: number
  identificationNumber: string
  fullName: string
  email: string
  phone?: string
  dateOfBirth?: string
  nicNumber?: string
  addressLine1?: string
  city?: string
  country?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  hasActiveMembership: boolean
  isFingerprintActivated?: boolean
  fingerprintActivatedAt?: string
  membershipEndDate?: string
  membershipStartDate?: string
  activePackageName?: string
  queuedPackageName?: string
  queuedMembershipStartDate?: string
  queuedMembershipEndDate?: string
  isTerminated?: boolean
}

type InstructorProfileResponse = {
  instructorId: number
  identificationNumber: string
  fullName: string
  email: string
  phone?: string
  nicNumber?: string
  dateOfBirth?: string
  age?: number
  specialization?: string
  bio?: string
  addressLine1?: string
  city?: string
  country?: string
  yearsExperience: number
  qualification1?: string
  qualification2?: string
  speciality1?: string
  speciality2?: string
  speciality3?: string
  profilePhotoUrl?: string
  hireDate?: string
  isFingerprintActivated?: boolean
}

function mapMemberProfile(data: ProfileResponse): MemberProfile {
  const membership = data.hasActiveMembership
    ? {
        packageName: data.activePackageName ?? 'Active membership',
        startDate: data.membershipStartDate ?? '',
        endDate: data.membershipEndDate ?? '',
        isActive: true,
      }
    : data.membershipEndDate
      ? {
          packageName: data.activePackageName ?? 'Previous membership',
          startDate: data.membershipStartDate ?? '',
          endDate: data.membershipEndDate,
          isActive: false,
        }
      : undefined

  const queuedMembership = data.queuedPackageName
    ? {
        packageName: data.queuedPackageName,
        startDate: data.queuedMembershipStartDate ?? '',
        endDate: data.queuedMembershipEndDate ?? '',
      }
    : undefined

  return {
    memberId: data.memberId,
    identificationNumber: data.identificationNumber,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    nicNumber: data.nicNumber,
    dateOfBirth: data.dateOfBirth,
    addressLine1: data.addressLine1,
    city: data.city,
    country: data.country,
    emergencyContactName: data.emergencyContactName,
    emergencyContactPhone: data.emergencyContactPhone,
    isFingerprintActivated: Boolean(data.isFingerprintActivated),
    fingerprintActivatedAt: data.fingerprintActivatedAt,
    membership,
    queuedMembership,
    isTerminated: Boolean(data.isTerminated),
  }
}

function mapAdminMember(raw: Record<string, unknown>): AdminMemberListItem {
  const fullName = String(raw.fullName ?? raw.FullName ?? '')
  return {
    memberId: Number(raw.memberId ?? raw.MemberId ?? 0),
    identificationNumber: String(raw.identificationNumber ?? raw.IdentificationNumber ?? ''),
    firstName: String(raw.firstName ?? raw.FirstName ?? fullName.split(' ')[0] ?? ''),
    lastName: String(raw.lastName ?? raw.LastName ?? fullName.split(' ').slice(1).join(' ') ?? ''),
    fullName,
    email: String(raw.email ?? raw.Email ?? ''),
    phone: typeof raw.phone === 'string' ? raw.phone : undefined,
    nicNumber: typeof raw.nicNumber === 'string' ? raw.nicNumber : undefined,
    dateOfBirth: typeof raw.dateOfBirth === 'string' ? raw.dateOfBirth : undefined,
    gender: typeof raw.gender === 'string' ? raw.gender : undefined,
    addressLine1: typeof raw.addressLine1 === 'string' ? raw.addressLine1 : undefined,
    city: typeof raw.city === 'string' ? raw.city : undefined,
    country: typeof raw.country === 'string' ? raw.country : undefined,
    emergencyContactName:
      typeof raw.emergencyContactName === 'string' ? raw.emergencyContactName : undefined,
    emergencyContactPhone:
      typeof raw.emergencyContactPhone === 'string' ? raw.emergencyContactPhone : undefined,
    hasActiveMembership: Boolean(raw.hasActiveMembership ?? raw.HasActiveMembership),
    membershipStartDate:
      typeof raw.membershipStartDate === 'string' ? raw.membershipStartDate : undefined,
    membershipEndDate:
      typeof raw.membershipEndDate === 'string' ? raw.membershipEndDate : undefined,
    activePackageName:
      typeof raw.activePackageName === 'string' ? raw.activePackageName : undefined,
    isFingerprintActivated: Boolean(raw.isFingerprintActivated ?? raw.IsFingerprintActivated),
    isTerminated: Boolean(raw.isTerminated ?? raw.IsTerminated),
    terminatedAt: typeof raw.terminatedAt === 'string' ? raw.terminatedAt : undefined,
  }
}

function mapAdminInstructor(raw: Record<string, unknown>): AdminInstructorListItem {
  const fullName = String(raw.fullName ?? raw.FullName ?? '')
  return {
    instructorId: Number(raw.instructorId ?? raw.InstructorId ?? 0),
    identificationNumber: String(raw.identificationNumber ?? raw.IdentificationNumber ?? ''),
    firstName: String(raw.firstName ?? raw.FirstName ?? fullName.split(' ')[0] ?? ''),
    lastName: String(raw.lastName ?? raw.LastName ?? fullName.split(' ').slice(1).join(' ') ?? ''),
    fullName,
    email: String(raw.email ?? raw.Email ?? ''),
    phone: typeof raw.phone === 'string' ? raw.phone : undefined,
    nicNumber: typeof raw.nicNumber === 'string' ? raw.nicNumber : undefined,
    dateOfBirth: typeof raw.dateOfBirth === 'string' ? raw.dateOfBirth : undefined,
    specialization: typeof raw.specialization === 'string' ? raw.specialization : undefined,
    addressLine1: typeof raw.addressLine1 === 'string' ? raw.addressLine1 : undefined,
    country: typeof raw.country === 'string' ? raw.country : undefined,
    yearsExperience: Number(raw.yearsExperience ?? raw.YearsExperience ?? 0),
    qualification1:
      typeof raw.qualification1 === 'string'
        ? raw.qualification1
        : typeof raw.Qualification1 === 'string'
          ? raw.Qualification1
          : undefined,
    qualification2:
      typeof raw.qualification2 === 'string'
        ? raw.qualification2
        : typeof raw.Qualification2 === 'string'
          ? raw.Qualification2
          : undefined,
    speciality1:
      typeof raw.speciality1 === 'string'
        ? raw.speciality1
        : typeof raw.Speciality1 === 'string'
          ? raw.Speciality1
          : undefined,
    speciality2:
      typeof raw.speciality2 === 'string'
        ? raw.speciality2
        : typeof raw.Speciality2 === 'string'
          ? raw.Speciality2
          : undefined,
    speciality3:
      typeof raw.speciality3 === 'string'
        ? raw.speciality3
        : typeof raw.Speciality3 === 'string'
          ? raw.Speciality3
          : undefined,
    profilePhotoUrl:
      typeof raw.profilePhotoUrl === 'string'
        ? raw.profilePhotoUrl
        : typeof raw.ProfilePhotoUrl === 'string'
          ? raw.ProfilePhotoUrl
          : undefined,
    hireDate: typeof raw.hireDate === 'string' ? raw.hireDate : undefined,
    isFingerprintActivated: Boolean(raw.isFingerprintActivated ?? raw.IsFingerprintActivated),
    isTerminated: Boolean(raw.isTerminated ?? raw.IsTerminated),
    terminatedAt: typeof raw.terminatedAt === 'string' ? raw.terminatedAt : undefined,
  }
}

export const membershipService = {
  register: (data: RegisterRequest) =>
    api.post<{ message: string; memberId: number; identificationNumber: string; packageId: number }>(
      '/membership/register',
      { ...data, phone: data.phone ?? '' },
    ),

  getProfile: async (): Promise<MemberProfile> => {
    const raw = await api.get<Record<string, unknown>>('/membership/profile', true)
    const data = raw as unknown as ProfileResponse
    return mapMemberProfile({
      ...data,
      isFingerprintActivated: Boolean(raw.isFingerprintActivated ?? raw.IsFingerprintActivated),
      fingerprintActivatedAt:
        typeof raw.fingerprintActivatedAt === 'string'
          ? raw.fingerprintActivatedAt
          : typeof raw.FingerprintActivatedAt === 'string'
            ? raw.FingerprintActivatedAt
            : undefined,
      isTerminated: Boolean(raw.isTerminated ?? raw.IsTerminated),
    })
  },

  updateMemberProfile: (data: UpdateProfileRequest) =>
    api.put<void>('/membership/profile', data, true),

  getInstructorProfile: async (): Promise<InstructorProfile> => {
    const data = await api.get<InstructorProfileResponse>('/membership/instructor/profile', true)
    return {
      instructorId: data.instructorId,
      identificationNumber: data.identificationNumber,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      nicNumber: data.nicNumber,
      dateOfBirth: data.dateOfBirth,
      age: data.age,
      specialization: data.specialization,
      bio: data.bio,
      addressLine1: data.addressLine1,
      city: data.city,
      country: data.country,
      yearsExperience: data.yearsExperience ?? 0,
      qualification1: data.qualification1,
      qualification2: data.qualification2,
      speciality1: data.speciality1,
      speciality2: data.speciality2,
      speciality3: data.speciality3,
      profilePhotoUrl: data.profilePhotoUrl,
      hireDate: data.hireDate,
      isFingerprintActivated: data.isFingerprintActivated,
    }
  },

  listMembers: async (section: MemberListSection = 'all') => {
    const data = await api.get<Record<string, unknown>[]>(`/membership/members?section=${section}`, true)
    return data.map(mapAdminMember)
  },

  updateMemberAccount: (memberId: number, data: AdminUpdateMemberAccountRequest) =>
    api.put<{ message: string }>(`/membership/members/${memberId}/account`, data, true),

  createMember: (data: CreateMemberRequest) =>
    api.post<{ message: string; memberId: number; identificationNumber: string }>(
      '/membership/members',
      {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? '',
        nicNumber: data.nicNumber ?? null,
        dateOfBirth: data.dateOfBirth || null,
        gender: data.gender ?? null,
        addressLine1: data.addressLine1 ?? null,
        city: data.city ?? 'Colombo',
        country: data.country ?? 'Sri Lanka',
        emergencyContactName: data.emergencyContactName ?? null,
        emergencyContactPhone: data.emergencyContactPhone ?? null,
        role: 'Member',
        packageId: data.packageId ?? null,
        specialization: null,
      },
      true,
    ),

  terminateMember: (memberId: number) =>
    api.post<{ message: string }>(`/membership/members/${memberId}/terminate`, {}, true),

  reinstateMember: (memberId: number) =>
    api.post<{ message: string }>(`/membership/members/${memberId}/reinstate`, {}, true),

  listInstructors: async (section: InstructorListSection = 'all') => {
    const data = await api.get<Record<string, unknown>[]>(
      `/membership/instructors?section=${section}`,
      true,
    )
    return data.map(mapAdminInstructor)
  },

  createInstructor: (data: CreateInstructorRequest) =>
    api.post<{ message: string; instructorId: number; identificationNumber: string }>(
      '/membership/instructors',
      {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? '',
        nicNumber: data.nicNumber ?? null,
        dateOfBirth: data.dateOfBirth || null,
        specialization: data.specialization ?? null,
        addressLine1: data.addressLine1 ?? null,
        country: data.country ?? 'Sri Lanka',
        yearsExperience: data.yearsExperience ?? 0,
        qualification1: data.qualification1 ?? null,
        qualification2: data.qualification2 ?? null,
        speciality1: data.speciality1 ?? data.specialization ?? null,
        speciality2: data.speciality2 ?? null,
        speciality3: data.speciality3 ?? null,
        role: 'Instructor',
        packageId: null,
      },
      true,
    ),

  uploadInstructorPhoto: (instructorId: number, file: File) => {
    const formData = new FormData()
    formData.append('photo', file)
    return api.postForm<{ message: string; photoUrl: string }>(
      `/membership/instructors/${instructorId}/photo`,
      formData,
      true,
    )
  },

  updateInstructorAccount: (instructorId: number, data: AdminUpdateInstructorAccountRequest) =>
    api.put<{ message: string }>(`/membership/instructors/${instructorId}/account`, data, true),

  terminateInstructor: (instructorId: number) =>
    api.post<{ message: string }>(`/membership/instructors/${instructorId}/terminate`, {}, true),

  reinstateInstructor: (instructorId: number) =>
    api.post<{ message: string }>(`/membership/instructors/${instructorId}/reinstate`, {}, true),
}

function mapMembershipRenewBill(raw: Record<string, unknown>): MembershipRenewBill {
  return {
    billReference: String(raw.billReference ?? raw.BillReference ?? ''),
    paymentReference: String(raw.paymentReference ?? raw.PaymentReference ?? ''),
    memberName: String(raw.memberName ?? raw.MemberName ?? ''),
    identificationNumber: String(raw.identificationNumber ?? raw.IdentificationNumber ?? ''),
    phone: typeof raw.phone === 'string' ? raw.phone : typeof raw.Phone === 'string' ? raw.Phone : undefined,
    nicNumber:
      typeof raw.nicNumber === 'string'
        ? raw.nicNumber
        : typeof raw.NicNumber === 'string'
          ? raw.NicNumber
          : undefined,
    packageName: String(raw.packageName ?? raw.PackageName ?? ''),
    durationDays: Number(raw.durationDays ?? raw.DurationDays ?? 0),
    amountLKR: Number(raw.amountLKR ?? raw.AmountLKR ?? 0),
    paymentMethod: String(raw.paymentMethod ?? raw.PaymentMethod ?? ''),
    saleDate: String(raw.saleDate ?? raw.SaleDate ?? new Date().toISOString()),
    membershipStartDate: String(raw.membershipStartDate ?? raw.MembershipStartDate ?? ''),
    membershipEndDate: String(raw.membershipEndDate ?? raw.MembershipEndDate ?? ''),
  }
}

export const membershipRenewService = {
  searchMembersForRenewal: async (query: string): Promise<MemberRenewSearchItem[]> => {
    const trimmed = query.trim()
    if (trimmed.length < 2) return []

    const data = await api.get<Record<string, unknown>[]>(
      `/membership/members/renew/search?q=${encodeURIComponent(trimmed)}`,
      true,
    )

    return data.map((raw) => ({
      memberId: Number(raw.memberId ?? raw.MemberId ?? 0),
      identificationNumber: String(raw.identificationNumber ?? raw.IdentificationNumber ?? ''),
      fullName: String(raw.fullName ?? raw.FullName ?? ''),
      phone: typeof raw.phone === 'string' ? raw.phone : undefined,
      nicNumber: typeof raw.nicNumber === 'string' ? raw.nicNumber : undefined,
      hasActiveMembership: Boolean(raw.hasActiveMembership ?? raw.HasActiveMembership),
      currentMembershipEndDate:
        typeof raw.currentMembershipEndDate === 'string' ? raw.currentMembershipEndDate : undefined,
      membershipExpiredDate:
        typeof raw.membershipExpiredDate === 'string' ? raw.membershipExpiredDate : undefined,
      queuedMembershipStartDate:
        typeof raw.queuedMembershipStartDate === 'string' ? raw.queuedMembershipStartDate : undefined,
      isFingerprintActivated: Boolean(raw.isFingerprintActivated ?? raw.IsFingerprintActivated),
    }))
  },

  renewMembershipInGym: async (
    memberId: number,
    packageId: number,
    paymentMethod: 'Cash' | 'Card',
  ): Promise<MembershipRenewBill> => {
    const data = await api.post<Record<string, unknown>>(
      `/membership/members/${memberId}/renew/in-gym`,
      { packageId, paymentMethod },
      true,
    )
    return mapMembershipRenewBill(data)
  },
}
