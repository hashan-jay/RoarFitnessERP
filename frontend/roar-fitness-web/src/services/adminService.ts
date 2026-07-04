/**
 * Admin portal facade — delegates to domain services for members, inventory, POS, reports, and packages.
 * API: /membership, /inventory, /pos, /reports, /attendance (admin-authenticated).
 */
import { membershipService } from './membershipService';
import { inventoryService } from './inventoryService';
import { posService } from './posService';
import { reportService } from './reportService';
import { attendanceService } from './attendanceService';
import { packageService } from './packageService';
import type {
  CreateMemberRequest,
  CreateInstructorRequest,
  CreateProductRequest,
  UpdateProductRequest,
  CreatePackageRequest,
  UpdatePackageRequest,
} from '../types';

/**
 * Unified admin operations; each method forwards to the appropriate domain service.
 */
export const adminService = {
  createMember: (data: CreateMemberRequest) => membershipService.createMember(data),

  createInstructor: (data: CreateInstructorRequest) =>
    membershipService.createInstructor({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      specialization: data.specialization,
    }),

  getMembers: () => membershipService.listMembers(),

  getInstructors: () => membershipService.listInstructors(),

  getInventory: () => inventoryService.getAll(),

  getCategories: () => inventoryService.getCategories(),

  createProduct: (data: CreateProductRequest) => inventoryService.create(data),

  updateProduct: (productId: number, data: UpdateProductRequest) =>
    inventoryService.update(productId, data),

  deleteProduct: (productId: number) => inventoryService.remove(productId),

  clearStock: (productId: number, reason: string) =>
    inventoryService.clearStock(productId, reason),

  adjustInventory: (productId: number, quantityChange: number, reason: string) =>
    inventoryService.adjust(productId, quantityChange, reason),

  getProducts: () => inventoryService.getAll(),

  createPosOrder: (items: { productId: number; quantity: number }[], paymentMethod: string) =>
    posService.createSale(items, paymentMethod),

  getReports: () => reportService.getSummary(),

  getMonthlyReport: (year: number, month: number) => reportService.getMonthly(year, month),

  activateMemberFingerprint: (memberId: number, fingerprintTemplateId: string) =>
    attendanceService.activateMemberFingerprint(memberId, fingerprintTemplateId),

  getPackagesAdmin: () => packageService.getAdminAll(),

  getPackageTypes: () => packageService.getTypes(),

  createPackage: (data: CreatePackageRequest) => packageService.create(data),

  updatePackage: (packageId: number, data: UpdatePackageRequest) =>
    packageService.update(packageId, data),

  deletePackage: (packageId: number) => packageService.remove(packageId),
};
