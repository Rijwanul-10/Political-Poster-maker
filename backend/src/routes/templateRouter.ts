import express, { Request, Response, NextFunction } from 'express';
import { Template } from '../models/Template';

const router = express.Router();

// GET /api/templates - list all active templates (optional ?occasion=...)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { occasion } = req.query as { occasion?: string };
    const filter: any = { isActive: true };
    if (occasion) filter.occasionType = occasion;
    const templates = await Template.find(filter).select('-layoutConfig'); // don't send heavy layout config
    res.json(templates);
  } catch (err) {
    next(err);
  }
});

// GET /api/templates/:id - get a single template (including layoutConfig)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tmpl = await Template.findById(req.params.id);
    if (!tmpl) return res.status(404).json({ error: 'Template not found' });
    res.json(tmpl);
  } catch (err) {
    next(err);
  }
});

export default router;
