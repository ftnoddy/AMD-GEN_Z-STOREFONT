import { NextFunction, Response } from 'express';
import { TenantRequest } from '@/middlewares/tenant.middleware';
import StockMovementService from '@/services/stock-movements.service';
import { HttpException } from '@/exceptions/HttpException';

class StockMovementsController {
  public stockMovementService = new StockMovementService();

  public getStockMovements = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.stockMovementService.getStockMovements(req.tenantId!, req.query);
      res.status(200).json({ success: true, data: result.movements, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  };

  public getStockMovementById = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const movement = await this.stockMovementService.getStockMovementById(req.tenantId!, req.params.id);
      res.status(200).json({ success: true, data: movement });
    } catch (error) {
      next(error);
    }
  };

  public getStockMovementsBySKU = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const movements = await this.stockMovementService.getStockMovementsBySKU(
        req.tenantId!,
        req.params.skuId,
        req.query.limit as any,
      );
      res.status(200).json({ success: true, data: movements });
    } catch (error) {
      next(error);
    }
  };

  public getStockMovementsByProduct = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const movements = await this.stockMovementService.getStockMovementsByProduct(
        req.tenantId!,
        req.params.productId,
        req.query.limit as any,
      );
      res.status(200).json({ success: true, data: movements });
    } catch (error) {
      next(error);
    }
  };
}

export default StockMovementsController;

