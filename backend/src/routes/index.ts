import express from 'express';
import authRouter from './authRouter';
// Placeholder imports – will be replaced with real routers later
import templateRouter from './templateRouter';
import posterRouter from './posterRouter';
import uploadRouter from './uploadRouter';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/templates', templateRouter);
router.use('/posters', posterRouter);
router.use('/upload', uploadRouter);

export default router;
