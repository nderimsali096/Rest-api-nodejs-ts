import { Request, Response } from "express";
import {
  createProduct,
  deleteProduct,
  findAndUpdateProduct,
  findProduct,
  getAllProducts,
} from "../services/product.service";
import logger from "../utils/logger";

export async function createProductHandler(req: Request | any, res: Response) {
  try {
    const userId = req.user.user_id;
    const body = req.body;
    body.userId = userId;
    const product = await createProduct({
      ...body,
    });
    return res.status(201).send(product);
  } catch (error: any) {
    logger.error(`Could not create product: ${error}`);
    return res.status(409).send(error.message);
  }
}

export async function updateProductHandler(req: Request | any, res: Response) {
  try {
    const productId = req.params.productId;
    const userId = req.user.user_id;
    const update = req.body;
    const product = await findProduct(productId);

    // Check if product exists
    if (!product) return res.status(404).send("Product does not exist");

    // Check if the user that is trying to update the product is the one who created it
    if (product.userId.toString() !== userId)
      return res
        .status(403)
        .send("You need to be the product's creator in order to update it");

    const updatedProduct = await findAndUpdateProduct({ productId }, update, {
      new: true,
    });
    return res.send(updatedProduct);
  } catch (error: any) {
    logger.error(`Could not update product: ${error}`);
    return res.status(409).send(error.message);
  }
}

export async function getProductHandler(req: Request, res: Response) {
  try {
    const productId = req.params.productId;
    const product = await findProduct(productId);

    // Check if product exists
    if (!product) return res.status(404).send("Product does not exist");

    return res.send(product);
  } catch (error: any) {
    logger.error(`Could not get the product: ${error}`);
    return res.status(409).send(error.message);
  }
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

export async function deleteProductHandler(req: Request | any, res: Response) {
  try {
    const productId = req.params.productId;
    const userId = req.user.user_id;
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
  } catch (error: any) {
    logger.error(`Could not get the product: ${error}`);
    return res.status(409).send(error.message);
  }
}
