import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPoster extends Document {
  userId: Types.ObjectId;
  templateId: Types.ObjectId | string;
  formData: {
    name: string;
    designation?: string;
    party?: string;
    district?: string;
    union?: string;
    occasionType: string;
    headlineText?: string;
    headlineFont?: string;
    photoLayout?: string;
    watermark?: boolean;
    userDesignPrompt?: string;
    partyLogoUrl?: string;
    extraLogoUrl?: string;
    photoDetails?: Array<{
      name?: string;
      role?: string;
    }>;
  };
  uploadedPhotoUrls: string[];
  geminiSuggestion?: any;
  generatedImageUrl?: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  regenerateCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PosterSchema = new Schema<IPoster>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
    formData: {
      name: { type: String, required: true },
      designation: String,
      party: String,
      district: String,
      union: String,
      occasionType: { type: String, required: true },
      headlineText: String,
      headlineFont: String,
      photoLayout: String,
      watermark: Boolean,
      userDesignPrompt: String,
      partyLogoUrl: String,
      extraLogoUrl: String,
      photoDetails: [
        {
          name: String,
          role: String,
        },
      ],
    },
    uploadedPhotoUrls: [{ type: String }],
    geminiSuggestion: { type: Schema.Types.Mixed, default: null },
    generatedImageUrl: String,
    status: { type: String, enum: ['draft', 'generating', 'completed', 'failed'], default: 'draft' },
    regenerateCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Poster = mongoose.model<IPoster>('Poster', PosterSchema);
