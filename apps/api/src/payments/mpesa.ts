import { env } from '../config/env';
import { normalizePhone } from '../utils/phone';
import type { CheckoutRequest, CheckoutResult } from './types';

function requireMpesaConfig(): void {
  const m = env.mpesa;
  if (!m.consumerKey || !m.consumerSecret || !m.shortcode || !m.passkey) {
    throw new Error(
      'M-Pesa sandbox credentials are missing. Set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, and MPESA_PASSKEY, or use PAYMENTS_MODE=mock.'
    );
  }
}

export function toMpesaMsisdn(raw: string): string {
  const digits = normalizePhone(raw);
  if (digits.startsWith('251') && digits.length >= 12) return digits.slice(0, 12);
  if (digits.startsWith('0') && digits.length >= 10) return `251${digits.slice(1, 10)}`;
  if (digits.startsWith('7') && digits.length >= 9) return `251${digits.slice(0, 9)}`;
  return digits;
}

function timestamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

async function accessToken(): Promise<string> {
  const creds = Buffer.from(`${env.mpesa.consumerKey}:${env.mpesa.consumerSecret}`).toString('base64');
  const urls = [
    `${env.mpesa.baseUrl}/v1/token/generate?grant_type=client_credentials`,
    `${env.mpesa.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
  ];
  let last = 'M-Pesa token request failed.';
  for (const url of urls) {
    const res = await fetch(url, { headers: { Authorization: `Basic ${creds}` } });
    const json = (await res.json()) as { access_token?: string; errorMessage?: string };
    if (json.access_token) return json.access_token;
    last = json.errorMessage ?? last;
  }
  throw new Error(last);
}

export async function createMpesaCheckout(input: CheckoutRequest): Promise<CheckoutResult> {
  requireMpesaConfig();
  if (!input.phone?.trim()) {
    throw new Error('Enter the M-Pesa phone number that will approve the payment.');
  }
  const phone = toMpesaMsisdn(input.phone);
  const ts = timestamp();
  const password = Buffer.from(`${env.mpesa.shortcode}${env.mpesa.passkey}${ts}`).toString('base64');
  const token = await accessToken();

  const payload = {
    BusinessShortCode: env.mpesa.shortcode,
    Password: password,
    Timestamp: ts,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(input.amountEtb),
    PartyA: phone,
    PartyB: env.mpesa.shortcode,
    PhoneNumber: phone,
    CallBackURL: env.mpesa.callbackUrl,
    AccountReference: input.paymentId.replace(/[^A-Za-z0-9]/g, '').slice(0, 12),
    TransactionDesc: 'DT Academy tuition',
  };

  const paths = ['/mpesa/stkpush/v1/processrequest', '/mpesa/stkpush/v1/processRequest'];
  let json: {
    CheckoutRequestID?: string;
    MerchantRequestID?: string;
    ResponseCode?: string;
    errorMessage?: string;
    CustomerMessage?: string;
  } = {};
  for (const path of paths) {
    const res = await fetch(`${env.mpesa.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    json = (await res.json()) as typeof json;
    if (json.CheckoutRequestID) break;
  }

  if (!json.CheckoutRequestID) {
    throw new Error(json.errorMessage ?? json.CustomerMessage ?? 'M-Pesa did not start the phone prompt.');
  }

  return {
    waitingForPhone: true,
    providerRef: json.CheckoutRequestID,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function parseMpesaNotify(body: unknown): {
  checkoutRequestId?: string;
  accountRef?: string;
  transId?: string;
  paid: boolean;
} | null {
  const root = asRecord(body);
  const stk = asRecord(asRecord(root.Body).stkCallback);
  if (stk.CheckoutRequestID) {
    const code = Number(stk.ResultCode);
    return {
      checkoutRequestId: String(stk.CheckoutRequestID),
      transId: String(stk.MerchantRequestID ?? ''),
      paid: code === 0,
    };
  }
  const transId = String(root.TransID ?? root.transactionId ?? '');
  const accountRef = String(root.BillRefNumber ?? root.AccountReference ?? root.accountRef ?? '');
  if (!transId && !accountRef) return null;
  return { accountRef, transId, paid: true };
}
