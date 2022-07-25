import { Request, Response } from "express";
import {
  createProduct,
  deleteProduct,
  findAndUpdateProduct,
  findProduct,
  getAllProducts,
} from "../services/product.service";

export async function createProductHandler(req: Request, res: Response) {
  const userId = req.user.user_id;
  if (!userId) return res.sendStatus(403);
  const body = req.body;
  body.userId = userId;
  const product = await createProduct({
    ...body,
  });
  return res.send(product);
}

export async function updateProductHandler(req: Request, res: Response) {
  const productId = req.params.productId;
  const userId = req.user.user_id;
  const update = req.body;
  const product = await findProduct(productId);
  if (!product) return res.sendStatus(404);
  if (product.userId.toString() !== userId)
    return res
      .status(403)
      .send("You need to be product creator in order to update it");
  const updatedProduct = await findAndUpdateProduct({ productId }, update, {
    new: true,
  });
  return res.send(updatedProduct);
}

export async function getProductHandler(req: Request, res: Response) {
  const productId = req.params.productId;
  const product = await findProduct(productId);
  if (!product) return res.sendStatus(404);
  return res.send(product);
}

export async function getAllProductsHandler(req: Request, res: Response) {
  try {
    const products = await getAllProducts();
    return res.json({
      products: products.map((product) => product.toObject({ getters: true })),
    });
  } catch (error: any) {
    return res.status(409).send(error.message);
  }
}

export async function deleteProductHandler(req: Request, res: Response) {
  const productId = req.params.productId;
  const userId = req.user.user_id;
  const product = await findProduct(productId);
  if (!product) return res.sendStatus(404);
  if (product.userId.toString() !== userId) return res.sendStatus(403);
  await deleteProduct(productId);
  return res.sendStatus(200);
}
