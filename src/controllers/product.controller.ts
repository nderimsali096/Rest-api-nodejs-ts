import { Request, Response } from "express";
import {
  createProduct,
  deleteProduct,
  findAndUpdateProduct,
  findProduct,
  getAllProducts,
} from "../services/product.service";

import { findUser } from "../services/user.service";

export async function createProductHandler(req: Request | any, res: Response) {
  const userId = req.user.user_id;
  const body = req.body;
  if (userId) body.userId = userId;

  const user = await findUser(userId);

  if (!user) return res.status(404).send("User not found");

  console.log(user);

  if (user.role === 1)
    return res.status(403).send("You need to be a seller to create product");

  // Check if cost is divisible by 5
  if (req.body.cost % 5 !== 0)
    return res.status(400).send("Cost should be divisible by 5");

  const product = await createProduct({
    ...body,
  });
  return res.status(201).send(product);
}

export async function updateProductHandler(req: Request | any, res: Response) {
  const productId = req.params.productId;
  let userId = req.user.user_id;
  if (!userId) userId = req.body.userId;
  const update = req.body;
  const product = await findProduct(productId);

  // Check if product exists
  if (!product) return res.status(404).send("Product does not exist");

  // Check if cost is divisible by 5
  if (req.body.cost % 5 !== 0)
    return res.status(400).send("Cost should be divisible by 5");

  // Check if the user that is trying to update the product is the one who created it
  if (product.userId.toString() !== userId)
    return res
      .status(403)
      .send("You need to be the product's creator in order to update it");

  const updatedProduct = await findAndUpdateProduct({ productId }, update, {
    new: true,
  });
  return res.status(201).send(updatedProduct);
}

export async function getProductHandler(req: Request, res: Response) {
  const productId = req.params.productId;
  const product = await findProduct(productId);

  // Check if product exists
  if (!product) return res.status(404).send("Product does not exist");

  return res.send(product);
}

export async function getAllProductsHandler(req: Request, res: Response) {
  const products = await getAllProducts();
  return res.json({
    products: products.map((product) => product.toObject({ getters: true })),
  });
}

export async function deleteProductHandler(req: Request | any, res: Response) {
  const productId = req.params.productId;
  let userId = req.user.user_id;
  if (!userId) userId = req.body.userId;
  const product = await findProduct(productId);

  // Check if product exists
  if (!product) return res.status(404).send("Product does not exist");

  // Check if the user that is trying to delete the product is the one who created it
  if (product.userId.toString() !== userId)
    return res
      .status(403)
      .send("You need to be the product's creator in order to delete it");

  await deleteProduct(productId);
  return res.status(204).send("Product was deleted successfully");
}
