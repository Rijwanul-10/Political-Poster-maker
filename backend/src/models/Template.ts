// src/models/Template.ts
import mongoose, { Schema, Document } from 'mongoose';

// Types for layout configuration
interface CanvasConfig {
  width: number;
  height: number;
}

interface PhotoSlot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: string; // e.g., 'cutout', 'circle'
}

interface TextSlot {
  id: string;
  x: number;
  y: number;
  maxWidth: number;
  maxChars: number;
  fontFamily: string;
  fontSize: number;
  color: string;
  role: string; // e.g., 'headline', 'name', 'designation'
}

interface DecorationConfig {
  baseAssets: string[];
  colorSchemeOptions: string[];
}

interface LayoutConfig {
  canvas: CanvasConfig;
  photoSlots: PhotoSlot[];
  textSlots: TextSlot[];
  decoration: DecorationConfig;
}

export interface ITemplate extends Document {
  title: string;
  occasionType: string;
  thumbnailUrl: string;
  layoutConfig: LayoutConfig;
  isActive: boolean;
}

const LayoutConfigSchema = new Schema(
  {
    canvas: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    photoSlots: [
      {
        id: { type: String, required: true },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        shape: { type: String, required: true },
      },
    ],
    textSlots: [
      {
        id: { type: String, required: true },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        maxWidth: { type: Number, required: true },
        maxChars: { type: Number, required: true },
        fontFamily: { type: String, required: true },
        fontSize: { type: Number, required: true },
        color: { type: String, required: true },
        role: { type: String, required: true },
      },
    ],
    decoration: {
      baseAssets: [{ type: String, required: true }],
      colorSchemeOptions: [{ type: String, required: true }],
    },
  },
  { _id: false }
);

const TemplateSchema = new Schema<ITemplate>({
  title: { type: String, required: true },
  occasionType: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  layoutConfig: { type: LayoutConfigSchema, required: true },
  isActive: { type: Boolean, default: true },
});

export const Template = mongoose.model<ITemplate>('Template', TemplateSchema);


