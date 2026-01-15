import { model, Schema, Document } from 'mongoose';

export type PurchaseOrderStatus = 'Draft' | 'Sent' | 'Confirmed' | 'Received' | 'Cancelled';

export interface IPurchaseOrderItem {
  skuId: Schema.Types.ObjectId;
  productName: string;
  sku: string;
  variantInfo?: string;
  orderedQuantity: number;
  receivedQuantity: number;
  orderedPrice: number;
  receivedPrice?: number;
  priceVariance?: number;
  lineTotal: number;
}

export interface IPurchaseOrder extends Document {
  tenantId: Schema.Types.ObjectId;
  poNumber: string;
  supplierId: Schema.Types.ObjectId;
  status: PurchaseOrderStatus;
  items: IPurchaseOrderItem[];
  subtotal: number;
  tax?: number;
  shippingCost?: number;
  totalAmount: number;
  notes?: string;
  createdBy: Schema.Types.ObjectId;
  sentAt?: Date;
  confirmedAt?: Date;
  expectedDeliveryDate?: Date;
  receivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseOrderItemSchema = new Schema(
  {
    skuId: {
      type: Schema.Types.ObjectId,
      ref: 'SKU',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    variantInfo: {
      type: String,
    },
    orderedQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    receivedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    orderedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    receivedPrice: {
      type: Number,
      min: 0,
    },
    priceVariance: {
      type: Number,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const purchaseOrderSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    poNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Confirmed', 'Received', 'Cancelled'],
      default: 'Draft',
      required: true,
    },
    items: {
      type: [purchaseOrderItemSchema],
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      min: 0,
    },
    shippingCost: {
      type: Number,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryUser',
      required: true,
    },
    sentAt: {
      type: Date,
    },
    confirmedAt: {
      type: Date,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    receivedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
purchaseOrderSchema.index({ tenantId: 1, poNumber: 1 }, { unique: true });
purchaseOrderSchema.index({ tenantId: 1, status: 1 });
purchaseOrderSchema.index({ tenantId: 1, supplierId: 1 });
purchaseOrderSchema.index({ tenantId: 1, createdAt: -1 });

const PurchaseOrderModel = model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);

export default PurchaseOrderModel;

