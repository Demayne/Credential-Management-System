/**
 * Email Service
 *
 * Sends transactional emails via SMTP using Nodemailer.
 * In development, if EMAIL_HOST is not set, emails are logged to the console
 * instead of being sent — no SMTP setup required for local dev.
 *
 * Required environment variables (production):
 *   EMAIL_HOST   — SMTP host, e.g. smtp.sendgrid.net or smtp-mail.outlook.com
 *   EMAIL_PORT   — SMTP port, typically 587 (TLS) or 465 (SSL)
 *   EMAIL_USER   — SMTP username / API key username
 *   EMAIL_PASS   — SMTP password / API key
 *   EMAIL_FROM   — Sender address, e.g. "CoolTech <no-reply@cooltech.com>"
 */

const nodemailer = require('nodemailer');

function createTransporter() {
  if (!process.env.EMAIL_HOST) return null;

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

async function sendPasswordResetEmail(toEmail, resetUrl) {
  const transporter = createTransporter();

  if (!transporter) {
    // Dev fallback: log to console so the flow still works without SMTP
    console.log('\n--- PASSWORD RESET EMAIL (dev / no EMAIL_HOST set) ---');
    console.log(`To:  ${toEmail}`);
    console.log(`URL: ${resetUrl}`);
    console.log('------------------------------------------------------\n');
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Reset your password — CoolTech Credential Manager',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset the password for your account.</p>
        <p>Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
        <p style="margin:2rem 0">
          <a href="${resetUrl}"
             style="background:#2563EB;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:500">
            Reset Password
          </a>
        </p>
        <p style="color:#6b7280;font-size:0.875rem">
          If you did not request a password reset, you can safely ignore this email.
          Your password will not change.
        </p>
      </div>
    `
  });
}

module.exports = { sendPasswordResetEmail };
