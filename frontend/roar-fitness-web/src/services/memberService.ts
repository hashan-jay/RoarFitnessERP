/**
 * Member portal facade — profile and membership payment initiation.
 */
import { membershipService } from './membershipService';
import { paymentService } from './paymentService';
import type { PaymentRequest } from '../types';

export const memberService = {
  getProfile: () => membershipService.getProfile(),

  initiatePayment: (data: PaymentRequest, memberId: number, packageId: number) =>
    paymentService.initMembershipPayment(data, memberId, packageId),
};
