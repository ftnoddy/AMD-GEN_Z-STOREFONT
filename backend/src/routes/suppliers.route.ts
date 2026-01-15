import { Router } from 'express';
import SuppliersController from '@/controllers/suppliers.controller';
import { Routes } from '@interfaces/routes.interface';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { tenantMiddleware } from '@/middlewares/tenant.middleware';

class SuppliersRoute implements Routes {
  public path = '/api/inventory/suppliers';
  public router = Router();
  public suppliersController = new SuppliersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, tenantMiddleware, this.suppliersController.getSuppliers);
    this.router.get(`${this.path}/:id`, authMiddleware, tenantMiddleware, this.suppliersController.getSupplierById);
    this.router.post(`${this.path}`, authMiddleware, tenantMiddleware, this.suppliersController.createSupplier);
    this.router.put(`${this.path}/:id`, authMiddleware, tenantMiddleware, this.suppliersController.updateSupplier);
    this.router.delete(`${this.path}/:id`, authMiddleware, tenantMiddleware, this.suppliersController.deleteSupplier);
  }
}

export default SuppliersRoute;

