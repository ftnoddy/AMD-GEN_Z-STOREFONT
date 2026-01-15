import { NextFunction, Response } from 'express';
import { TenantRequest } from '@/middlewares/tenant.middleware';
import DashboardService from '@/services/dashboard.service';

class DashboardController {
  public dashboardService = new DashboardService();

  public getDashboardStats = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.dashboardService.getDashboardStats(req.tenantId!);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };
}

export default DashboardController;

