import { Express } from "express";
import {
  createProductHandler,
  getProductHandler,
  updateProductHandler,
  deleteProductHandler,
  getAllProductsHandler,
} from "./controllers/product.controller";
import {
  createUserHandler,
  loginUserHandler,
  updateUserHandler,
  getUserHandler,
  deleteUserHandler,
  getAllUsersHandler,
  depositHandler,
  resetDepositHandler,
  buyHandler,
} from "./controllers/user.controller";
import validate from "./middlewares/validateResource";
import { createUserSchema } from "./schemas/user.schema";
import {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  deleteProductSchema,
} from "./schemas/product.schema";

import { verifyToken as authentication } from "./middlewares/checkAuth";

function routes(app: Express) {
  // USER ROUTES

  //? Create user
  app.post("/api/users", validate(createUserSchema), createUserHandler);

  //? Login
  app.post("/api/users/login", authentication, loginUserHandler);

  //? Update user
  app.put("/api/users/:userId", authentication, updateUserHandler);

  //? Get user by id
  app.get("/api/users/:userId", authentication, getUserHandler);

  //? Delete user
  app.delete("/api/users/:userId", authentication, deleteUserHandler);

  //? Get all users
  app.get("/api/users", getAllUsersHandler);

  //? Deposit
  app.patch("/api/users/deposit", authentication, depositHandler);

  //? Reset deposit
  app.patch("/api/users/reset", authentication, resetDepositHandler);

  //? Buy
  app.patch("/api/users/buy", authentication, buyHandler);

  // PRODUCT ROUTES

  //? Create product
  app.post(
    "/api/products",
    [authentication, validate(createProductSchema)],
    createProductHandler
  );

  //? Update product
  app.put(
    "/api/products/:productId",
    [authentication, validate(updateProductSchema)],
    updateProductHandler
  );

  //? Get product by id
  app.get(
    "/api/products/:productId",
    validate(getProductSchema),
    getProductHandler
  );

  //? Get all
  app.get("/api/products", getAllProductsHandler);

  //? Delete product
  app.delete(
    "/api/products/:productId",
    [authentication, validate(deleteProductSchema)],
    deleteProductHandler
  );
}

export default routes;
