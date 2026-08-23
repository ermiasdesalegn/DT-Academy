import { createSign } from 'node:crypto';

export function toPemPrivateKey(raw: string): string {
  const trimmed = raw.trim().replace(/\\n/g, '\n');
  if (trimmed.includes('BEGIN')) return trimmed;
  const body = trimmed.replace(/\s/g, '');
  const header = body.startsWith('MIIE') ? 'PRIVATE KEY' : 'RSA PRIVATE KEY';
  const lines = body.match(/.{1,64}/g)?.join('\n') ?? body;
  return `-----BEGIN ${header}-----\n${lines}\n-----END ${header}-----`;
}

export function rsaSignSha256(message: string, privateKey: string): string {
  const signer = createSign('SHA256');
  signer.update(message);
  signer.end();
  return signer.sign(toPemPrivateKey(privateKey), 'base64');
}

export function signSortedFields(fields: Record<string, string | number>, privateKey: string): string {
  const message = Object.keys(fields)
    .filter((k) => k !== 'sign' && k !== 'sign_type' && String(fields[k]) !== '')
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join('&');
  return rsaSignSha256(message, privateKey);
}
