import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'; // fallback for dev
const JWT_EXPIRES_IN = '7d';

export function signToken(user: IUser): string {
  const payload = {
    sub: user._id,
    role: user.role,
  } as const;
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { sub: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string; role: string };
  } catch (err) {
    return null;
  }
}
