import express, { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';
import { Poster, IPoster } from '../models/Poster';
import { Template } from '../models/Template';
import { uploadFromBuffer } from '../services/storageService';
import { generateLayoutSuggestion } from '../services/geminiService';
import { renderPosterToBuffer } from '../services/renderService';
import { uploadFromBuffer as uploadImage } from '../services/storageService';

const router = express.Router();

// Helper to ensure user is attached
router.use(authMiddleware);

// POST /api/posters – create a poster generation request
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const {
      templateId,
      formData,
      photoUrls,
    } = req.body as {
      templateId: string;
      formData: any;
      photoUrls: string[]; // URLs returned from /api/upload
    };

    // Validate template exists
    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    // Create Poster doc in "draft" state
    const poster = new Poster({
      userId,
      templateId,
      formData,
      uploadedPhotoUrls: photoUrls,
      status: 'generating',
    } as Partial<IPoster>);
    await poster.save();

    // Call Gemini for layout suggestions (crops, colors)
    const geminiSuggestion = await generateLayoutSuggestion(template, photoUrls, formData);
    poster.geminiSuggestion = geminiSuggestion;
    await poster.save();

    // Render poster image via Puppeteer
    const imageBuffer = await renderPosterToBuffer(template, geminiSuggestion, formData, photoUrls);

    // Upload final image to Cloudinary
    const uploadResult = await uploadImage(imageBuffer, 'generated-posters');
    poster.generatedImageUrl = uploadResult.url;
    poster.status = 'completed';
    await poster.save();

    res.status(201).json({ posterId: poster._id, imageUrl: poster.generatedImageUrl });
  } catch (err) {
    next(err);
  }
});

// GET /api/posters/:id – fetch poster status/result
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const poster = await Poster.findById(req.params.id);
    if (!poster) return res.status(404).json({ error: 'Poster not found' });
    res.json(poster);
  } catch (err) {
    next(err);
  }
});

// POST /api/posters/:id/regenerate – allow limited retries
router.post('/:id/regenerate', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const poster = await Poster.findById(req.params.id);
    if (!poster) return res.status(404).json({ error: 'Poster not found' });

    if (poster.regenerateCount >= 3) {
      return res.status(429).json({ error: 'Regeneration limit reached' });
    }

    // Re‑run Gemini and render steps
    const template = await Template.findById(poster.templateId);
    if (!template) return res.status(500).json({ error: 'Template missing' });

    const geminiSuggestion = await generateLayoutSuggestion(template, poster.uploadedPhotoUrls, poster.formData);
    poster.geminiSuggestion = geminiSuggestion;
    poster.regenerateCount += 1;
    await poster.save();

    const imageBuffer = await renderPosterToBuffer(template, geminiSuggestion, poster.formData, poster.uploadedPhotoUrls);
    const uploadResult = await uploadImage(imageBuffer, 'generated-posters');
    poster.generatedImageUrl = uploadResult.url;
    poster.status = 'completed';
    await poster.save();

    res.json({ posterId: poster._id, imageUrl: poster.generatedImageUrl });
  } catch (err) {
    next(err);
  }
});

export default router;
