import { Resend } from "resend";

function appUrl() {
  return (process.env.AUTH_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.warn(`[email] ${subject} not sent: RESEND_API_KEY and EMAIL_FROM are required.`);
    return false;
  }
  await new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.EMAIL_FROM, to, subject, html });
  return true;
}

export function sendVerificationEmail(email: string, token: string) {
  const url = `${appUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  return send(email, "Verify your NokerBroker email", `<p>Verify your email address to secure your NokerBroker account.</p><p><a href="${url}">Verify email</a></p><p>This link expires in 24 hours.</p>`);
}

export function sendPasswordResetEmail(email: string, token: string) {
  const url = `${appUrl()}/forgot-password?token=${encodeURIComponent(token)}`;
  return send(email, "Reset your NokerBroker password", `<p>Use the link below to reset your password.</p><p><a href="${url}">Reset password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this email.</p>`);
}

export function sendNotificationEmail(email: string, subject: string, message: string, link?: string) {
  const href = link ? `${appUrl()}${link.startsWith("/") ? link : `/${link}`}` : appUrl();
  return send(email, subject, `<p>${escapeHtml(message)}</p><p><a href="${href}">Open NokerBroker</a></p>`);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}
