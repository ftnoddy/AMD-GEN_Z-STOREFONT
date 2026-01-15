import { Router } from 'express';
import StockMovementsController from '@/controllers/stock-movements.controller';
import { Routes } from '@interfaces/routes.interface';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { tenantMiddleware } from '@/middlewares/tenant.middleware';

class StockMovementsRoute implements Routes {
  public path = '/api/inventory/stock-movements';
  public router = Router();
  public stockMovementsController = new StockMovementsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, tenantMiddleware, this.stockMovementsController.getStockMovements);
    this.router.get(
      `${this.path}/:id`,
      authMiddleware,
      tenantMiddleware,
      this.stockMovementsController.getStockMovementById,
    );
    this.router.get(
      `${this.path}/sku/:skuId`,
      authMiddleware,
      tenantMiddleware,
      this.stockMovementsController.getStockMovementsBySKU,
    );
    this.router.get(
      `${this.path}/product/:productId`,
      authMiddleware,
      tenantMiddleware,
      this.stockMovementsController.getStockMovementsByProduct,
    );
  }
}

export default StockMovementsRoute;

