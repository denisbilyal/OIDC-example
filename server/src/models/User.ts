import mongoose, { Document, Schema } from 'mongoose';

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string; // или userId: string ако винаги го има
}

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  address?: string;
  workAddress?: string;
  provider: 'local' | 'google';
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  firstName: String,
  lastName: String,
  birthDate: Date,
  address: String,
  workAddress: String,
  provider: { type: String, default: 'local' }
});

export default mongoose.model<IUser>('User', userSchema);
