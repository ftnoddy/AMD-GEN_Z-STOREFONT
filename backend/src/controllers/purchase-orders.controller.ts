import { NextFunction, Response } from 'express';
import { TenantRequest } from '@/middlewares/tenant.middleware';
import PurchaseOrderService from '@/services/purchase-orders.service';
import { HttpException } from '@/exceptions/HttpException';

class PurchaseOrdersController {
  public purchaseOrderService = new PurchaseOrderService();

  public getPurchaseOrders = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const purchaseOrders = await this.purchaseOrderService.getPurchaseOrders(req.tenantId!, req.query);
      res.status(200).json({ success: true, data: purchaseOrders });
    } catch (error) {
      next(error);
    }
  };

  public getPurchaseOrderById = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const purchaseOrder = await this.purchaseOrderService.getPurchaseOrderById(req.tenantId!, req.params.id);
      res.status(200).json({ success: true, data: purchaseOrder });
    } catch (error) {
      next(error);
    }
  };

  public createPurchaseOrder = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const purchaseOrder = await this.purchaseOrderService.createPurchaseOrder(
        req.tenantId!,
        req.user!._id,
        req.body,
      );
      res.status(201).json({ success: true, data: purchaseOrder, message: 'Purchase order created successfully' });
    } catch (error) {
      next(error);
    }
  };

  public updatePurchaseOrder = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const purchaseOrder = await this.purchaseOrderService.updatePurchaseOrder(
        req.tenantId!,
        req.params.id,
        req.body,
      );
      res.status(200).json({ success: true, data: purchaseOrder, message: 'Purchase order updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  public updatePurchaseOrderStatus = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.body;
      if (!status) {
        throw new HttpException(400, 'Status is required');
      }

      const purchaseOrder = await this.purchaseOrderService.updatePurchaseOrderStatus(
        req.tenantId!,
        req.params.id,
        status,
        req.user!._id,
      );
      res.status(200).json({ success: true, data: purchaseOrder, message: 'Purchase order status updated' });
    } catch (error) {
      next(error);
    }
  };

  public receivePurchaseOrder = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const purchaseOrder = await this.purchaseOrderService.receivePurchaseOrder(
        req.tenantId!,
        req.params.id,
        req.body,
        req.user!._id,
      );
      res.status(200).json({ success: true, data: purchaseOrder, message: 'Purchase order received successfully' });
    } catch (error) {
      next(error);
    }
  };

  public cancelPurchaseOrder = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const purchaseOrder = await this.purchaseOrderService.cancelPurchaseOrder(req.tenantId!, req.params.id);
      res.status(200).json({ success: true, data: purchaseOrder, message: 'Purchase order cancelled successfully' });
    } catch (error) {
      next(error);
    }
  };

  public deletePurchaseOrder = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.purchaseOrderService.deletePurchaseOrder(req.tenantId!, req.params.id);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  };
}

export default PurchaseOrdersController;

