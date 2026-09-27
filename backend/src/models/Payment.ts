import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPayment extends Document {
  userId: Types.ObjectId;
  posterId?: Types.ObjectId;
  amount: number;
  currency: string;
  gateway: 'bkash' | 'nagad';
  gatewayTxnId: string;
  phoneNumber: string;
  status: 'pending' | 'verified' | 'failed' | 'refunded';
  purpose: 'watermark_removal';
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    posterId: { type: Schema.Types.ObjectId, ref: 'Poster' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    gateway: { type: String, enum: ['bkash', 'nagad'], required: true },
    gatewayTxnId: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    status: { type: String, enum: ['pending', 'verified', 'failed', 'refunded'], default: 'pending' },
    purpose: { type: String, enum: ['watermark_removal'], default: 'watermark_removal' },
    verifiedAt: Date,
  },
  { timestamps: true },
);

// Index for quick lookup by user + purpose
PaymentSchema.index({ userId: 1, purpose: 1, status: 1 });
PaymentSchema.index({ gatewayTxnId: 1 }, { unique: true });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
