import express, { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { hashPassword, comparePassword } from '../services/authService';
import { signToken } from '../services/jwtService';

const router = express.Router();

// Register a new user
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

    const orConditions: any[] = [];
    if (email && email.trim()) orConditions.push({ email: email.trim().toLowerCase() });
    if (phone && phone.trim()) orConditions.push({ phone: phone.trim() });

    if (orConditions.length > 0) {
      const existing = await User.findOne({ $or: orConditions });
      if (existing) {
        return res.status(409).json({ error: 'User with given email or phone already exists' });
      }
    }

    const passwordHash = await hashPassword(password);
    const user = new User({
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      phone: phone ? phone.trim() : undefined,
      passwordHash,
    } as Partial<IUser>);
    await user.save();

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// Login existing user
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone, password } = req.body;
    if (!password || (!email && !phone)) {
      return res.status(400).json({ error: 'Password and either email or phone are required' });
    }

    const filter: any = {};
    if (email && email.trim()) filter.email = email.trim().toLowerCase();
    else if (phone && phone.trim()) filter.phone = phone.trim();

    const user = await User.findOne(filter);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const match = await comparePassword(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
