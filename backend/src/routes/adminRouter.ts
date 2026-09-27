import express, { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, adminMiddleware } from '../middleware/auth';
import { Template } from '../models/Template';
import { Poster } from '../models/Poster';
import { User } from '../models/User';
import { Payment } from '../models/Payment';
import { GenerationLog } from '../models/GenerationLog';

const router = express.Router();

// Enforce admin privileges on all admin endpoints
router.use(adminMiddleware);

// GET /api/admin/stats – complete overview stats, records, and telemetry
router.get('/stats', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      totalPosters,
      completedPosters,
      failedPosters,
      totalTemplates,
      activeTemplates,
      totalPayments,
      revenueResult,
      recentUsers,
      recentPosters,
      recentPayments,
      recentLogs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isEmailVerified: true }),
      Poster.countDocuments(),
      Poster.countDocuments({ status: 'completed' }),
      Poster.countDocuments({ status: 'failed' }),
      Template.countDocuments(),
      Template.countDocuments({ isActive: true }),
      Payment.countDocuments({ status: 'verified' }),
      Payment.aggregate([
        { $match: { status: 'verified' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      User.find().select('name email phone role isEmailVerified createdAt').sort({ createdAt: -1 }).limit(10),
      Poster.find()
        .populate('userId', 'name email phone')
        .populate('templateId', 'title occasionType')
        .sort({ createdAt: -1 })
        .limit(10),
      Payment.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),
      GenerationLog.find().sort({ createdAt: -1 }).limit(10),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      totalUsers,
      verifiedUsers,
      totalPosters,
      completedPosters,
      failedPosters,
      totalTemplates,
      activeTemplates,
      totalPayments,
      totalRevenue,
      recentUsers,
      recentPosters,
      recentPayments,
      recentLogs,
      systemInfo: {
        nodeVersion: process.version,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        model: 'gemini-3.8-flash',
        platform: process.platform,
        serverTime: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/templates – list all templates (including inactive)
router.get('/templates', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/templates – create a new template
router.post('/templates', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, occasionType, thumbnailUrl, layoutConfig, isActive } = req.body;
    if (!title || !occasionType) {
      return res.status(400).json({ error: 'Title and occasionType are required' });
    }

    const template = new Template({
      title,
      occasionType,
      thumbnailUrl: thumbnailUrl || 'https://res.cloudinary.com/demo/image/upload/v1/thumbnail_custom.jpg',
      layoutConfig: layoutConfig || {
        canvas: { width: 1200, height: 1600 },
        photoSlots: [{ id: 'photo1', x: 400, y: 200, width: 400, height: 500, shape: 'cutout' }],
        textSlots: [
          { id: 'headline', x: 100, y: 50, maxWidth: 1000, maxChars: 35, fontFamily: 'Tiro Bangla', fontSize: 50, color: '#fef08a', role: 'headline' },
          { id: 'name', x: 100, y: 800, maxWidth: 800, maxChars: 25, fontFamily: 'Hind Siliguri', fontSize: 40, color: '#ffffff', role: 'name' },
        ],
        decoration: { baseAssets: [], colorSchemeOptions: ['#064e3b', '#dc2626', '#f59e0b'] },
      },
      isActive: isActive !== undefined ? isActive : true,
    });

    await template.save();
    res.status(201).json(template);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/templates/:id – update template
router.patch('/templates/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await Template.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Template not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/templates/:id – delete template
router.delete('/templates/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const deleted = await Template.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Template not found' });
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/posters – moderation queue (view all recent posters across all users)
router.get('/posters', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const posters = await Poster.find()
      .populate('userId', 'name email phone role')
      .populate('templateId', 'title occasionType')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(posters);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/posters/:id – moderate / remove flagged poster
router.delete('/posters/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await Poster.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post removed by administrator' });
  } catch (err) {
    next(err);
  }
});

export default router;
