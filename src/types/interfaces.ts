import mongoose from "mongoose";
import { Role } from "./enums";

export interface UserDocument extends mongoose.Document {
  username: string;
  password: string;
  deposit: number;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<Boolean>;
}

export interface SessionDocument extends mongoose.Document {
  user: UserDocument["_id"];
  valid: boolean;
  userAgent: String;
  createdAt: Date;
  updatedAt: Date;
}
