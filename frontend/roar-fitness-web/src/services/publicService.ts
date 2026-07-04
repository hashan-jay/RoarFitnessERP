/**
 * Public (unauthenticated) marketing site API — packages and contact.
 */
import { api } from './apiClient';
import { packageService } from './packageService';
import type { ContactMessage } from '../types';

export const publicService = {
  getPackages: () => packageService.getPublic(),

  sendContactMessage: (data: ContactMessage) =>
    api.post<void>('/public/contact', data),
};
