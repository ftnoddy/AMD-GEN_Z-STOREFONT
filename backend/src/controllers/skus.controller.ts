import { NextFunction, Response } from 'express';
import { TenantRequest } from '@/middlewares/tenant.middleware';
import SKUService from '@/services/skus.service';

class SKUsController {
  private skuService = new SKUService();

  // Get all SKUs for tenant
  public getSKUs = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const skus = await this.skuService.getSKUs(req.tenantId!, req.query);

      res.status(200).json({
        success: true,
        data: skus,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get SKU by ID
  public getSKUById = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sku = await this.skuService.getSKUById(req.tenantId!, req.params.id);

      res.status(200).json({
        success: true,
        data: sku,
      });
    } catch (error) {
      next(error);
    }
  };

  // Create SKU
  public createSKU = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sku = await this.skuService.createSKU(req.tenantId!, req.body);

      res.status(201).json({
        success: true,
        data: sku,
        message: 'SKU created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Update SKU (non-stock fields)
  public updateSKU = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sku = await this.skuService.updateSKU(req.tenantId!, req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: sku,
        message: 'SKU updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Adjust stock
  public adjustStock = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updatedSKU = await this.skuService.adjustStock({
        tenantId: req.tenantId!,
        skuId: req.params.id,
        quantity: req.body.quantity,
        type: req.body.type,
        note: req.body.note,
        userId: req.user!._id,
      });

      res.status(200).json({
        success: true,
        data: updatedSKU,
        message: 'Stock adjusted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Bulk create SKUs (for variant products)
  public bulkCreateSKUs = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createdSKUs = await this.skuService.bulkCreateSKUs(req.tenantId!, req.body.skus);

      res.status(201).json({
        success: true,
        data: createdSKUs,
        message: `${createdSKUs.length} SKUs created successfully`,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default SKUsController;

