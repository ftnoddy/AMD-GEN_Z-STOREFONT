import mongoose from 'mongoose';
import OrderModel from '@/models/order.model';
import SKUModel from '@/models/sku.model';
import StockMovementModel from '@/models/stock-movement.model';
import { HttpException } from '@/exceptions/HttpException';
import { addTenantFilter } from '@/middlewares/tenant.middleware';

class OrderService {
  public orders = OrderModel;
  public skus = SKUModel;
  public stockMovements = StockMovementModel;

  public async getOrders(tenantId: string, queryParams: any) {
    const { status, search, dateFrom, dateTo } = queryParams;
    const query: any = addTenantFilter(tenantId);

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
      ];
    }
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) query.createdAt.$lte = new Date(dateTo as string);
    }

    return this.orders
      .find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
  }

  public async getOrderById(tenantId: string, id: string) {
    const order = await this.orders
      .findOne({ _id: id, tenantId })
      .populate('createdBy', 'name email');

    if (!order) throw new HttpException(404, 'Order not found');
    return order;
  }

  public async createOrder(params: {
    tenantId: string;
    userId: string;
    body: { items: any[]; customerName?: string; customerEmail?: string; customerPhone?: string; notes?: string };
  }) {
    const { tenantId, userId, body } = params;
    const { items, customerName, customerEmail, customerPhone, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new HttpException(400, 'Order items are required');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const stockChecks = await Promise.all(
        items.map(async (item: any) => {
          const sku = await this.skus.findOne({ _id: item.skuId, tenantId }).session(session);
          if (!sku) throw new HttpException(404, `SKU ${item.skuId} not found`);
          if (sku.stock < item.quantity) {
            throw new HttpException(
              400,
              `Insufficient stock for SKU ${sku.sku}. Available: ${sku.stock}, Requested: ${item.quantity}`,
            );
          }
          return { sku, item };
        }),
      );

      const orderCount = await this.orders.countDocuments({ tenantId }).session(session);
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(6, '0')}`;

      let subtotal = 0;
      const orderItems = stockChecks.map(({ sku, item }) => {
        const lineTotal = sku.price * item.quantity;
        subtotal += lineTotal;
        return {
          skuId: sku._id,
          productName: (sku as any).productId?.name || 'Unknown',
          sku: sku.sku,
          variantInfo: sku.variantCombination
            ? Object.entries(sku.variantCombination)
                .map(([, value]) => value)
                .join(' / ')
            : undefined,
          quantity: item.quantity,
          fulfilledQuantity: 0,
          price: sku.price,
          lineTotal,
        };
      });

      const tax = subtotal * 0.1;
      const totalAmount = subtotal + tax;

      const order = new this.orders({
        tenantId,
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        status: 'Pending',
        items: orderItems,
        subtotal,
        tax,
        totalAmount,
        notes,
        createdBy: userId,
      });

      await order.save({ session });

      for (const { sku, item } of stockChecks) {
        const balanceBefore = sku.stock;
        const balanceAfter = balanceBefore - item.quantity;

        const updateResult = await this.skus.updateOne(
          { _id: sku._id, version: sku.version },
          {
            $set: { stock: balanceAfter },
            $inc: { version: 1 },
          },
        ).session(session);

        if (updateResult.modifiedCount === 0) {
          await session.abortTransaction();
          throw new HttpException(
            409,
            `Concurrent modification detected for SKU ${sku.sku}. Please try again.`,
          );
        }

        await this.stockMovements.create(
          [{
            tenantId,
            skuId: sku._id,
            productId: sku.productId,
            type: 'sale',
            quantity: -item.quantity,
            balanceBefore,
            balanceAfter,
            reference: order._id.toString(),
            referenceType: 'order',
            userId,
            timestamp: new Date(),
          }],
          { session },
        );
      }

      await session.commitTransaction();
      session.endSession();

      return this.orders.findById(order._id).populate('createdBy', 'name email');
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  public async fulfillOrder(tenantId: string, id: string) {
    const order = await this.orders.findOneAndUpdate(
      { _id: id, tenantId, status: 'Pending' },
      { status: 'Fulfilled', fulfilledAt: new Date() },
      { new: true },
    );
    if (!order) throw new HttpException(404, 'Order not found or already fulfilled');
    return order;
  }

  public async cancelOrder(params: { tenantId: string; userId: string; id: string; reason?: string }) {
    const { tenantId, userId, id, reason } = params;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await this.orders.findOne({ _id: id, tenantId }).session(session);
      if (!order) throw new HttpException(404, 'Order not found');
      if (order.status === 'Cancelled') throw new HttpException(400, 'Order is already cancelled');

      for (const item of order.items) {
        const sku = await this.skus.findById(item.skuId).session(session);
        if (!sku) continue;

        const balanceBefore = sku.stock;
        const balanceAfter = balanceBefore + item.quantity;

        await this.skus.updateOne(
          { _id: sku._id },
          { $set: { stock: balanceAfter }, $inc: { version: 1 } },
        ).session(session);

        await this.stockMovements.create(
          [{
            tenantId,
            skuId: sku._id,
            productId: sku.productId,
            type: 'return',
            quantity: item.quantity,
            balanceBefore,
            balanceAfter,
            reference: order._id.toString(),
            referenceType: 'order',
            note: `Order cancellation: ${reason || 'No reason provided'}`,
            userId,
            timestamp: new Date(),
          }],
          { session },
        );
      }

      order.status = 'Cancelled';
      order.cancelledAt = new Date();
      order.cancellationReason = reason;
      await order.save({ session });

      await session.commitTransaction();
      session.endSession();

      return order;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }
}

export default OrderService;


