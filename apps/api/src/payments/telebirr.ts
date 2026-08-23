import { env } from '../config/env';
import { signSortedFields } from './rsa';
import type { CheckoutRequest, CheckoutResult } from './types';

function merchOrderId(paymentId: string): string {
  return paymentId.replace(/[^A-Za-z0-9]/g, '').slice(0, 32) || 'DTORDER';
}

function requireTelebirrConfig(): void {
  const t = env.telebirr;
  if (!t.fabricAppId || !t.fabricAppSecret || !t.merchantAppId || !t.merchantCode || !t.privateKey) {
    throw new Error('Telebirr sandbox credentials are missing. Set FABRIC_APP_ID, FABRIC_APP_SECRET, MERCHANT_APP_ID, MERCHANT_CODE, and TELEBIRR_PRIVATE_KEY, or use PAYMENTS_MODE=mock.');
  }
}

async function applyFabricToken(): Promise<string> {
  const res = await fetch(`${env.telebirr.baseUrl}/payment/v1/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-APP-Key': env.telebirr.fabricAppId,
    },
    body: JSON.stringify({ appSecret: env.telebirr.fabricAppSecret }),
  });
  const json = (await res.json()) as { token?: string; access_token?: string; message?: string };
  const token = json.token ?? json.access_token;
  if (!token) {
    throw new Error(json.message ?? 'Telebirr did not return a fabric token.');
  }
  return token;
}

export async function createTelebirrCheckout(input: CheckoutRequest): Promise<CheckoutResult> {
  requireTelebirrConfig();
  const token = await applyFabricToken();
  const nonce = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const orderId = merchOrderId(input.paymentId);
  const notifyUrl = env.telebirr.notifyUrl;
  const redirectUrl = env.telebirr.redirectUrl || `${env.publicWebUrl}/portal/pay/return?payment=${input.paymentId}`;

  const biz = {
    notify_url: notifyUrl,
    redirect_url: redirectUrl,
    appid: env.telebirr.merchantAppId,
    merch_code: env.telebirr.merchantCode,
    merch_order_id: orderId,
    trade_type: 'Checkout',
    title: 'DT Academy tuition',
    total_amount: input.amountEtb.toFixed(2),
    trans_currency: 'ETB',
    timeout_express: '120m',
    payee_identifier: env.telebirr.merchantCode,
    payee_identifier_type: '04',
    payee_type: '5000',
  };

  const request: Record<string, string> = {
    timestamp,
    nonce_str: nonce,
    method: 'payment.preorder',
    version: '1.0',
    biz_content: JSON.stringify(biz),
  };
  request.sign = signSortedFields(request, env.telebirr.privateKey);
  request.sign_type = 'SHA256WithRSA';

  const res = await fetch(`${env.telebirr.baseUrl}/payment/v1/merchant/preOrder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-APP-Key': env.telebirr.fabricAppId,
      Authorization: token,
    },
    body: JSON.stringify(request),
  });
  const json = (await res.json()) as {
    prepay_id?: string;
    biz_content?: { prepay_id?: string };
    result?: string;
    msg?: string;
    message?: string;
  };
  const prepayId = json.prepay_id ?? json.biz_content?.prepay_id;
  if (!prepayId) {
    throw new Error(json.msg ?? json.message ?? 'Telebirr did not return a prepay id.');
  }

  const raw = {
    appid: env.telebirr.merchantAppId,
    merch_code: env.telebirr.merchantCode,
    nonce_str: nonce,
    prepay_id: prepayId,
    timestamp,
  };
  const rawSign = signSortedFields(raw, env.telebirr.privateKey);
  const rawRequest = `${Object.entries(raw)
    .map(([k, v]) => `${k}=${v}`)
    .join('&')}&sign=${rawSign}&sign_type=SHA256WithRSA`;
  const checkoutUrl = `${env.telebirr.webPay}${encodeURIComponent(rawRequest)}`;

  return { redirectUrl: checkoutUrl, providerRef: orderId };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function parseTelebirrNotify(body: unknown): { merchOrderId: string; transId?: string; paid: boolean } | null {
  const root = asRecord(body);
  const bizRaw = root.biz_content;
  const biz = typeof bizRaw === 'string' ? asRecord(JSON.parse(bizRaw) as unknown) : asRecord(bizRaw);
  const merchOrderId = String(biz.merch_order_id ?? root.merch_order_id ?? '');
  if (!merchOrderId) return null;
  const status = String(biz.trade_status ?? root.trade_status ?? '').toUpperCase();
  const paid = status === 'COMPLETED' || status === 'SUCCESS' || status === 'PAY_SUCCESS' || status === '';
  return {
    merchOrderId,
    transId: biz.trans_id ? String(biz.trans_id) : undefined,
    paid,
  };
}
