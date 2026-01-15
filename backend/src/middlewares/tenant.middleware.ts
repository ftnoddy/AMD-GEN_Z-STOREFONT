import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import InventoryUserModel from '@/models/inventory-user.model';
import TenantModel from '@/models/tenant.model';

export interface TenantRequest extends AuthenticatedRequest {
  tenantId?: string;
  tenant?: any;
}

/**
 * Multi-tenant middleware
 * Extracts tenantId from JWT token or subdomain
 * Ensures all subsequent queries are scoped to the tenant
 */
export const tenantMiddleware = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Option 1: Get tenantId from authenticated user
    if (req.user) {
      const user = await InventoryUserModel.findById(req.user._id).select('tenantId');
      if (user && user.tenantId) {
        req.tenantId = user.tenantId.toString();
        
        // Optionally load tenant details
        const tenant = await TenantModel.findById(user.tenantId);
        if (tenant) {
          req.tenant = tenant;
        }
      }
    }

    // Option 2: Get tenant from subdomain (for public routes)
    if (!req.tenantId && req.headers.host) {
      const subdomain = req.headers.host.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        const tenant = await TenantModel.findOne({ subdomain });
        if (tenant) {
          req.tenantId = tenant._id.toString();
          req.tenant = tenant;
        }
      }
    }

    // Option 3: Get tenant from query parameter (for testing)
    if (!req.tenantId && req.query.tenantId) {
      req.tenantId = req.query.tenantId as string;
    }

    if (!req.tenantId) {
      res.status(400).json({
        success: false,
        message: 'Tenant not identified. Please provide tenant information.',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error identifying tenant',
    });
  }
};

/**
 * Helper function to add tenant filter to queries
 */
export const addTenantFilter = (tenantId: string, query: any = {}) => {
  return {
    ...query,
    tenantId,
  };
};

