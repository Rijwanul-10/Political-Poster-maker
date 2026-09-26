"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFromBuffer = uploadFromBuffer;
const cloudinary_1 = require("cloudinary");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '..', '..', '.env') });
// Configure Cloudinary using CLOUDINARY_URL or separate env vars
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (cloudinaryUrl) {
    const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@([^/]+)/);
    if (match) {
        const [, api_key, api_secret, cloud_name] = match;
        cloudinary_1.v2.config({ cloud_name, api_key, api_secret });
    }
}
else {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
        api_key: process.env.CLOUDINARY_API_KEY ?? '',
        api_secret: process.env.CLOUDINARY_API_SECRET ?? '',
    });
}
/**
 * Upload a file buffer to Cloudinary.
 * @param buffer Buffer containing file data (e.g., from multer memory storage)
 * @param folder Optional Cloudinary folder name for organization
 * @returns Object with the secure URL and public_id of the uploaded asset
 */
async function uploadFromBuffer(buffer, folder) {
    const mime = detectMimeType(buffer);
    const dataUri = `data:${mime};base64,${buffer.toString('base64')}`;
    const result = await cloudinary_1.v2.uploader.upload(dataUri, { folder });
    return { url: result.secure_url, public_id: result.public_id };
}
/**
 * Naively detect MIME type based on file signature.
 */
function detectMimeType(buf) {
    if (buf.slice(0, 2).toString('hex') === 'ffd8')
        return 'image/jpeg';
    if (buf.slice(0, 4).toString('hex') === '89504e47')
        return 'image/png';
    return 'application/octet-stream';
}
