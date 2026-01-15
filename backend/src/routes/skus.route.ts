import { Router } from 'express';
import SKUsController from '@/controllers/skus.controller';
import { Routes } from '@interfaces/routes.interface';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { tenantMiddleware } from '@/middlewares/tenant.middleware';

class SKUsRoute implements Routes {
  public path = '/api/inventory/skus';
  public router = Router();
  public skusController = new SKUsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, tenantMiddleware, this.skusController.getSKUs);
    this.router.get(`${this.path}/:id`, authMiddleware, tenantMiddleware, this.skusController.getSKUById);
    this.router.post(`${this.path}`, authMiddleware, tenantMiddleware, this.skusController.createSKU);
    this.router.post(`${this.path}/bulk`, authMiddleware, tenantMiddleware, this.skusController.bulkCreateSKUs);
    this.router.put(`${this.path}/:id`, authMiddleware, tenantMiddleware, this.skusController.updateSKU);
    this.router.post(`${this.path}/:id/adjust-stock`, authMiddleware, tenantMiddleware, this.skusController.adjustStock);
  }
}

export default SKUsRoute;

