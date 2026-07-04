/**
 * Admin inventory and product catalog management.
 * API: /inventory (authenticated).
 */
import { api } from './apiClient';
import type { Product, ProductCategory, CreateProductRequest, UpdateProductRequest } from '../types';

/**
 * Product CRUD, category listing, stock adjustments, and stock clearing for admin.
 */
export const inventoryService = {
  getAll: (): Promise<Product[]> => api.get<Product[]>('/inventory', true),

  getCategories: (): Promise<ProductCategory[]> =>
    api.get<ProductCategory[]>('/inventory/categories', true),

  create: (data: CreateProductRequest) =>
    api.post<Product>('/inventory', data, true),

  update: (productId: number, data: UpdateProductRequest) =>
    api.put<Product>(`/inventory/${productId}`, data, true),

  remove: (productId: number) =>
    api.delete<{ message: string }>(`/inventory/${productId}`, true),

  clearStock: (productId: number, reason: string) =>
    api.post<{ message: string }>(`/inventory/${productId}/clear`, { reason }, true),

  adjust: (productId: number, quantityChange: number, reason: string) =>
    api.post<{ message: string }>(
      '/inventory/adjust',
      { productId, quantityChange, reason },
      true
    ),
};
