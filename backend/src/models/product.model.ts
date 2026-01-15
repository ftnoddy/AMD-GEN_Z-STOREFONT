import { model, Schema, Document } from 'mongoose';

export interface IVariantOption {
  name: string;
  values: string[];
}

export interface IProduct extends Document {
  tenantId: Schema.Types.ObjectId;
  name: string;
  description: string;
  category: string;
  brand?: string;
  basePrice: number;
  hasVariants: boolean;
  variantOptions?: IVariantOption[];
  supplierId?: Schema.Types.ObjectId;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const variantOptionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    values: {
      type: [String],
      required: true,
    },
  },
  { _id: false }
);

const productSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variantOptions: {
      type: [variantOptionSchema],
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    image: {
      type: String,
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

// Indexes for efficient queries
productSchema.index({ tenantId: 1, category: 1 });
productSchema.index({ tenantId: 1, name: 1 });
productSchema.index({ tenantId: 1, supplierId: 1 });
productSchema.index({ tenantId: 1, isActive: 1 });

const ProductModel = model<IProduct>('Product', productSchema);

export default ProductModel;

