import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL ?? 'director@dt-academy.local',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeNow!',
  seedAdminName: process.env.SEED_ADMIN_NAME ?? 'Academy Director',
  paymentsMode: (process.env.PAYMENTS_MODE === 'sandbox' ? 'sandbox' : 'mock') as 'mock' | 'sandbox',
  publicWebUrl: process.env.PUBLIC_WEB_URL ?? 'http://localhost:5173',
  telebirr: {
    baseUrl:
      process.env.TELEBIRR_BASE_URL ??
      'https://developerportal.ethiotelebirr.et:38443/apiaccess/payment/gateway',
    webPay:
      process.env.TELEBIRR_WEB_PAY ??
      'https://developerportal.ethiotelebirr.et:38443/payment/web/paygate?',
    fabricAppId: process.env.FABRIC_APP_ID ?? process.env.TELEBIRR_FABRIC_APP_ID ?? '',
    fabricAppSecret: process.env.FABRIC_APP_SECRET ?? process.env.TELEBIRR_APP_SECRET ?? '',
    merchantAppId: process.env.MERCHANT_APP_ID ?? process.env.TELEBIRR_MERCHANT_APP_ID ?? '',
    merchantCode: process.env.MERCHANT_CODE ?? process.env.TELEBIRR_MERCHANT_CODE ?? '',
    privateKey: process.env.TELEBIRR_PRIVATE_KEY ?? '',
    notifyUrl: process.env.TELEBIRR_NOTIFY_URL ?? '',
    redirectUrl: process.env.TELEBIRR_REDIRECT_URL ?? '',
  },
  mpesa: {
    baseUrl: process.env.MPESA_BASE_URL ?? 'https://apisandbox.safaricom.et',
    consumerKey: process.env.MPESA_CONSUMER_KEY ?? '',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET ?? '',
    shortcode: process.env.MPESA_SHORTCODE ?? '',
    passkey: process.env.MPESA_PASSKEY ?? '',
    callbackUrl: process.env.MPESA_CALLBACK_URL ?? '',
  },
};
