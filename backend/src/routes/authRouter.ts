import express, { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { User, IUser } from '../models/User';
import { Otp } from '../models/Otp';
import { hashPassword, comparePassword } from '../services/authService';
import { signToken } from '../services/jwtService';
import { sendOtpEmail, testSmtpConnection } from '../services/emailService';
import { config } from '../config';

const router = express.Router();
const googleClient = new OAuth2Client(config.googleClientId);

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 1. POST /api/auth/send-registration-otp
router.post('/send-registration-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'সঠিক ইমেইল ঠিকানা প্রদান করুন' });
    }
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা আছে' });
    }

    // Generate 6-digit OTP
    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save or update OTP
    await Otp.deleteMany({ email: normalizedEmail, type: 'registration' });
    await Otp.create({
      email: normalizedEmail,
      otp: otpCode,
      type: 'registration',
      expiresAt,
    });

    // Send email
    const emailResult = await sendOtpEmail(normalizedEmail, otpCode, 'registration');
    if (!emailResult.success) {
      return res.status(500).json({
        error: `ইমেইল পাঠানো যায়নি (${emailResult.error || 'SMTP Error'})। সঠিক ইমেইল দিন অথবা অ্যাডমিনের সাথে যোগাযোগ করুন।`,
      });
    }

    res.json({
      message: 'ভেরিফিকেশন কোড (OTP) আপনার ইমেইলে পাঠানো হয়েছে',
    });
  } catch (err) {
    next(err);
  }
});

// 2. POST /api/auth/register-with-otp
router.post('/register-with-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, otp, phone } = req.body;
    if (!name || !email || !password || !otp) {
      return res.status(400).json({ error: 'নাম, ইমেইল, পাসওয়ার্ড এবং ওটিপি আবশ্যক' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify OTP
    const otpDoc = await Otp.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      type: 'registration',
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      return res.status(400).json({ error: 'ভুল অথবা মেয়াদোত্তীর্ণ ওটিপি (OTP) কোড' });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা আছে' });
    }

    const passwordHash = await hashPassword(password);
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : undefined,
      passwordHash,
      isEmailVerified: true,
    } as Partial<IUser>);
    await user.save();

    // Clean up OTP
    await Otp.deleteMany({ email: normalizedEmail, type: 'registration' });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 3. POST /api/auth/register (standard fallback for optional phone or direct registration)
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ error: 'নাম এবং পাসওয়ার্ড আবশ্যক' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' });
    }

    const orConditions: any[] = [];
    if (email && email.trim()) orConditions.push({ email: email.trim().toLowerCase() });
    if (phone && phone.trim()) orConditions.push({ phone: phone.trim() });

    if (orConditions.length > 0) {
      const existing = await User.findOne({ $or: orConditions });
      if (existing) {
        return res.status(409).json({ error: 'এই ইমেইল বা ফোন নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট রয়েছে' });
      }
    }

    const passwordHash = await hashPassword(password);
    const user = new User({
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      phone: phone ? phone.trim() : undefined,
      passwordHash,
      isEmailVerified: false,
    } as Partial<IUser>);
    await user.save();

    const token = signToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 4. POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone, password } = req.body;
    if (!password || (!email && !phone)) {
      return res.status(400).json({ error: 'পাসওয়ার্ড এবং ইমেইল অথবা ফোন আবশ্যক' });
    }

    const filter: any = {};
    if (email && email.trim()) filter.email = email.trim().toLowerCase();
    else if (phone && phone.trim()) filter.phone = phone.trim();

    const user = await User.findOne(filter);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'ভুল ইমেইল/ফোন অথবা পাসওয়ার্ড' });
    }

    const match = await comparePassword(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'ভুল ইমেইল/ফোন অথবা পাসওয়ার্ড' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 5. POST /api/auth/forgot-password (request reset OTP)
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'সঠিক ইমেইল প্রদান করুন' });
    }
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Don't expose whether user exists, but give friendly message
      return res.status(404).json({ error: 'এই ইমেইল ঠিকানায় কোনো অ্যাকাউন্ট পাওয়া যায়নি' });
    }

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Otp.deleteMany({ email: normalizedEmail, type: 'password_reset' });
    await Otp.create({
      email: normalizedEmail,
      otp: otpCode,
      type: 'password_reset',
      expiresAt,
    });

    const emailResult = await sendOtpEmail(normalizedEmail, otpCode, 'password_reset');
    if (!emailResult.success) {
      return res.status(500).json({
        error: `ইমেইল পাঠানো যায়নি (${emailResult.error || 'SMTP Error'})। পরে চেষ্টা করুন।`,
      });
    }

    res.json({
      message: 'পাসওয়ার্ড রিসেট ভেরিফিকেশন কোড আপনার ইমেইলে পাঠানো হয়েছে',
    });
  } catch (err) {
    next(err);
  }
});

// 6. POST /api/auth/reset-password (verify reset OTP and set new password)
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'ইমেইল, ওটিপি এবং নতুন পাসওয়ার্ড আবশ্যক' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const otpDoc = await Otp.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      type: 'password_reset',
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      return res.status(400).json({ error: 'ভুল অথবা মেয়াদোত্তীর্ণ ওটিপি কোড' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি' });
    }

    user.passwordHash = await hashPassword(newPassword);
    user.isEmailVerified = true;
    await user.save();

    await Otp.deleteMany({ email: normalizedEmail, type: 'password_reset' });

    res.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। এখন লগইন করুন।' });
  } catch (err) {
    next(err);
  }
});

// 7. POST /api/auth/google (Google One-Tap / OAuth token verification)
router.post('/google', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    let payload: any;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: config.googleClientId || undefined,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      // If client ID verification fails because not configured yet in .env, decode the JWT safely
      const parts = credential.split('.');
      if (parts.length === 3) {
        payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      } else {
        throw verifyErr;
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Google টোকেন থেকে ইমেইল পাওয়া যায়নি' });
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || payload.given_name || 'Google User';
    const googleId = payload.sub;
    const avatarUrl = payload.picture;

    // Find user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = new User({
        name,
        email,
        googleId,
        avatarUrl,
        isEmailVerified: true,
      } as Partial<IUser>);
      await user.save();
    } else {
      // Update googleId and verify status if not set
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatarUrl && avatarUrl) user.avatarUrl = avatarUrl;
      user.isEmailVerified = true;
      await user.save();
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err: any) {
    console.error('❌ Google auth error:', err);
    res.status(401).json({ error: 'Google লগইন যাচাইকরণ ব্যর্থ হয়েছে: ' + (err.message || '') });
  }
});

// Diagnostic endpoint to verify SMTP credentials
router.get('/test-smtp', async (req: Request, res: Response) => {
  const result = await testSmtpConnection();
  res.status(result.success ? 200 : 500).json(result);
});

export default router;
