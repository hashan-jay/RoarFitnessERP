/**
 * Shared TypeScript domain models for the Roar Fitness web app.
 * Used across public, member, instructor, and admin portals; shapes mirror backend API contracts.
 */

// --- Auth ---

export type UserRole = 'Admin' | 'Member' | 'Instructor';

export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: UserRole[];
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  nicNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  addressLine1?: string;
  city?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  packageId: number;
}

// --- Membership & Packages ---

export interface MembershipPackage {
  packageId: number;
  packageName: string;
  description?: string;
  durationDays: number;
  priceLKR: number;
  typeName?: string;
  amenities?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  packageTypeId?: number;
}

export interface PackageType {
  packageTypeId: number;
  typeName: string;
  description?: string;
}

export interface CreatePackageRequest {
  packageTypeId: number;
  packageName: string;
  description?: string;
  amenities?: string;
  durationDays: number;
  priceLKR: number;
  isFeatured: boolean;
}

export interface UpdatePackageRequest extends CreatePackageRequest {
  isActive: boolean;
}

export interface CreateMemberRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  packageId: number;
}

export interface CreateInstructorRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  specialization?: string;
}

// --- Public / Marketing ---

export interface Trainer {
  trainerId: number;
  fullName: string;
  title?: string;
  bio?: string;
  specializations?: string;
  photoUrl?: string;
}

export interface ContactMessage {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// --- Profiles ---

export interface MemberProfile {
  memberId: number;
  identificationNumber: string;
  fullName?: string;
  email?: string;
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
  profilePhotoUrl?: string;
  membership?: {
    packageName: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
}

export interface PortalProfile {
  identificationNumber?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  nicNumber?: string;
  dateOfBirth?: string;
  age?: number;
  addressLine1?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  profilePhotoUrl?: string;
}

export interface UpdateProfileRequest {
  phone?: string;
  addressLine1?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  profilePhotoUrl?: string;
  dateOfBirth?: string;
}

export interface InstructorProfile extends PortalProfile {
  instructorId: number;
  specialization?: string;
  isFingerprintActivated: boolean;
}

// --- Inventory & POS ---

export interface Product {
  productId: number;
  sku: string;
  productName: string;
  description?: string;
  unitPriceLKR: number;
  imageUrl?: string;
  categoryName?: string;
  categoryId?: number;
  quantityOnHand?: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export interface ProductCategory {
  categoryId: number;
  categoryName: string;
}

export interface CreateProductRequest {
  categoryId: number;
  sku: string;
  productName: string;
  description?: string;
  unitPriceLKR: number;
  initialQuantity: number;
  reorderLevel: number;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  categoryId: number;
  sku: string;
  productName: string;
  description?: string;
  unitPriceLKR: number;
  reorderLevel: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface InventoryItem {
  inventoryItemId: number;
  productId: number;
  productName: string;
  sku: string;
  quantityOnHand: number;
  reorderLevel: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// --- Orders & POS ---

export interface Order {
  orderId: number;
  orderReference: string;
  status: string;
  totalLKR: number;
  orderChannel?: string;
  createdAt: string;
  billReference?: string;
  items: OrderItem[];
}

export interface PosBillLine {
  productName: string;
  sku: string;
  quantity: number;
  unitPriceLKR: number;
  lineTotal: number;
}

export interface PosBill {
  billReference: string;
  orderReference: string;
  paymentReference: string;
  paymentMethod: string;
  subtotalLKR: number;
  totalLKR: number;
  saleDate: string;
  items: PosBillLine[];
}

export interface PosSaleResponse {
  order: Order;
  bill: PosBill;
}

export interface OrderItem {
  productId?: number;
  productName: string;
  quantity: number;
  unitPriceLKR: number;
  lineTotalLKR: number;
}

// --- Payments ---

export interface PaymentRequest {
  amountLKR: number;
  email?: string;
}

export interface PaymentResponse {
  paymentReference: string;
  checkoutUrl: string;
  merchantId: string;
}

// --- Reports ---

export interface ReportSummary {
  totalMembershipInGymRevenue: number;
  totalMembershipGatewayRevenue: number;
  totalPosRevenue: number;
  totalSessionGatewayRevenue: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  totalMembers: number;
  activeMembers: number;
  lowStockItems: number;
  dailyRevenue: DailyRevenue[];
  recentTransactions: RecentTransaction[];
}

export interface RecentTransaction {
  transactionId: number;
  reference: string;
  category: string;
  description: string;
  amountLKR: number;
  transactionDate: string;
  status: string;
}

export interface DailyRevenue {
  date: string;
  membershipInGym: number;
  membershipGateway: number;
  pos: number;
  session: number;
}

export interface MonthlyReport {
  year: number;
  month: number;
  monthLabel: string;
  membershipInGymRevenue: number;
  membershipGatewayRevenue: number;
  posRevenue: number;
  sessionGatewayRevenue: number;
  totalRevenue: number;
  soldItems: SoldItemReport[];
  recentTransactions: RecentTransaction[];
}

export interface SoldItemReport {
  productName: string;
  sku: string;
  quantitySold: number;
  revenueLKR: number;
  channel: string;
}

// --- Attendance ---

export interface AttendanceLog {
  attendanceLogId: number;
  loggedAt: string;
  accessGranted: boolean;
  validationMessage?: string;
  memberName?: string;
  instructorName?: string;
  personType?: string;
}

// --- Special Sessions ---

export interface SpecialSessionEnrollment {
  memberId: number;
  memberName: string;
  email: string;
  enrolledAt: string;
}

export interface SpecialSession {
  sessionId: number;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  feePerPersonLKR: number;
  maxParticipants: number;
  enrolledCount: number;
  spotsRemaining: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | string;
  runtimeStatus: string;
  hasTimeConflict: boolean;
  instructorName: string;
  instructorId: number;
  rejectionReason?: string;
  createdAt: string;
  enrollments?: SpecialSessionEnrollment[];
}

export interface CreateSpecialSessionRequest {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  feePerPersonLKR: number;
  maxParticipants: number;
}

export interface ReviewSpecialSessionRequest {
  rejectionReason?: string;
}

// --- Member Fitness Plans ---

export interface MemberPlanMemberOption {
  memberId: number;
  identificationNumber: string;
  fullName: string;
  email: string;
}

export interface MemberFitnessPlanSummary {
  planId: number;
  memberId: number;
  memberName: string;
  instructorName: string;
  title: string;
  fitnessGoal: string;
  updatedAt: string;
}

export interface MemberFitnessPlan extends MemberFitnessPlanSummary {
  memberIdentificationNumber: string;
  instructorId: number;
  workoutPlan: string;
  mealPlan: string;
  notes?: string;
  createdAt: string;
}

export interface CreateMemberFitnessPlanRequest {
  memberId: number;
  title: string;
  fitnessGoal: string;
  workoutPlan: string;
  mealPlan: string;
  notes?: string;
}

export interface UpdateMemberFitnessPlanRequest {
  title: string;
  fitnessGoal: string;
  workoutPlan: string;
  mealPlan: string;
  notes?: string;
}
