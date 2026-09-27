import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGenerationLog extends Document {
  posterId: Types.ObjectId;
  geminiPromptUsed: string;
  tokensUsed: number;
  latencyMs: number;
  success: boolean;
  cached?: boolean;
  errorMessage?: string;
  createdAt: Date;
}

const GenerationLogSchema = new Schema<IGenerationLog>(
  {
    posterId: { type: Schema.Types.ObjectId, ref: 'Poster', required: true, index: true },
    geminiPromptUsed: { type: String, default: '' },
    tokensUsed: { type: Number, default: 0 },
    latencyMs: { type: Number, default: 0 },
    success: { type: Boolean, required: true, default: true },
    cached: { type: Boolean, default: false },
    errorMessage: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const GenerationLog = mongoose.model<IGenerationLog>('GenerationLog', GenerationLogSchema);
