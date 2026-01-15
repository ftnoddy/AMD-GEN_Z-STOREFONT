import { Router } from 'express';
import PurchaseOrdersController from '@/controllers/purchase-orders.controller';
import { Routes } from '@interfaces/routes.interface';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { tenantMiddleware } from '@/middlewares/tenant.middleware';

class PurchaseOrdersRoute implements Routes {
  public path = '/api/inventory/purchase-orders';
  public router = Router();
  public purchaseOrdersController = new PurchaseOrdersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      authMiddleware,
      tenantMiddleware,
      this.purchaseOrdersController.getPurchaseOrders,
    );
    this.router.get(
      `${this.path}/:id`,
      authMiddleware,
      tenantMiddleware,
      this.purchaseOrdersController.getPurchaseOrderById,
    );
    this.router.post(
      `${this.path}`,
      authMiddleware,
      tenantMiddleware,
      this.purchaseOrdersController.createPurchaseOrder,
    );
    this.router.put(
      `${this.path}/:id`,
      authMiddleware,
      tenantMiddleware,
      this.purchaseOrdersController.updatePurchaseOrder,
    );
    this.router.patch(
      `${this.path}/:id/status`,
      authMiddleware,
      tenantMiddleware,
      this.purchaseOrdersController.updatePurchaseOrderStatus,
    );
    this.router.post(
      `${this.path}/:id/receive`,
      authMiddleware,
      tenantMiddleware,
      this.purchaseOrdersController.receivePurchaseOrder,
    );
    this.router.post(
      `${this.path}/:id/cancel`,
      authMiddleware,
      tenantMiddleware,
      this.purchaseOrdersController.cancelPurchaseOrder,
    );
    this.router.delete(
      `${this.path}/:id`,
      authMiddleware,
      tenantMiddleware,
      this.purchaseOrdersController.deletePurchaseOrder,
    );
  }
}

export default PurchaseOrdersRoute;

