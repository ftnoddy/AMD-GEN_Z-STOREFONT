import { model, Schema, Document } from 'mongoose';

export type OrderStatus = 'Pending' | 'Fulfilled' | 'Cancelled' | 'Partial';

export interface IOrderItem {
  skuId: Schema.Types.ObjectId;
  productName: string;
  sku: string;
  variantInfo?: string;
  quantity: number;
  fulfilledQuantity: number;
  price: number;
  lineTotal: number;
}

export interface IOrder extends Document {
  tenantId: Schema.Types.ObjectId;
  orderNumber: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status: OrderStatus;
  items: IOrderItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  totalAmount: number;
  notes?: string;
  createdBy?: Schema.Types.ObjectId;
  fulfilledAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema(
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
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    fulfilledQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const orderSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    customerId: {
      type: String,
    },
    customerName: {
      type: String,
    },
    customerEmail: {
      type: String,
      lowercase: true,
    },
    customerPhone: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Fulfilled', 'Cancelled', 'Partial'],
      default: 'Pending',
      required: true,
    },
    items: {
      type: [orderItemSchema],
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
    discount: {
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
      required: false,
    },
    fulfilledAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ tenantId: 1, orderNumber: 1 }, { unique: true });
orderSchema.index({ tenantId: 1, status: 1 });
orderSchema.index({ tenantId: 1, createdAt: -1 });
orderSchema.index({ tenantId: 1, customerEmail: 1 });
orderSchema.index({ tenantId: 1, customerId: 1 });

const OrderModel = model<IOrder>('Order', orderSchema);

export default OrderModel;

