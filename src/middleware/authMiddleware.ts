import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AdminModel } from '../models/Admin';

export const adminAuthGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role?: string;
    };

    // Check the role directly from the token
    if (!decoded.role || decoded.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
      return;
    }

    // Set user info from token without database lookup
    (req as any).user = {
      _id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (err) {
    res.status(403).json({ message: 'Forbidden: Invalid token' });
    return;
  }
};
