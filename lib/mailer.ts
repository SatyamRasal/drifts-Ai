import nodemailer from 'nodemailer';
import { clampText, escapeHtml } from '@/lib/utils';

export async function maybeSendNotificationEmail(subject: string, html: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM || user;
  const to = process.env.NOTIFY_EMAIL;

  if (!host || !user || !pass || !from || !to) return false;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to,
      subject: clampText(subject.replace(/[\r\n]+/g, ' ').trim(), 180),
      html,
    });
    return true;
  } catch (error) {
    console.error('Notification email failed:', error);
    return false;
  }
}

export function buildLeadEmailHtml(payload: {
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  message: string;
}) {
  return [
    `<p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>`,
    `<p><strong>Company:</strong> ${escapeHtml(payload.company || '-')}</p>`,
    `<p><strong>Phone:</strong> ${escapeHtml(payload.phone || '-')}</p>`,
    `<p><strong>Message:</strong><br />${escapeHtml(payload.message).replace(/\n/g, '<br />')}</p>`,
  ].join('');
}
