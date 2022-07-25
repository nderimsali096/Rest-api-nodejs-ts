import {
  DocumentDefinition,
  FilterQuery,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import ProductModel from "../models/product.model";
import { ProductDocument } from "../types/interfaces";

export async function createProduct(
  input: DocumentDefinition<Omit<ProductDocument, "createdAt" | "updatedAt">>
) {
  return ProductModel.create(input);
}

export async function findProduct(
  productId: String,
  options: QueryOptions = { lean: true }
) {
  return ProductModel.findOne({ _id: productId });
}

export async function getAllProducts() {
  return await ProductModel.find({});
}

export async function findAndUpdateProduct(
  query: FilterQuery<ProductDocument>,
  update: UpdateQuery<ProductDocument>,
  options: QueryOptions
) {
  return ProductModel.findOneAndUpdate(query, update, options);
}

export async function deleteProduct(productId: String) {
  return ProductModel.deleteOne({ _id: productId });
}
