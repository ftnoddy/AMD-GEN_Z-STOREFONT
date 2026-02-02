import { Response, NextFunction } from 'express';
import CustomerAuthService from '@/services/customer-auth.service';

const customerAuthService = new CustomerAuthService();

export interface CustomerAuthRequest {
  customerId?: string;
  tenantId?: string;
  customer?: { id: string; email: string; name: string };
}

/**
 * Verifies customer JWT and attaches customerId + tenantId to the request.
 * Use only on routes that require a logged-in customer (e.g. My Orders).
 * Rejects admin tokens (checks userType === 'customer').
 */
export const customerAuthMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.',
      });
      return;
    }

    const token = authHeader.substring(7);
    const verification = customerAuthService.verifyCustomerToken(token);

    if (!verification.isValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.',
      });
      return;
    }

    const payload = verification.payload;
    req.customerId = payload.customerId;
    req.tenantId = payload.tenantId;
    req.customer = {
      id: payload.customerId,
      email: payload.email,
      name: payload.name,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token validation failed.',
    });
  }
};

/**
 * Optional customer auth: if Bearer token present and valid (customer), attach req.customerId/req.customer; else leave undefined.
 * Use for routes that work for both guest and logged-in customer (e.g. place order).
 */
export const optionalCustomerAuthMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.customerId = undefined;
      req.customer = undefined;
      return next();
    }
    const token = authHeader.substring(7);
    const verification = customerAuthService.verifyCustomerToken(token);
    if (!verification.isValid || !verification.payload) {
      req.customerId = undefined;
      req.customer = undefined;
      return next();
    }
    const payload = verification.payload;
    req.customerId = payload.customerId;
    req.tenantId = payload.tenantId;
    req.customer = {
      id: payload.customerId,
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch (error) {
    next(error);
  }
};
