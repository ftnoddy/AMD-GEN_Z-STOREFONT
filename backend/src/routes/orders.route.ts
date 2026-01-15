import { Router } from 'express';
import OrdersController from '@/controllers/orders.controller';
import { Routes } from '@interfaces/routes.interface';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { tenantMiddleware } from '@/middlewares/tenant.middleware';

class OrdersRoute implements Routes {
  public path = '/api/inventory/orders';
  public router = Router();
  public ordersController = new OrdersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, tenantMiddleware, this.ordersController.getOrders);
    this.router.get(`${this.path}/:id`, authMiddleware, tenantMiddleware, this.ordersController.getOrderById);
    this.router.post(`${this.path}`, authMiddleware, tenantMiddleware, this.ordersController.createOrder);
    this.router.post(`${this.path}/:id/fulfill`, authMiddleware, tenantMiddleware, this.ordersController.fulfillOrder);
    this.router.post(`${this.path}/:id/cancel`, authMiddleware, tenantMiddleware, this.ordersController.cancelOrder);
  }
}

export default OrdersRoute;

