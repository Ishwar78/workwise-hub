import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  company_id: Types.ObjectId;
  email: string;
  password_hash: string;
  name: string;
  role: 'company_admin' | 'sub_admin' | 'user';
  devices: Array<{
    device_id: string;
    device_name: string;
    os: string;
    bound_at: Date;
    last_seen: Date;
  }>;
  status: 'active' | 'suspended' | 'invited';
  invite_token?: string;
  last_login?: Date;
}

const UserSchema = new Schema<IUser>({
  company_id: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true, select: false },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['company_admin', 'sub_admin', 'user'], default: 'user' },
  devices: [{
    device_id: { type: String, required: true },
    device_name: String,
    os: String,
    bound_at: { type: Date, default: Date.now },
    last_seen: { type: Date, default: Date.now },
  }],
  status: { type: String, enum: ['active', 'suspended', 'invited'], default: 'invited' },
  invite_token: String,
  last_login: Date,
}, { timestamps: true });

UserSchema.index({ company_id: 1, email: 1 }, { unique: true });
UserSchema.index({ invite_token: 1 }, { sparse: true });

export const User = mongoose.model<IUser>('User', UserSchema);
