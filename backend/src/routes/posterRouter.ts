import express, { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';
import { Poster, IPoster } from '../models/Poster';
import { Template } from '../models/Template';
import { Payment } from '../models/Payment';
import { generateLayoutSuggestion } from '../services/geminiService';
import { renderPosterToBuffer } from '../services/renderService';
import { uploadFromBuffer as uploadImage } from '../services/storageService';
import { generationLimiter } from '../middleware/rateLimit';

const router = express.Router();

// Helper to ensure user is attached
router.use(authMiddleware);

// POST /api/posters – create a poster generation request (protected by rate limit)
router.post('/', generationLimiter, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const {
      templateId,
      formData = {},
      photoUrls = [],
      paymentId,
    } = req.body as {
      templateId: string;
      formData: any;
      photoUrls: string[];
      paymentId?: string;
    };

    // Validate template exists
    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    // Determine watermark status: default is WITH watermark
    // Only remove watermark if user has a verified payment
    let showWatermark = true;
    if (formData.removeWatermark === true && paymentId) {
      const payment = await Payment.findOne({
        _id: paymentId,
        userId,
        purpose: 'watermark_removal',
        status: 'verified',
      });
      if (payment) {
        showWatermark = false;
        // Link payment to this poster later
      }
    }

    // Normalize formData to ensure required schema fields are present
    const normalizedFormData = {
      ...formData,
      name: formData.name || 'সম্মানিত অতিথি',
      occasionType: formData.occasionType || template.occasionType || 'general',
      headlineText: formData.headlineText || formData.headline || template.title,
      watermark: showWatermark, // Server-enforced watermark flag
    };

    // Create Poster doc in "generating" state
    const poster = new Poster({
      userId,
      templateId,
      formData: normalizedFormData,
      uploadedPhotoUrls: photoUrls,
      status: 'generating',
    } as Partial<IPoster>);
    await poster.save();

    try {
      // Call Gemini for layout suggestions (crops, colors) with template caching & cost tracking
      const geminiSuggestion = await generateLayoutSuggestion(template, photoUrls, normalizedFormData, poster._id);
      poster.geminiSuggestion = geminiSuggestion;
      poster.markModified('geminiSuggestion');

      // Render poster image via Puppeteer
      const imageBuffer = await renderPosterToBuffer(template, geminiSuggestion, normalizedFormData, photoUrls);

      // Upload final image to Cloudinary (or local fallback)
      const uploadResult = await uploadImage(imageBuffer, 'generated-posters');
      poster.generatedImageUrl = uploadResult.url;
      poster.status = 'completed';
      await poster.save();

      res.status(201).json({ posterId: poster._id, imageUrl: poster.generatedImageUrl });
    } catch (genError: any) {
      console.error('❌ Poster generation error:', genError);
      poster.status = 'failed';
      await poster.save();
      throw genError;
    }
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

// POST /api/posters/:id/regenerate – allow limited retries (protected by rate limit)
router.post('/:id/regenerate', generationLimiter, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const poster = await Poster.findById(req.params.id);
    if (!poster) return res.status(404).json({ error: 'Poster not found' });

    if (poster.regenerateCount >= 3) {
      return res.status(429).json({ error: 'Regeneration limit reached (max 3)' });
    }

    const template = await Template.findById(poster.templateId);
    if (!template) return res.status(500).json({ error: 'Template missing' });

    const geminiSuggestion = await generateLayoutSuggestion(template, poster.uploadedPhotoUrls, poster.formData, poster._id);
    poster.geminiSuggestion = geminiSuggestion;
    poster.markModified('geminiSuggestion');
    poster.regenerateCount += 1;

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

// GET /api/posters/user/:userId – fetch poster history for user
router.get('/user/:userId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const requestedUserId = req.params.userId;
    // Allow users to see their own posters (or admin)
    if (req.user!._id.toString() !== requestedUserId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const posters = await Poster.find({ userId: requestedUserId })
      .populate('templateId', 'title occasionType thumbnailUrl')
      .sort({ createdAt: -1 });

    res.json(posters);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/posters/:id – delete a poster
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const poster = await Poster.findById(req.params.id);
    if (!poster) return res.status(404).json({ error: 'Poster not found' });

    if (poster.userId.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Poster.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Poster deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
