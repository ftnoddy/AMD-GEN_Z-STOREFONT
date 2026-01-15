import { Request, Response, NextFunction } from 'express';
import LoginService from '@/services/login.service';

const loginService = new LoginService();

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const verification = loginService.verifyToken(token);

    if (!verification.isValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
      return;
    }

    // Attach user information to request
    req.user = {
      _id: (verification.payload as any)._id,
      email: (verification.payload as any).email,
      firstName: (verification.payload as any).firstName,
      lastName: (verification.payload as any).lastName,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token validation failed.',
    });
  }
};
