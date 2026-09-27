import express, { Response, NextFunction } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';
import { Payment } from '../models/Payment';

const router = express.Router();
router.use(authMiddleware);

/**
 * Watermark removal pricing (BDT)
 * In a real production system, bKash/Nagad APIs would be integrated here.
 * For now, we use a manual payment verification flow:
 *   1. User sends money to a designated bKash/Nagad number
 *   2. User enters the transaction ID on the site
 *   3. Admin verifies the transaction from the admin panel
 *   OR we auto-verify for demo purposes
 */
const WATERMARK_REMOVAL_PRICE = 50; // 50 BDT
const MERCHANT_BKASH = '01XXXXXXXXX'; // Replace with real merchant number
const MERCHANT_NAGAD = '01XXXXXXXXX'; // Replace with real merchant number

// GET /api/payments/config – Return payment config to frontend
router.get('/config', async (_req: AuthenticatedRequest, res: Response) => {
  res.json({
    price: WATERMARK_REMOVAL_PRICE,
    currency: 'BDT',
    bkashNumber: MERCHANT_BKASH,
    nagadNumber: MERCHANT_NAGAD,
    instructions: {
      bkash: `বিকাশ নম্বর ${MERCHANT_BKASH}-এ ${WATERMARK_REMOVAL_PRICE} টাকা "সেন্ড মানি" করুন। তারপর ট্রানজেকশন আইডি (TxnID) এখানে জমা দিন।`,
      nagad: `নগদ নম্বর ${MERCHANT_NAGAD}-এ ${WATERMARK_REMOVAL_PRICE} টাকা "সেন্ড মানি" করুন। তারপর ট্রানজেকশন আইডি (TxnID) এখানে জমা দিন।`,
    },
  });
});

// POST /api/payments/submit – User submits payment transaction ID
router.post('/submit', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const { gateway, gatewayTxnId, phoneNumber } = req.body;

    if (!gateway || !['bkash', 'nagad'].includes(gateway)) {
      return res.status(400).json({ error: 'অবৈধ পেমেন্ট গেটওয়ে। বিকাশ অথবা নগদ নির্বাচন করুন।' });
    }
    if (!gatewayTxnId || gatewayTxnId.trim().length < 5) {
      return res.status(400).json({ error: 'সঠিক ট্রানজেকশন আইডি দিন (কমপক্ষে ৫ অক্ষর)।' });
    }
    if (!phoneNumber || phoneNumber.trim().length < 11) {
      return res.status(400).json({ error: 'সঠিক মোবাইল নম্বর দিন (১১ ডিজিট)।' });
    }

    // Check for duplicate TxnID
    const existing = await Payment.findOne({ gatewayTxnId: gatewayTxnId.trim() });
    if (existing) {
      return res.status(409).json({ error: 'এই ট্রানজেকশন আইডি আগেই ব্যবহৃত হয়েছে।' });
    }

    const payment = new Payment({
      userId,
      amount: WATERMARK_REMOVAL_PRICE,
      currency: 'BDT',
      gateway,
      gatewayTxnId: gatewayTxnId.trim(),
      phoneNumber: phoneNumber.trim(),
      status: 'verified', // Auto-verify for now (in production, set to 'pending' and verify via bKash/Nagad API callback)
      purpose: 'watermark_removal',
      verifiedAt: new Date(),
    });

    await payment.save();

    res.status(201).json({
      paymentId: payment._id,
      status: payment.status,
      message: 'পেমেন্ট সফলভাবে যাচাই হয়েছে! এখন ওয়াটারমার্ক ছাড়া পোস্টার তৈরি করুন।',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/payments/check – Check if the user has a valid watermark-removal payment
router.get('/check', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;

    const validPayment = await Payment.findOne({
      userId,
      purpose: 'watermark_removal',
      status: 'verified',
    }).sort({ verifiedAt: -1 });

    res.json({
      hasPaid: !!validPayment,
      paymentId: validPayment?._id || null,
      gateway: validPayment?.gateway || null,
      paidAt: validPayment?.verifiedAt || null,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/payments/history – User's payment history
router.get('/history', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 }).limit(20);
    res.json(payments);
  } catch (err) {
    next(err);
  }
});

export default router;
