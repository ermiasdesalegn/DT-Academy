import { env } from '../config/env';
import { createMockCheckout } from './mock';
import { createMpesaCheckout } from './mpesa';
import { createTelebirrCheckout } from './telebirr';
import type { CheckoutRequest, CheckoutResult } from './types';

export async function createCheckout(input: CheckoutRequest): Promise<CheckoutResult> {
  if (env.paymentsMode === 'mock') {
    return createMockCheckout(input);
  }
  if (input.method === 'TELEBIRR') {
    return createTelebirrCheckout(input);
  }
  return createMpesaCheckout(input);
}
