/**
 * Membership registration, profiles, and user management for all portals.
 * API: /membership, /authentication (profiles and admin user CRUD).
 */
import { api } from './apiClient';
import type {
  MembershipPackage,
  MemberProfile,
  InstructorProfile,
  PortalProfile,
  UpdateProfileRequest,
  RegisterRequest,
} from '../types';

type ProfileResponse = {
  memberId: number;
  identificationNumber: string;
  fullName: string;
  email: string;
  phone?: string;
  nicNumber?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  addressLine1?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  isFingerprintActivated: boolean;
  fingerprintActivatedAt?: string;
  hasActiveMembership: boolean;
  membershipEndDate?: string;
  activePackageName?: string;
  profilePhotoUrl?: string;
};

type InstructorProfileResponse = {
  instructorId: number;
  identificationNumber: string;
  fullName: string;
  email: string;
  phone?: string;
  nicNumber?: string;
  dateOfBirth?: string;
  age?: number;
  specialization?: string;
  addressLine1?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  isFingerprintActivated: boolean;
  profilePhotoUrl?: string;
};

function mapMemberProfile(data: ProfileResponse): MemberProfile {
  return {
    memberId: data.memberId,
    identificationNumber: data.identificationNumber,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    nicNumber: data.nicNumber,
    dateOfBirth: data.dateOfBirth,
    age: data.age,
    gender: data.gender,
    addressLine1: data.addressLine1,
    city: data.city,
    country: data.country,
    emergencyContactName: data.emergencyContactName,
    emergencyContactPhone: data.emergencyContactPhone,
    isFingerprintActivated: data.isFingerprintActivated,
    fingerprintActivatedAt: data.fingerprintActivatedAt,
    profilePhotoUrl: data.profilePhotoUrl,
    membership: data.hasActiveMembership
      ? {
          packageName: data.activePackageName ?? 'Active membership',
          startDate: '',
          endDate: data.membershipEndDate ?? '',
          isActive: true,
        }
      : undefined,
  };
}

function mapPortalProfile(data: ProfileResponse | InstructorProfileResponse): PortalProfile {
  return {
    identificationNumber: data.identificationNumber,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    nicNumber: data.nicNumber,
    dateOfBirth: data.dateOfBirth,
    age: data.age,
    addressLine1: data.addressLine1,
    city: data.city,
    country: data.country,
    emergencyContactName: data.emergencyContactName,
    emergencyContactPhone: data.emergencyContactPhone,
    profilePhotoUrl: data.profilePhotoUrl,
  };
}

/**
 * Public registration, member/instructor profiles, and admin member/instructor management.
 */
export const membershipService = {
  getPackages: () =>
    api.get<MembershipPackage[]>('/membership/packages'),

  register: (data: RegisterRequest) =>
    api.post<{ message: string; memberId: number; identificationNumber: string; packageId: number }>(
      '/membership/register',
      {
        ...data,
        phone: data.phone ?? '',
      }
    ),

  getProfile: async (): Promise<MemberProfile> => {
    const data = await api.get<ProfileResponse>('/membership/profile', true);
    return mapMemberProfile(data);
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    await api.put<void>('/membership/profile', data, true);
  },

  getInstructorProfile: async (): Promise<InstructorProfile> => {
    const data = await api.get<InstructorProfileResponse>('/membership/instructor/profile', true);
    return {
      instructorId: data.instructorId,
      isFingerprintActivated: data.isFingerprintActivated,
      specialization: data.specialization,
      profilePhotoUrl: data.profilePhotoUrl,
      ...mapPortalProfile(data),
    };
  },

  updateInstructorProfile: async (data: UpdateProfileRequest) => {
    await api.put<void>('/membership/instructor/profile', data, true);
  },

  uploadProfilePhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    const data = await api.upload<Record<string, string>>('/membership/profile/photo', formData, true);
    return { profilePhotoUrl: String(data.profilePhotoUrl ?? data.ProfilePhotoUrl ?? '') };
  },

  uploadInstructorProfilePhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    const data = await api.upload<Record<string, string>>('/membership/instructor/profile/photo', formData, true);
    return { profilePhotoUrl: String(data.profilePhotoUrl ?? data.ProfilePhotoUrl ?? '') };
  },

  listMembers: () =>
    api.get<Array<{
      memberId: number;
      identificationNumber: string;
      fullName: string;
      email: string;
      phone?: string;
      nicNumber?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      isFingerprintActivated: boolean;
      isActive: boolean;
    }>>('/membership/members', true),

  createMember: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    nicNumber?: string;
    packageId?: number;
  }) =>
    api.post<{ message: string; memberId: number; identificationNumber: string }>(
      '/membership/members',
      {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? '',
        nicNumber: data.nicNumber ?? null,
        role: 'Member',
        packageId: data.packageId ?? null,
        specialization: null,
        dateOfBirth: null,
      },
      true
    ),

  listInstructors: () =>
    api.get<Array<{
      instructorId: number;
      identificationNumber: string;
      fullName: string;
      email: string;
      specialization?: string;
      isFingerprintActivated: boolean;
    }>>('/membership/instructors', true),

  createInstructor: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    nicNumber?: string;
    specialization?: string;
  }) =>
    api.post<{ message: string; instructorId: number; identificationNumber: string }>(
      '/membership/instructors',
      {
        ...data,
        phone: data.phone ?? '',
        nicNumber: data.nicNumber ?? null,
        role: 'Instructor',
        packageId: null,
        dateOfBirth: null,
      },
      true
    ),
};
