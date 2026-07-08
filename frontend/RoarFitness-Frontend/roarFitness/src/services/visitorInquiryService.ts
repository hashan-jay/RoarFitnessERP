import { api } from './apiClient'
import type { VisitorInquiry } from '../types/api'

export const visitorInquiryService = {
  list: () => api.get<VisitorInquiry[]>('/admin/visitor-inquiries', true),
}
