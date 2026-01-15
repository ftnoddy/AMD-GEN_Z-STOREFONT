import { model, Schema, Document } from 'mongoose';

export type UserRole = 'Owner' | 'Manager' | 'Staff';

export interface IInventoryUser extends Document {
  tenantId: Schema.Types.ObjectId;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryUserSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Owner', 'Manager', 'Staff'],
      default: 'Staff',
      required: true,
    },
    avatar: {
      type: String,
    },
    phone: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for tenant + email uniqueness
inventoryUserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
inventoryUserSchema.index({ tenantId: 1 });
inventoryUserSchema.index({ email: 1 });

const InventoryUserModel = model<IInventoryUser>('InventoryUser', inventoryUserSchema);

export default InventoryUserModel;

