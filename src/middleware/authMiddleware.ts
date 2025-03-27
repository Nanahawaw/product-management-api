import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  admin?: { id: string };
}

export const adminAuthGuard = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
      return res
        .status(403)
        .json({ message: 'Access denied. No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    req.admin = decoded; // Attach admin info to the request object
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
