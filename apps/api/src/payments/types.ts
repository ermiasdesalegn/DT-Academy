import type { PaymentMethod } from '@prisma/client';

export type MobileMoneyMethod = Extract<PaymentMethod, 'TELEBIRR' | 'MPESA'>;

export type CheckoutRequest = {
  method: MobileMoneyMethod;
  paymentId: string;
  amountEtb: number;
  phone?: string;
};

export type CheckoutResult = {
  redirectUrl?: string;
  waitingForPhone?: boolean;
  providerRef?: string;
};
