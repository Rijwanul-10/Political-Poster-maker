import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  type: 'registration' | 'password_reset';
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ['registration', 'password_reset'], required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // MongoDB TTL index to auto-delete expired OTPs
  createdAt: { type: Date, default: Date.now },
});

export const Otp = mongoose.model<IOtp>('Otp', OtpSchema);
