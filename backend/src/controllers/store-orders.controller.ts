import { Request, Response, NextFunction } from 'express';
import StoreOrdersService from '@/services/store-orders.service';
import { CustomerAuthRequest } from '@/middlewares/customer-auth.middleware';

const storeOrdersService = new StoreOrdersService();

/** POST /api/public/store/:subdomain/orders – place order (guest or customer). Use optionalCustomerAuthMiddleware before this. */
export const placeOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subdomain = req.params.subdomain;
    const customer = (req as any).customer;
    const order = await storeOrdersService.placeOrder(subdomain, req.body, customer);
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/public/store/:subdomain/orders – My Orders (requires customer auth). */
export const getMyOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subdomain = req.params.subdomain;
    const customerId = (req as CustomerAuthRequest).customerId!;
    const orders = await storeOrdersService.getMyOrders(subdomain, customerId);
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/public/store/:subdomain/orders/:orderId – single order (requires customer auth). */
export const getMyOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subdomain = req.params.subdomain;
    const customerId = (req as CustomerAuthRequest).customerId!;
    const orderId = req.params.orderId;
    const order = await storeOrdersService.getMyOrderById(subdomain, customerId, orderId);
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
