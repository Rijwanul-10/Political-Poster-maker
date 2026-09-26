import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadFromBuffer } from '../services/storageService';

const upload = multer(); // memory storage
const router = express.Router();

// POST /api/upload – expects multipart/form-data with field "file"
router.post('/', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    const { buffer, originalname } = req.file;
    const folder = 'political-poster-uploads';
    const result = await uploadFromBuffer(buffer, folder);
    res.json({ url: result.url, public_id: result.public_id, filename: originalname });
  } catch (err) {
    next(err);
  }
});

export default router;
