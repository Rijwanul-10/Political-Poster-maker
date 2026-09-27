import express from 'express';
import authRouter from './authRouter';
import templateRouter from './templateRouter';
import posterRouter from './posterRouter';
import uploadRouter from './uploadRouter';
import adminRouter from './adminRouter';
import paymentRouter from './paymentRouter';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/templates', templateRouter);
router.use('/posters', posterRouter);
router.use('/upload', uploadRouter);
router.use('/admin', adminRouter);
router.use('/payments', paymentRouter);

export default router;
