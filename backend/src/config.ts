import * as dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/../.env` });

export const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'changeme',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  cloudinaryUrl: process.env.CLOUDINARY_URL ?? '',
  smtpHost: process.env.SMTP_HOST ?? '',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  smtpFrom: process.env.SMTP_FROM ?? 'পোস্টার কারিগর <no-reply@poster-maker.com>',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
};
