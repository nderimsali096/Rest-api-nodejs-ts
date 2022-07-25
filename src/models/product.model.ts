import mongoose from "mongoose";
import { ProductDocument } from "../types/interfaces";

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amountAvailable: { type: Number },
    cost: { type: Number },
    productName: { type: String },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<ProductDocument>("Product", productSchema);

export default Product;
