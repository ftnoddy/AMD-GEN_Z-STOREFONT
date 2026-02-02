import { Router } from 'express';
import StoreController from '@/controllers/store.controller';
import CustomerAuthController from '@/controllers/customer-auth.controller';
import * as StoreOrdersController from '@/controllers/store-orders.controller';
import { customerAuthMiddleware, optionalCustomerAuthMiddleware } from '@/middlewares/customer-auth.middleware';
import { Routes } from '@interfaces/routes.interface';

/**
 * Public store routes for the user-facing app.
 * Store/catalog: no auth. Auth: register/login. Orders: place (guest/customer), My Orders (customer only).
 */
class StoreRoute implements Routes {
  public path = '/api/public/store';
  public router = Router();
  public storeController = new StoreController();
  public customerAuthController = new CustomerAuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // More specific routes first
    this.router.get(
      `${this.path}/:subdomain/products/:productId`,
      this.storeController.getStoreProductById
    );
    this.router.get(`${this.path}/:subdomain/products`, this.storeController.getStoreProducts);
    this.router.post(`${this.path}/:subdomain/auth/register`, this.customerAuthController.register);
    this.router.post(`${this.path}/:subdomain/auth/login`, this.customerAuthController.login);
    // Store orders: place (optional auth), My Orders (customer auth required)
    this.router.get(
      `${this.path}/:subdomain/orders/:orderId`,
      customerAuthMiddleware,
      StoreOrdersController.getMyOrderById
    );
    this.router.get(
      `${this.path}/:subdomain/orders`,
      customerAuthMiddleware,
      StoreOrdersController.getMyOrders
    );
    this.router.post(
      `${this.path}/:subdomain/orders`,
      optionalCustomerAuthMiddleware,
      StoreOrdersController.placeOrder
    );
    this.router.get(`${this.path}/:subdomain`, this.storeController.getStoreBySubdomain);
  }
}

export default StoreRoute;
