import { Router } from 'express';
import DashboardController from '@/controllers/dashboard.controller';
import { Routes } from '@interfaces/routes.interface';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { tenantMiddleware } from '@/middlewares/tenant.middleware';

class DashboardRoute implements Routes {
  public path = '/api/inventory/dashboard';
  public router = Router();
  public dashboardController = new DashboardController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, tenantMiddleware, this.dashboardController.getDashboardStats);
  }
}

export default DashboardRoute;

