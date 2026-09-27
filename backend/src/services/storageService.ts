import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { config } from '../config';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

// Clean Cloudinary URL if angle brackets were accidentally included
const rawCloudinaryUrl = process.env.CLOUDINARY_URL || config.cloudinaryUrl;
if (rawCloudinaryUrl) {
  const sanitizedUrl = rawCloudinaryUrl.replace(/[<>]/g, '');
  const match = sanitizedUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@([^/]+)/);
  if (match) {
    const [, api_key, api_secret, cloud_name] = match;
    cloudinary.config({ cloud_name, api_key, api_secret });
  }
} else {
  cloudinary.config({
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME ?? '').replace(/[<>]/g, ''),
    api_key: (process.env.CLOUDINARY_API_KEY ?? '').replace(/[<>]/g, ''),
    api_secret: (process.env.CLOUDINARY_API_SECRET ?? '').replace(/[<>]/g, ''),
  });
}

const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Upload a file buffer to Cloudinary with automatic local fallback.
 */
export async function uploadFromBuffer(
  buffer: Buffer,
  folder?: string,
): Promise<{ url: string; public_id: string }> {
  const mime = detectMimeType(buffer);
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';

  try {
    const dataUri = `data:${mime};base64,${buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folder || 'political-posters',
      resource_type: 'image',
    });
    return { url: result.secure_url, public_id: result.public_id };
  } catch (cloudinaryErr) {
    console.warn('⚠️ Cloudinary upload failed, falling back to local file storage:', cloudinaryErr);
    
    // Fallback: save to local disk
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const port = process.env.PORT || config.port || 5000;
    const localUrl = `http://localhost:${port}/uploads/${fileName}`;

    return {
      url: localUrl,
      public_id: `local_${fileName}`,
    };
  }
}

/**
 * Naively detect MIME type based on file signature.
 */
function detectMimeType(buf: Buffer): string {
  if (buf.slice(0, 2).toString('hex') === 'ffd8') return 'image/jpeg';
  if (buf.slice(0, 4).toString('hex') === '89504e47') return 'image/png';
  if (buf.slice(0, 4).toString('string') === 'RIFF') return 'image/webp';
  return 'image/jpeg';
}
