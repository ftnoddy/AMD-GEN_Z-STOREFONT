import { Router } from 'express';
import ProductsController from '@/controllers/products.controller';
import { Routes } from '@interfaces/routes.interface';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { tenantMiddleware } from '@/middlewares/tenant.middleware';

class ProductsRoute implements Routes {
  public path = '/api/inventory/products';
  public router = Router();
  public productsController = new ProductsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, tenantMiddleware, this.productsController.getProducts);
    this.router.get(`${this.path}/:id`, authMiddleware, tenantMiddleware, this.productsController.getProductById);
    this.router.get(`${this.path}/:id/skus`, authMiddleware, tenantMiddleware, this.productsController.getProductWithSKUs);
    this.router.post(`${this.path}`, authMiddleware, tenantMiddleware, this.productsController.createProduct);
    this.router.put(`${this.path}/:id`, authMiddleware, tenantMiddleware, this.productsController.updateProduct);
    this.router.delete(`${this.path}/:id`, authMiddleware, tenantMiddleware, this.productsController.deleteProduct);
  }
}

export default ProductsRoute;

