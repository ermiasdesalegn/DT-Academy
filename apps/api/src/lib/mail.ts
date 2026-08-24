import { env } from '../config/env';

export type ContactMessage = {
  name: string;
  phone: string;
  message: string;
  email?: string;
};

export async function sendContactEmail(input: ContactMessage): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const configured = Boolean(env.resendApiKey && env.contactTo);
  if (!configured) {
    if (env.nodeEnv === 'production') {
      return { ok: false, status: 503, message: 'The office inbox is not configured yet. Call the school phone.' };
    }
    console.info('[contact] (dev, no Resend) inquiry', input);
    return { ok: true };
  }

  const from = env.contactFrom || 'DT Academy <beth.t@example.com>';
  const replyBits = [`Phone: ${input.phone}`];
  if (input.email) replyBits.push(`Email: ${input.email}`);
  const text = [`From: ${input.name}`, ...replyBits, '', input.message].join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [env.contactTo],
      subject: `Website inquiry from ${input.name}`,
      text,
      ...(input.email ? { reply_to: input.email } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('Resend error', res.status, body);
    return { ok: false, status: 502, message: 'Could not send the message. Call the office or try again later.' };
  }
  return { ok: true };
}
