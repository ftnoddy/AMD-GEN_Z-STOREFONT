import mongoose from 'mongoose';
import SKUModel from '@/models/sku.model';
import StockMovementModel from '@/models/stock-movement.model';
import { HttpException } from '@/exceptions/HttpException';
import { addTenantFilter } from '@/middlewares/tenant.middleware';
import { emitToTenant, SocketEvents } from '@/utils/socket';

class SKUService {
  public skus = SKUModel;
  public stockMovements = StockMovementModel;

  public async getSKUs(tenantId: string, queryParams: any) {
    const { productId, lowStock, outOfStock } = queryParams;
    const query: any = addTenantFilter(tenantId);

    if (productId) query.productId = productId;
    if (lowStock === 'true') {
      query.$expr = { $lt: ['$stock', '$lowStockThreshold'] };
    }
    if (outOfStock === 'true') {
      query.stock = 0;
    }

    return this.skus
      .find(query)
      .populate('productId', 'name category')
      .sort({ createdAt: -1 });
  }

  public async getSKUById(tenantId: string, id: string) {
    const sku = await this.skus
      .findOne({ _id: id, tenantId })
      .populate('productId');

    if (!sku) throw new HttpException(404, 'SKU not found');
    return sku;
  }

  public async createSKU(tenantId: string, body: any) {
    const skuData = { ...body, tenantId };

    const existing = await this.skus.findOne({
      tenantId,
      sku: skuData.sku.toUpperCase(),
    });
    if (existing) throw new HttpException(400, 'SKU code already exists');

    const sku = new this.skus(skuData);
    await sku.save();
    return sku;
  }

  public async updateSKU(tenantId: string, id: string, body: any) {
    const { stock, ...updateData } = body;
    const sku = await this.skus.findOneAndUpdate(
      { _id: id, tenantId },
      updateData,
      { new: true, runValidators: true },
    );
    if (!sku) throw new HttpException(404, 'SKU not found');
    return sku;
  }

  public async adjustStock(params: {
    tenantId: string;
    skuId: string;
    quantity: number;
    type: 'add' | 'remove';
    note?: string;
    userId: string;
  }) {
    const { tenantId, skuId, quantity, type, note, userId } = params;

    if (!['add', 'remove'].includes(type)) {
      throw new HttpException(400, 'Type must be "add" or "remove"');
    }
    if (!quantity || quantity <= 0) {
      throw new HttpException(400, 'Quantity must be a positive number');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const sku = await this.skus
        .findOne({ _id: skuId, tenantId })
        .session(session);
      if (!sku) throw new HttpException(404, 'SKU not found');

      const balanceBefore = sku.stock;
      const delta = type === 'add' ? quantity : -quantity;
      const balanceAfter = balanceBefore + delta;

      if (balanceAfter < 0) {
        throw new HttpException(400, 'Insufficient stock. Cannot have negative stock.');
      }

      const updateResult = await this.skus.updateOne(
        { _id: skuId, version: sku.version },
        {
          $set: { stock: balanceAfter },
          $inc: { version: 1 },
        },
      ).session(session);

      if (updateResult.modifiedCount === 0) {
        await session.abortTransaction();
        throw new HttpException(409, 'Concurrent modification detected. Please try again.');
      }

      await this.stockMovements.create(
        [{
          tenantId,
          skuId: sku._id,
          productId: sku.productId,
          type: 'adjustment',
          quantity: delta,
          balanceBefore,
          balanceAfter,
          note,
          referenceType: 'adjustment',
          userId,
          timestamp: new Date(),
        }],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      const updatedSKU = await this.skus.findById(skuId).populate('productId');
      
      // Emit real-time update
      emitToTenant(tenantId, SocketEvents.STOCK_ADJUSTED, {
        skuId: skuId.toString(),
        productId: sku.productId.toString(),
        balanceBefore,
        balanceAfter,
        quantity: delta,
        type: 'adjustment',
        note,
        userId,
        timestamp: new Date(),
      });

      // Emit stock movement created
      emitToTenant(tenantId, SocketEvents.STOCK_MOVEMENT_CREATED, {
        skuId: skuId.toString(),
        productId: sku.productId.toString(),
        type: 'adjustment',
        quantity: delta,
        balanceBefore,
        balanceAfter,
        note,
        userId,
        timestamp: new Date(),
      });

      return updatedSKU;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  public async bulkCreateSKUs(tenantId: string, skus: any[]) {
    if (!Array.isArray(skus) || skus.length === 0) {
      throw new HttpException(400, 'SKUs array is required');
    }

    const skusWithTenant = skus.map(s => ({
      ...s,
      tenantId,
      sku: s.sku.toUpperCase(),
    }));

    const skuCodes = skusWithTenant.map(s => s.sku);
    const existing = await this.skus.find({
      tenantId,
      sku: { $in: skuCodes },
    });

    if (existing.length > 0) {
      throw new HttpException(
        400,
        `Duplicate SKU codes: ${existing.map(s => s.sku).join(', ')}`,
      );
    }

    return this.skus.insertMany(skusWithTenant);
  }
}

export default SKUService;


