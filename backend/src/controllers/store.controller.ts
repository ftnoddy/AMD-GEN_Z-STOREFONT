import { NextFunction, Request, Response } from 'express';
import StoreService from '@/services/store.service';

class StoreController {
  private storeService = new StoreService();

  /** GET /api/public/store/:subdomain – store info */
  public getStoreBySubdomain = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.storeService.getStoreBySubdomain(req.params.subdomain);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/public/store/:subdomain/products – list products */
  public getStoreProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.storeService.getStoreProducts(req.params.subdomain, req.query as any);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/public/store/:subdomain/products/:productId – product + SKUs */
  public getStoreProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.storeService.getStoreProductBySubdomain(
        req.params.subdomain,
        req.params.productId
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}

export default StoreController;
