import { model, Schema, Document } from 'mongoose';

export interface ISKU extends Document {
  tenantId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  sku: string;
  variantCombination?: Record<string, string>;
  stock: number;
  price: number;
  cost?: number;
  lowStockThreshold: number;
  reorderPoint?: number;
  version: number; // For optimistic locking
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const skuSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    variantCombination: {
      type: Schema.Types.Mixed,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    cost: {
      type: Number,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
    reorderPoint: {
      type: Number,
      min: 0,
    },
    version: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
skuSchema.index({ tenantId: 1, sku: 1 }, { unique: true });
skuSchema.index({ tenantId: 1, productId: 1 });
skuSchema.index({ tenantId: 1, stock: 1 }); // For low stock queries
skuSchema.index({ tenantId: 1, isActive: 1 });

const SKUModel = model<ISKU>('SKU', skuSchema);

export default SKUModel;

