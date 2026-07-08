export type ApiUserRole = 'Admin' | 'Member' | 'Instructor'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  nicNumber?: string
  dateOfBirth?: string
  gender?: string
  addressLine1?: string
  city?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  packageId: number
}

export interface MembershipPackage {
  packageId: number
  packageName: string
  description?: string
  durationDays: number
  priceLKR: number
  typeName?: string
  amenities?: string
  isActive?: boolean
  isFeatured?: boolean
  packageTypeId?: number
}

export interface CreatePackageRequest {
  packageTypeId: number
  packageName: string
  description?: string
  amenities?: string
  durationDays: number
  priceLKR: number
  isFeatured: boolean
}

export interface UpdatePackageRequest extends CreatePackageRequest {
  isActive: boolean
}

export interface PackageType {
  packageTypeId: number
  typeName: string
  description?: string
}

export interface PaymentRequest {
  amountLKR: number
  email?: string
}

export interface PaymentResponse {
  paymentReference: string
  checkoutUrl: string
  merchantId: string
}

export interface ContactMessage {
  name: string
  email: string
  phone?: string
  message: string
}

export interface VisitorInquiry {
  inquiryId: number
  fullName: string
  email: string
  phone?: string
  message: string
  submittedAt: string
}

export type MemberListSection = 'all' | 'active' | 'inactive' | 'terminated'
export type InstructorListSection = 'all' | 'active' | 'terminated'

export interface AdminMemberListItem {
  memberId: number
  identificationNumber: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone?: string
  nicNumber?: string
  dateOfBirth?: string
  gender?: string
  addressLine1?: string
  city?: string
  country?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  hasActiveMembership: boolean
  membershipStartDate?: string
  membershipEndDate?: string
  activePackageName?: string
  isFingerprintActivated?: boolean
  isTerminated: boolean
  terminatedAt?: string
}

export interface AdminInstructorListItem {
  instructorId: number
  identificationNumber: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone?: string
  nicNumber?: string
  dateOfBirth?: string
  specialization?: string
  addressLine1?: string
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
  isTerminated: boolean
  terminatedAt?: string
}

export interface PublicInstructor {
  instructorId: number
  fullName: string
  role: string
  yearsExperience: number
  qualification1?: string
  qualification2?: string
  speciality1?: string
  speciality2?: string
  speciality3?: string
  photoUrl?: string
}

export interface AdminUpdateMemberAccountRequest {
  firstName: string
  lastName: string
  email: string
  nicNumber?: string
  password?: string
  memberPermissionConfirmed: boolean
}

export interface CreateMemberRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  nicNumber?: string
  dateOfBirth?: string
  gender?: string
  addressLine1?: string
  city?: string
  country?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  packageId: number
}

export interface CreateInstructorRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  nicNumber?: string
  dateOfBirth?: string
  specialization?: string
  addressLine1?: string
  country?: string
  yearsExperience?: number
  qualification1?: string
  qualification2?: string
  speciality1?: string
  speciality2?: string
  speciality3?: string
}

export interface MemberProfile {
  memberId: number
  identificationNumber: string
  fullName: string
  email: string
  phone?: string
  nicNumber?: string
  dateOfBirth?: string
  addressLine1?: string
  city?: string
  country?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  isFingerprintActivated?: boolean
  fingerprintActivatedAt?: string
  membership?: {
    packageName: string
    startDate: string
    endDate: string
    isActive: boolean
  }
  queuedMembership?: {
    packageName: string
    startDate: string
    endDate: string
  }
  isTerminated?: boolean
}

