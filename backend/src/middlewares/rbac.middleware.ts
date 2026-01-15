import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import InventoryUserModel, { UserRole } from '@/models/inventory-user.model';
import { HttpException } from '@/exceptions/HttpException';

/**
 * Role-Based Access Control Middleware
 * Restricts access based on user roles: Owner, Manager, Staff
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const user = await InventoryUserModel.findById(req.user._id).select('role');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        });
        return;
      }

      // Attach user role to request for use in controllers
      (req as any).userRole = user.role;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking user role',
      });
    }
  };
};

/**
 * Permission-based middleware helpers
 */
export const requireOwnerOrManager = requireRole('Owner', 'Manager');
export const requireOwner = requireRole('Owner');

