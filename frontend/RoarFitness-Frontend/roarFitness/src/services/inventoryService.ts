import { api } from './apiClient'
import type {
  CreateProductRequest,
  Product,
  ProductCategory,
  UpdateProductRequest,
} from '../types/api'

function normalizeCategory(raw: Record<string, unknown>): ProductCategory {
  return {
    categoryId: Number(raw.categoryId ?? raw.CategoryId ?? 0),
    categoryName: String(raw.categoryName ?? raw.CategoryName ?? ''),
  }
}

function normalizeProduct(raw: Record<string, unknown>): Product {
  return {
    productId: Number(raw.productId ?? raw.ProductId ?? 0),
    sku: String(raw.sku ?? raw.SKU ?? ''),
    productName: String(raw.productName ?? raw.ProductName ?? ''),
    description: (raw.description ?? raw.Description) as string | undefined,
    unitPriceLKR: Number(raw.unitPriceLKR ?? raw.UnitPriceLKR ?? 0),
    quantityOnHand: Number(raw.quantityOnHand ?? raw.QuantityOnHand ?? 0),
    categoryName: String(raw.categoryName ?? raw.CategoryName ?? ''),
    categoryId: Number(raw.categoryId ?? raw.CategoryId ?? 0),
    reorderLevel: Number(raw.reorderLevel ?? raw.ReorderLevel ?? 5),
    isActive: Boolean(raw.isActive ?? raw.IsActive ?? true),
    imageUrl: (raw.imageUrl ?? raw.ImageUrl) as string | undefined,
  }
}

export const inventoryService = {
  getAll: async (): Promise<Product[]> => {
    const data = await api.get<Record<string, unknown>[]>('/inventory', true)
    return data.map(normalizeProduct)
  },

  getCategories: async (): Promise<ProductCategory[]> => {
    const data = await api.get<Record<string, unknown>[]>('/inventory/categories', true)
    return data.map(normalizeCategory).filter((category) => category.categoryId > 0)
  },

  create: (data: CreateProductRequest) => api.post<Product>('/inventory', data, true),

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
      true,
    ),
}
