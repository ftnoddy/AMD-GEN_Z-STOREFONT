import { model, Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  subdomain: string;
  logo?: string;
  settings: {
    currency: string;
    timezone: string;
    lowStockThreshold: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subdomain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'],
    },
    logo: {
      type: String,
    },
    settings: {
      currency: {
        type: String,
        default: 'USD',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      lowStockThreshold: {
        type: Number,
        default: 10,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
tenantSchema.index({ subdomain: 1 }, { unique: true });

const TenantModel = model<ITenant>('Tenant', tenantSchema);

export default TenantModel;

