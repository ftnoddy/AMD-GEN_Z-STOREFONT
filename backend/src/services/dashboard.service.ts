import mongoose from 'mongoose';
import ProductModel from '@/models/product.model';
import SKUModel from '@/models/sku.model';
import StockMovementModel from '@/models/stock-movement.model';
import OrderModel from '@/models/order.model';
import PurchaseOrderModel from '@/models/purchase-order.model';
import { addTenantFilter } from '@/middlewares/tenant.middleware';

class DashboardService {
  public products = ProductModel;
  public skus = SKUModel;
  public stockMovements = StockMovementModel;
  public orders = OrderModel;
  public purchaseOrders = PurchaseOrderModel;

  public async getDashboardStats(tenantId: string) {
    const stats = await Promise.all([
      this.getInventoryValue(tenantId),
      this.getTotalProducts(tenantId),
      this.getTotalSKUs(tenantId),
      this.getLowStockAlerts(tenantId),
      this.getTopSellers(tenantId),
      this.getStockMovementChart(tenantId),
      this.getCategoryDistribution(tenantId),
    ]);

    return {
      inventoryValue: stats[0],
      totalProducts: stats[1],
      totalSKUs: stats[2],
      lowStockAlerts: stats[3],
      topSellers: stats[4],
      stockMovementChart: stats[5],
      categoryDistribution: stats[6],
    };
  }

  private async getInventoryValue(tenantId: string): Promise<number> {
    const result = await this.skus.aggregate([
      { $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
        },
      },
    ]);

    return result[0]?.totalValue || 0;
  }

  private async getTotalProducts(tenantId: string): Promise<number> {
    return this.products.countDocuments({ tenantId, isActive: true });
  }

  private async getTotalSKUs(tenantId: string): Promise<number> {
    return this.skus.countDocuments({ tenantId });
  }

  private async getLowStockAlerts(tenantId: string) {
    // Get all SKUs with low stock
    const lowStockSKUs = await this.skus
      .find({
        tenantId,
        $expr: { $lt: ['$stock', '$lowStockThreshold'] },
      })
      .populate('productId', 'name category')
      .lean();

    // Get pending purchase orders for these SKUs
    const pendingPOs = await this.purchaseOrders
      .find({
        tenantId,
        status: { $in: ['Sent', 'Confirmed'] },
      })
      .lean();

    // Calculate pending quantities per SKU
    const pendingQuantities: Record<string, number> = {};
    for (const po of pendingPOs) {
      for (const item of po.items) {
        const skuId = item.skuId.toString();
        const remainingQty = item.orderedQuantity - (item.receivedQuantity || 0);
        pendingQuantities[skuId] = (pendingQuantities[skuId] || 0) + remainingQty;
      }
    }

    // Filter out SKUs that will be replenished by pending POs
    const alerts = lowStockSKUs
      .map(sku => {
        const skuId = sku._id.toString();
        const currentStock = sku.stock;
        const threshold = sku.lowStockThreshold;
        const pendingQty = pendingQuantities[skuId] || 0;
        const projectedStock = currentStock + pendingQty;

        // Only alert if projected stock is still below threshold
        if (projectedStock < threshold) {
          return {
            skuId: sku._id,
            sku: sku.sku,
            productName: (sku.productId as any)?.name || 'Unknown',
            category: (sku.productId as any)?.category || 'Unknown',
            currentStock,
            threshold,
            pendingQuantity: pendingQty,
            projectedStock,
            variantInfo: sku.variantCombination
              ? Object.entries(sku.variantCombination)
                  .map(([, value]) => value)
                  .join(' / ')
              : undefined,
          };
        }
        return null;
      })
      .filter(alert => alert !== null)
      .sort((a, b) => a!.currentStock - b!.currentStock)
      .slice(0, 10); // Top 10 most critical

    return alerts;
  }

  private async getTopSellers(tenantId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.orders.aggregate([
      {
        $match: {
          tenantId: new mongoose.Types.ObjectId(tenantId),
          status: { $in: ['Fulfilled', 'Pending'] },
          createdAt: { $gte: startDate },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.skuId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.lineTotal' },
          sku: { $first: '$items.sku' },
          productName: { $first: '$items.productName' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    // Populate SKU details
    const skuIds = result.map(r => r._id);
    const skus = await this.skus.find({ _id: { $in: skuIds }, tenantId }).lean();

    return result.map(item => {
      const sku = skus.find(s => s._id.toString() === item._id.toString());
      return {
        skuId: item._id,
        sku: item.sku,
        productName: item.productName,
        variantInfo: sku?.variantCombination
          ? Object.entries(sku.variantCombination)
              .map(([, value]) => value)
              .join(' / ')
          : undefined,
        totalQuantity: item.totalQuantity,
        totalRevenue: item.totalRevenue,
      };
    });
  }

  private async getStockMovementChart(tenantId: string, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const result = await this.stockMovements.aggregate([
      {
        $match: {
          tenantId: new mongoose.Types.ObjectId(tenantId),
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp',
              },
            },
            type: '$type',
          },
          totalQuantity: { $sum: { $abs: '$quantity' } },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Organize by date and type
    const chartData: Record<string, any> = {};
    const types = ['purchase', 'sale', 'return', 'adjustment'];

    // Initialize all dates
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      chartData[dateStr] = { date: dateStr };
      types.forEach(type => {
        chartData[dateStr][type] = 0;
      });
    }

    // Fill in actual data
    result.forEach(item => {
      const date = item._id.date;
      const type = item._id.type;
      if (chartData[date]) {
        chartData[date][type] = item.totalQuantity;
      }
    });

    return Object.values(chartData);
  }

  private async getCategoryDistribution(tenantId: string) {
    const result = await this.products.aggregate([
      { $match: { tenantId: new mongoose.Types.ObjectId(tenantId), isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return result.map(item => ({
      category: item._id || 'Uncategorized',
      count: item.count,
    }));
  }
}

export default DashboardService;

