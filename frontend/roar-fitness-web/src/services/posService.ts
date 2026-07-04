import { api } from './apiClient';
import type { PosSaleResponse } from '../types';

export const posService = {
  createSale: (
    items: { productId: number; quantity: number }[],
    paymentMethod: string,
    memberId?: number
  ) =>
    api.post<PosSaleResponse>(
      '/pos/sale',
      { items, paymentMethod, memberId: memberId ?? null },
      true
    ),
};
