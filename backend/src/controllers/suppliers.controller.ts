import { NextFunction, Response } from 'express';
import { TenantRequest } from '@/middlewares/tenant.middleware';
import SupplierService from '@/services/suppliers.service';
import { HttpException } from '@/exceptions/HttpException';

class SuppliersController {
  public supplierService = new SupplierService();

  public getSuppliers = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const suppliers = await this.supplierService.getSuppliers(req.tenantId!, req.query);
      res.status(200).json({ success: true, data: suppliers });
    } catch (error) {
      next(error);
    }
  };

  public getSupplierById = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supplier = await this.supplierService.getSupplierById(req.tenantId!, req.params.id);
      res.status(200).json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  };

  public createSupplier = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supplier = await this.supplierService.createSupplier(req.tenantId!, req.body);
      res.status(201).json({ success: true, data: supplier, message: 'Supplier created successfully' });
    } catch (error) {
      next(error);
    }
  };

  public updateSupplier = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const supplier = await this.supplierService.updateSupplier(req.tenantId!, req.params.id, req.body);
      res.status(200).json({ success: true, data: supplier, message: 'Supplier updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  public deleteSupplier = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.supplierService.deleteSupplier(req.tenantId!, req.params.id);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  };
}

export default SuppliersController;

