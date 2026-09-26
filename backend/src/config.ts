import * as dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/../.env` });

export const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'changeme',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  cloudinaryUrl: process.env.CLOUDINARY_URL ?? ''
};
