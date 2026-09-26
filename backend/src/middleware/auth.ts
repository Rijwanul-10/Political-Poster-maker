import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/jwtService';
import { IUser } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  // Attach minimal user info to request (id & role). Full user can be fetched later if needed.
  req.user = { _id: payload.sub, role: payload.role } as any;
  next();
}
