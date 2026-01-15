import StockMovementModel from '@/models/stock-movement.model';
import { HttpException } from '@/exceptions/HttpException';
import { addTenantFilter } from '@/middlewares/tenant.middleware';

class StockMovementService {
  public stockMovements = StockMovementModel;

  public async getStockMovements(tenantId: string, queryParams: any) {
    const { skuId, productId, type, startDate, endDate, referenceType, limit = 100, page = 1 } = queryParams;
    const query: any = addTenantFilter(tenantId);

    if (skuId) query.skuId = skuId;
    if (productId) query.productId = productId;
    if (type) query.type = type;
    if (referenceType) query.referenceType = referenceType;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const movements = await this.stockMovements
      .find(query)
      .populate('skuId', 'sku variantInfo')
      .populate('productId', 'name')
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await this.stockMovements.countDocuments(query);

    return {
      movements,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  public async getStockMovementById(tenantId: string, id: string) {
    const movement = await this.stockMovements
      .findOne({ _id: id, tenantId })
      .populate('skuId')
      .populate('productId')
      .populate('userId');

    if (!movement) throw new HttpException(404, 'Stock movement not found');
    return movement;
  }

  public async getStockMovementsBySKU(tenantId: string, skuId: string, limit = 50) {
    return this.stockMovements
      .find({ tenantId, skuId })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit.toString()));
  }

  public async getStockMovementsByProduct(tenantId: string, productId: string, limit = 50) {
    return this.stockMovements
      .find({ tenantId, productId })
      .populate('skuId', 'sku variantInfo')
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit.toString()));
  }

  public async createStockMovement(tenantId: string, body: any) {
    const movement = new this.stockMovements({
      ...body,
      tenantId,
      timestamp: body.timestamp || new Date(),
    });
    await movement.save();
    return movement;
  }
}

export default StockMovementService;

