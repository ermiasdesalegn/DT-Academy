import { env } from '../config/env';
import type { CheckoutRequest, CheckoutResult } from './types';

export function createMockCheckout(input: CheckoutRequest): CheckoutResult {
  const url = new URL('/portal/pay/return', env.publicWebUrl);
  url.searchParams.set('payment', input.paymentId);
  url.searchParams.set('mock', '1');
  return {
    redirectUrl: url.toString(),
    waitingForPhone: input.method === 'MPESA',
    providerRef: `MOCK-${input.paymentId}`,
  };
}
