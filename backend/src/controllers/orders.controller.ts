import { NextFunction, Response } from 'express';
import { TenantRequest } from '@/middlewares/tenant.middleware';
import OrderService from '@/services/orders.service';

class OrdersController {
  private orderService = new OrderService();

  // Get all orders
  public getOrders = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orders = await this.orderService.getOrders(req.tenantId!, req.query);

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get order by ID
  public getOrderById = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.orderService.getOrderById(req.tenantId!, req.params.id);

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  // Create order with concurrent stock checking
  public createOrder = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.orderService.createOrder({
        tenantId: req.tenantId!,
        userId: req.user!._id,
        body: req.body,
      });

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Fulfill order
  public fulfillOrder = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.orderService.fulfillOrder(req.tenantId!, req.params.id);

      res.status(200).json({
        success: true,
        data: order,
        message: 'Order fulfilled successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Cancel order (restore stock)
  public cancelOrder = async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.orderService.cancelOrder({
        tenantId: req.tenantId!,
        userId: req.user!._id,
        id: req.params.id,
        reason: req.body.reason,
      });

      res.status(200).json({
        success: true,
        data: order,
        message: 'Order cancelled and stock restored',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default OrdersController;