export interface InstructorProfile {
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

export interface ReportSummary {
  totalMembershipInGymCashRevenue: number
  totalMembershipInGymCardRevenue: number
  totalMembershipGatewayRevenue: number
  totalPosCashRevenue: number
  totalPosCardRevenue: number
  totalSessionGatewayRevenue: number
  totalRevenue: number
  thisMonthRevenue: number
  totalMembers: number
  activeMembers: number
  lowStockItems: number
  dailyRevenue: DailyRevenue[]
  recentTransactions: RecentTransaction[]
}

export interface RecentTransaction {
  transactionId: number
  reference: string
  category: string
  description: string
  amountLKR: number
  transactionDate: string
  status: string
}

export interface CreateSpecialSessionRequest {
  title: string
  description: string
  startDateTime: string
  endDateTime: string
  feePerPersonLKR: number
  maxParticipants: number
}

export interface SpecialSessionEnrollment {
  memberId: number
  memberName: string
  email: string
  enrolledAt: string
}

export interface SpecialSession {
  sessionId: number
  title: string
  description: string
  startDateTime: string
  endDateTime: string
  feePerPersonLKR: number
  maxParticipants: number
  enrolledCount: number
  spotsRemaining: number
  status: string
  runtimeStatus: string
  instructorName: string
  instructorId: number
  rejectionReason?: string
  enrollments?: SpecialSessionEnrollment[]
}

export interface PublicVipSession {
  sessionId: number
  title: string
  description: string
  startDateTime: string
  endDateTime: string
  feePerPersonLKR: number
  maxParticipants: number
  enrolledCount: number
  spotsRemaining: number
  instructorName: string
  instructorId: number
}

export interface CreateMemberPlanRequest {
  instructorId: number
  planCategory: 'Workout' | 'Meal'
  memberNote?: string
}

export interface ApproveMemberPlanRequest {
  description: string
  notes?: string
}

export interface MemberPlanRequest {
  requestId: number
  memberId: number
  memberName: string
  memberIdentificationNumber: string
  instructorId: number
  instructorName: string
  planCategory: string
  memberNote?: string
  status: string
  createdAt: string
  approvedAt?: string
  planId?: number
}

export interface MemberFitnessPlanSummary {
  planId: number
  memberId: number
  memberName: string
  memberIdentificationNumber: string
  instructorName: string
  planCategory: string
  updatedAt: string
}

export interface PlanInstructorOption {
  instructorId: number
  fullName: string
  specialization?: string
}

export interface MembershipRenewBill {
  billReference: string
  paymentReference: string
  memberName: string
  identificationNumber: string
  phone?: string
  nicNumber?: string
  packageName: string
  durationDays: number
  amountLKR: number
  paymentMethod: string
  saleDate: string
  membershipStartDate: string
  membershipEndDate: string
}

export interface UpdateProfileRequest {
  phone?: string
  addressLine1?: string
  city?: string
  country?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  dateOfBirth?: string
}

export interface AdminUpdateInstructorAccountRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  nicNumber?: string
  dateOfBirth?: string
  specialization?: string
  addressLine1?: string
  country?: string
  yearsExperience: number
  qualification1?: string
  qualification2?: string
  speciality1?: string
  speciality2?: string
  speciality3?: string
  password?: string
  instructorPermissionConfirmed: boolean
}

export interface DailyRevenue {
  date: string
  total: number
  membershipInGymCash: number
  membershipInGymCard: number
  membershipGateway: number
  posCash: number
  posCard: number
  sessionGateway: number
}

export interface MonthlyReport {
  year: number
  month: number
  monthLabel: string
  membershipInGymCashRevenue: number
  membershipInGymCardRevenue: number
  membershipGatewayRevenue: number
  posCashRevenue: number
  posCardRevenue: number
  sessionGatewayRevenue: number
  totalRevenue: number
  dailyRevenue: DailyRevenue[]
  soldItems: SoldItemReport[]
  recentTransactions: RecentTransaction[]
}

export interface SoldItemReport {
  productName: string
  sku: string
  quantitySold: number
  revenueLKR: number
  channel: string
}

export interface MemberRenewSearchItem {
  memberId: number
  identificationNumber: string
  fullName: string
  phone?: string
  nicNumber?: string
  hasActiveMembership: boolean
  currentMembershipEndDate?: string
  membershipExpiredDate?: string
  queuedMembershipStartDate?: string
  isFingerprintActivated: boolean
}

export interface Product {
  productId: number
  sku: string
  productName: string
  description?: string
  unitPriceLKR: number
  imageUrl?: string
  categoryName?: string
  categoryId?: number
  quantityOnHand?: number
  reorderLevel?: number
  isActive?: boolean
}

export interface ProductCategory {
  categoryId: number
  categoryName: string
}

export interface CreateProductRequest {
  categoryId: number
  sku: string
  productName: string
  description?: string
  unitPriceLKR: number
  initialQuantity: number
  reorderLevel: number
  imageUrl?: string
}

export interface UpdateProductRequest {
  categoryId: number
  sku: string
  productName: string
  description?: string
  unitPriceLKR: number
  reorderLevel: number
  isActive: boolean
  imageUrl?: string
}

export interface PosBillLine {
  productName: string
  sku: string
  quantity: number
  unitPriceLKR: number
  lineTotal: number
}

export interface PosBill {
  billReference: string
  orderReference: string
  paymentReference: string
  paymentMethod: string
  subtotalLKR: number
  totalLKR: number
  saleDate: string
  items: PosBillLine[]
}

export interface PosSaleResponse {
  order: { orderId: number; orderReference: string; totalLKR: number }
  bill: PosBill
}

export interface AttendanceLog {
  attendanceLogId: number
  loggedAt: string
  accessGranted: boolean
  validationMessage?: string
  memberName?: string
  instructorName?: string
  personType?: string
}

export interface MemberAttendanceEntry {
  attendanceLogId: number
  loggedAt: string
  accessGranted: boolean
  validationMessage?: string
}

export interface AdminMemberAttendanceLog {
  attendanceLogId: number
  loggedAt: string
  accessGranted: boolean
  validationMessage?: string
  memberId: number
  memberIdentificationNumber: string
  memberName: string
}

export interface AdminAttendanceLog {
  attendanceLogId: number
  loggedAt: string
  accessGranted: boolean
  validationMessage?: string
  personType: string
  identificationNumber?: string
  personName: string
}

export interface ReviewSpecialSessionRequest {
  rejectionReason?: string
}

export interface MemberFitnessPlan extends Omit<MemberFitnessPlanSummary, 'memberIdentificationNumber'> {
  description: string
  notes?: string
  memberIdentificationNumber?: string
}
