import mongoose from 'mongoose';
import PurchaseOrderModel, { PurchaseOrderStatus } from '@/models/purchase-order.model';
import SKUModel from '@/models/sku.model';
import StockMovementModel from '@/models/stock-movement.model';
import SupplierModel from '@/models/supplier.model';
import { HttpException } from '@/exceptions/HttpException';
import { addTenantFilter } from '@/middlewares/tenant.middleware';

class PurchaseOrderService {
  public purchaseOrders = PurchaseOrderModel;
  public skus = SKUModel;
  public stockMovements = StockMovementModel;
  public suppliers = SupplierModel;

  public async getPurchaseOrders(tenantId: string, queryParams: any) {
    const { status, supplierId, search, startDate, endDate } = queryParams;
    const query: any = addTenantFilter(tenantId);

    if (status) query.status = status;
    if (supplierId) query.supplierId = supplierId;
    if (search) {
      query.$or = [
        { poNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    return this.purchaseOrders
      .find(query)
      .populate('supplierId', 'name code contactPerson email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
  }

  public async getPurchaseOrderById(tenantId: string, id: string) {
    const po = await this.purchaseOrders
      .findOne({ _id: id, tenantId })
      .populate('supplierId')
      .populate('createdBy', 'name email')
      .populate('items.skuId', 'sku variantInfo price stock');

    if (!po) throw new HttpException(404, 'Purchase order not found');
    return po;
  }

  public async createPurchaseOrder(tenantId: string, userId: string, body: any) {
    const { supplierId, items, tax, shippingCost, notes, expectedDeliveryDate } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new HttpException(400, 'Purchase order items are required');
    }

    // Verify supplier exists
    const supplier = await this.suppliers.findOne({ _id: supplierId, tenantId });
    if (!supplier) throw new HttpException(404, 'Supplier not found');

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate all SKUs and calculate totals
      let subtotal = 0;
      const poItems = [];

      for (const item of items) {
        const sku = await this.skus
          .findOne({ _id: item.skuId, tenantId })
          .populate('productId')
          .session(session);

        if (!sku) throw new HttpException(404, `SKU ${item.skuId} not found`);

        const productName = (sku as any).productId?.name || 'Unknown';
        const lineTotal = item.orderedPrice * item.orderedQuantity;
        subtotal += lineTotal;

        poItems.push({
          skuId: sku._id,
          productName,
          sku: sku.sku,
          variantInfo: sku.variantCombination
            ? Object.entries(sku.variantCombination)
                .map(([, value]) => value)
                .join(' / ')
            : undefined,
          orderedQuantity: item.orderedQuantity,
          receivedQuantity: 0,
          orderedPrice: item.orderedPrice,
          lineTotal,
        });
      }

      const totalAmount = subtotal + (tax || 0) + (shippingCost || 0);

      // Generate PO number
      const poCount = await this.purchaseOrders.countDocuments({ tenantId }).session(session);
      const poNumber = `PO-${new Date().getFullYear()}-${String(poCount + 1).padStart(6, '0')}`;

      const purchaseOrder = new this.purchaseOrders({
        tenantId,
        poNumber,
        supplierId,
        status: 'Draft',
        items: poItems,
        subtotal,
        tax: tax || 0,
        shippingCost: shippingCost || 0,
        totalAmount,
        notes,
        createdBy: userId,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
      });

      await purchaseOrder.save({ session });
      await session.commitTransaction();
      session.endSession();

      return this.getPurchaseOrderById(tenantId, purchaseOrder._id.toString());
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  public async updatePurchaseOrder(tenantId: string, id: string, body: any) {
    const po = await this.purchaseOrders.findOne({ _id: id, tenantId });
    if (!po) throw new HttpException(404, 'Purchase order not found');

    // Only allow updates if status is Draft
    if (po.status !== 'Draft') {
      throw new HttpException(400, 'Can only update purchase orders with Draft status');
    }

    // If items are being updated, recalculate totals
    if (body.items) {
      let subtotal = 0;
      for (const item of body.items) {
        subtotal += item.orderedPrice * item.orderedQuantity;
      }
      body.subtotal = subtotal;
      body.totalAmount = subtotal + (body.tax || po.tax || 0) + (body.shippingCost || po.shippingCost || 0);
    }

    Object.assign(po, body);
    await po.save();
    return this.getPurchaseOrderById(tenantId, id);
  }

  public async updatePurchaseOrderStatus(
    tenantId: string,
    id: string,
    newStatus: PurchaseOrderStatus,
    userId: string,
  ) {
    const po = await this.purchaseOrders.findOne({ _id: id, tenantId });
    if (!po) throw new HttpException(404, 'Purchase order not found');

    // Validate status transition
    const validTransitions: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
      Draft: ['Sent', 'Cancelled'],
      Sent: ['Confirmed', 'Cancelled'],
      Confirmed: ['Received', 'Cancelled'],
      Received: [], // Final state
      Cancelled: [], // Final state
    };

    if (!validTransitions[po.status]?.includes(newStatus)) {
      throw new HttpException(400, `Invalid status transition from ${po.status} to ${newStatus}`);
    }

    const updateData: any = { status: newStatus };

    if (newStatus === 'Sent') updateData.sentAt = new Date();
    if (newStatus === 'Confirmed') updateData.confirmedAt = new Date();
    if (newStatus === 'Cancelled') {
      // No additional fields needed for cancellation
    }

    Object.assign(po, updateData);
    await po.save();

    return this.getPurchaseOrderById(tenantId, id);
  }

  public async receivePurchaseOrder(
    tenantId: string,
    id: string,
    body: { items: Array<{ itemId: string; receivedQuantity: number; receivedPrice?: number }> },
    userId: string,
  ) {
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new HttpException(400, 'Received items are required');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const po = await this.purchaseOrders.findOne({ _id: id, tenantId }).session(session);
      if (!po) throw new HttpException(404, 'Purchase order not found');

      if (po.status !== 'Confirmed' && po.status !== 'Received') {
        throw new HttpException(400, 'Can only receive confirmed purchase orders');
      }

      // Process each received item
      for (const receivedItem of items) {
        const poItem = po.items.id(receivedItem.itemId);
        if (!poItem) {
          throw new HttpException(404, `Purchase order item ${receivedItem.itemId} not found`);
        }

        const receivedQty = receivedItem.receivedQuantity;
        const receivedPrice = receivedItem.receivedPrice || poItem.orderedPrice;

        if (receivedQty < 0 || receivedQty > poItem.orderedQuantity - poItem.receivedQuantity) {
          throw new HttpException(
            400,
            `Invalid received quantity for item ${poItem.sku}. Cannot exceed remaining quantity.`,
          );
        }

        // Update received quantity and price
        poItem.receivedQuantity += receivedQty;
        poItem.receivedPrice = receivedPrice;
        poItem.priceVariance = receivedPrice - poItem.orderedPrice;

        // Update stock
        const sku = await this.skus.findOne({ _id: poItem.skuId, tenantId }).session(session);
        if (!sku) throw new HttpException(404, `SKU ${poItem.skuId} not found`);

        const balanceBefore = sku.stock;
        const balanceAfter = balanceBefore + receivedQty;

        const updateResult = await this.skus.updateOne(
          { _id: sku._id, version: sku.version },
          {
            $set: { stock: balanceAfter },
            $inc: { version: 1 },
          },
        ).session(session);

        if (updateResult.modifiedCount === 0) {
          await session.abortTransaction();
          throw new HttpException(409, `Concurrent modification detected for SKU ${sku.sku}. Please try again.`);
        }

        // Create stock movement
        await this.stockMovements.create(
          [
            {
              tenantId,
              skuId: sku._id,
              productId: sku.productId,
              type: 'purchase',
              quantity: receivedQty,
              balanceBefore,
              balanceAfter,
              reference: po._id.toString(),
              referenceType: 'purchase_order',
              note: `Purchase order receipt: ${po.poNumber}`,
              userId,
              timestamp: new Date(),
            },
          ],
          { session },
        );
      }

      // Check if all items are fully received
      const allReceived = po.items.every(item => item.receivedQuantity >= item.orderedQuantity);
      if (allReceived) {
        po.status = 'Received';
        po.receivedAt = new Date();
      } else {
        po.status = 'Received'; // Partial receipt
      }

      await po.save({ session });
      await session.commitTransaction();
      session.endSession();

      return this.getPurchaseOrderById(tenantId, id);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  public async cancelPurchaseOrder(tenantId: string, id: string) {
    const po = await this.purchaseOrders.findOne({ _id: id, tenantId });
    if (!po) throw new HttpException(404, 'Purchase order not found');

    if (po.status === 'Received') {
      throw new HttpException(400, 'Cannot cancel a received purchase order');
    }

    if (po.status === 'Cancelled') {
      throw new HttpException(400, 'Purchase order is already cancelled');
    }

    po.status = 'Cancelled';
    await po.save();

    return this.getPurchaseOrderById(tenantId, id);
  }

  public async deletePurchaseOrder(tenantId: string, id: string) {
    const po = await this.purchaseOrders.findOne({ _id: id, tenantId });
    if (!po) throw new HttpException(404, 'Purchase order not found');

    if (po.status !== 'Draft') {
      throw new HttpException(400, 'Can only delete purchase orders with Draft status');
    }

    await this.purchaseOrders.deleteOne({ _id: id, tenantId });
    return { message: 'Purchase order deleted successfully' };
  }
}

export default PurchaseOrderService;

