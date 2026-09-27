import nodemailer from 'nodemailer';
import { config } from '../config';

let transporter: any = null;

async function getTransporter(): Promise<any> {
  if (transporter) return transporter;

  if (config.smtpUser && config.smtpPass) {
    const isGmail = (config.smtpHost && config.smtpHost.includes('gmail')) || config.smtpUser.includes('@gmail.com');
    const cleanPass = config.smtpPass.replace(/\s+/g, '');

    if (isGmail) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.smtpUser,
          pass: cleanPass,
        },
        connectionTimeout: 10000, // 10s timeout prevents hanging 2 minutes
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });
      return transporter;
    }

    if (config.smtpHost) {
      transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort || 587,
        secure: config.smtpPort === 465,
        auth: {
          user: config.smtpUser,
          pass: cleanPass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });
      return transporter;
    }
  }

  // If SMTP not configured, throw error to enforce real SMTP setup
  throw new Error('🚨 SMTP configuration missing. Please set SMTP_USER, SMTP_PASS, SMTP_HOST, and SMTP_FROM environment variables.');
}

async function sendViaResend(to: string, subject: string, html: string): Promise<any> {
  const from = config.smtpFrom.includes('<') ? config.smtpFrom : `পোস্টার কারিগর <${config.smtpFrom || 'onboarding@resend.dev'}>`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Resend API error: ${res.status}`);
  }
  return { success: true, id: data.id };
}

async function sendViaBrevo(to: string, subject: string, html: string): Promise<any> {
  const senderEmail = config.smtpUser || 'rizwanulkafi2003@gmail.com';
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': config.brevoApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'পোস্টার কারিগর', email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Brevo API error: ${res.status}`);
  }
  return { success: true, messageId: data.messageId };
}

export async function testSmtpConnection(): Promise<{ success: boolean; message: string; provider?: string }> {
  if (config.resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/api-keys', {
        headers: { 'Authorization': `Bearer ${config.resendApiKey}` },
      });
      if (res.ok) return { success: true, message: 'Resend HTTP API connected and verified!', provider: 'Resend (HTTP/443)' };
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.message || 'Resend API key invalid', provider: 'Resend (HTTP/443)' };
    } catch (e: any) {
      return { success: false, message: e.message, provider: 'Resend (HTTP/443)' };
    }
  }

  if (config.brevoApiKey) {
    try {
      const res = await fetch('https://api.brevo.com/v3/account', {
        headers: { 'api-key': config.brevoApiKey },
      });
      if (res.ok) return { success: true, message: 'Brevo HTTP API connected and verified!', provider: 'Brevo (HTTP/443)' };
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.message || 'Brevo API key invalid', provider: 'Brevo (HTTP/443)' };
    } catch (e: any) {
      return { success: false, message: e.message, provider: 'Brevo (HTTP/443)' };
    }
  }

  try {
    const t = await getTransporter();
    await t.verify();
    return { success: true, message: 'SMTP connection verified successfully!', provider: 'SMTP' };
  } catch (err: any) {
    return { 
      success: false, 
      message: err.message || 'SMTP verification failed', 
      provider: 'SMTP (Note: Render Free Tier blocks outbound SMTP ports 25/465/587)' 
    };
  }
}

export async function sendOtpEmail(to: string, otp: string, purpose: 'registration' | 'password_reset') {
  const isReset = purpose === 'password_reset';
  const subject = isReset 
    ? 'পাসওয়ার্ড রিসেট ভেরিফিকেশন কোড - পোস্টার কারিগর' 
    : 'অ্যাকাউন্ট ভেরিফিকেশন কোড - পোস্টার কারিগর';

  const title = isReset 
    ? 'পাসওয়ার্ড রিসেট ওটিপি (OTP)' 
    : 'অ্যাকাউন্ট ভেরিফিকেশন ওটিপি (OTP)';

  const description = isReset
    ? 'আপনার পোস্টার কারিগর অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করার জন্য এই ওয়ান-টাইম কোডটি ব্যবহার করুন। এই কোডটি আগামী ১০ মিনিট কার্যকর থাকবে।'
    : 'পোস্টার কারিগরে নিবন্ধন সম্পন্ন করতে এই ওয়ান-টাইম কোডটি ব্যবহার করুন। এই কোডটি আগামী ১০ মিনিট কার্যকর থাকবে।';

  const html = `
    <!DOCTYPE html>
    <html lang="bn">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #0f172a; }
          .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 40px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .brand { text-align: center; margin-bottom: 25px; }
          .brand-logo { display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #059669, #0d9488); border-radius: 14px; color: #ffffff; font-size: 24px; font-weight: bold; line-height: 48px; }
          .title { font-size: 22px; font-weight: bold; text-align: center; color: #0f172a; margin-top: 15px; }
          .desc { font-size: 14px; color: #475569; text-align: center; line-height: 1.6; margin: 15px 0 25px; }
          .otp-box { text-align: center; background: #f0fdf4; border: 2px dashed #059669; border-radius: 16px; padding: 20px; margin: 25px 0; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #065f46; font-family: monospace; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand">
            <div class="brand-logo">প</div>
            <div class="title">${title}</div>
          </div>
          <p class="desc">${description}</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p class="desc" style="font-size: 12px; color: #64748b;">
            আপনি যদি এই অনুরোধটি না করে থাকেন, তবে নির্দ্বিধায় এই ইমেইলটি উপেক্ষা করুন। আপনার অ্যাকাউন্ট সুরক্ষিত রয়েছে।
          </p>
          <div class="footer">
            © 2026 পোস্টার কারিগর • AI Political & Festival Poster Maker
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    if (config.resendApiKey) {
      await sendViaResend(to, subject, html);
      console.log(`📩 OTP email sent via Resend HTTP API to ${to} (${purpose}).`);
      return { success: true };
    }

    if (config.brevoApiKey) {
      await sendViaBrevo(to, subject, html);
      console.log(`📩 OTP email sent via Brevo HTTP API to ${to} (${purpose}).`);
      return { success: true };
    }

    const mailTransporter = await getTransporter();
    const info = await mailTransporter.sendMail({
      from: config.smtpFrom,
      to,
      subject,
      html,
    });

    console.log(`📩 OTP email sent to ${to} (${purpose}). MessageId: ${info.messageId}`);
    return { success: true };
  } catch (err: any) {
    console.error(`❌ Failed to send OTP email to ${to}:`, err.message || err);
    return { success: false, error: err.message || 'Failed to send email' };
  }
}
