import { model, Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  tenantId: Schema.Types.ObjectId;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentTerms?: string;
  taxId?: string;
  rating?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const supplierSchema: Schema = new Schema(
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
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: addressSchema,
      required: true,
    },
    paymentTerms: {
      type: String,
    },
    taxId: {
      type: String,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
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

// Compound index for tenant + code uniqueness
supplierSchema.index({ tenantId: 1, code: 1 }, { unique: true });
supplierSchema.index({ tenantId: 1, name: 1 });
supplierSchema.index({ tenantId: 1, isActive: 1 });

const SupplierModel = model<ISupplier>('Supplier', supplierSchema);

export default SupplierModel;

