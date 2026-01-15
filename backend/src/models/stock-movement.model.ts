import { model, Schema, Document } from 'mongoose';

export type StockMovementType = 'purchase' | 'sale' | 'return' | 'adjustment';

export interface IStockMovement extends Document {
  tenantId: Schema.Types.ObjectId;
  skuId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  type: StockMovementType;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  reference?: string;
  referenceType?: 'order' | 'purchase_order' | 'adjustment';
  note?: string;
  timestamp: Date;
  userId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const stockMovementSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    skuId: {
      type: Schema.Types.ObjectId,
      ref: 'SKU',
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['purchase', 'sale', 'return', 'adjustment'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    reference: {
      type: String,
    },
    referenceType: {
      type: String,
      enum: ['order', 'purchase_order', 'adjustment'],
    },
    note: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryUser',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
stockMovementSchema.index({ tenantId: 1, skuId: 1, timestamp: -1 });
stockMovementSchema.index({ tenantId: 1, productId: 1, timestamp: -1 });
stockMovementSchema.index({ tenantId: 1, type: 1, timestamp: -1 });
stockMovementSchema.index({ tenantId: 1, timestamp: -1 });

const StockMovementModel = model<IStockMovement>('StockMovement', stockMovementSchema);

export default StockMovementModel;

