import mongoose from "mongoose";

export interface UserDocument extends mongoose.Document {
  username: string;
  password: string;
  deposit: number;
  role: number;
  createdAt: Date;
  updatedAt: Date;
  token: String;
  comparePassword(candidatePassword: string): Promise<Boolean>;
}

export interface ProductDocument extends mongoose.Document {
  userId: string;
  amountAvailable: number;
  cost: number;
  productName: string;
  createdAt: Date;
  updatedAt: Date;
}
