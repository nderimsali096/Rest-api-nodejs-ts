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
  app.post("/api/users", validate(createUserSchema), createUserHandler);
  app.post("/api/users/login", loginUserHandler);
  app.put("/api/users/:userId", authentication, updateUserHandler);
  app.get("/api/users/:userId", authentication, getUserHandler);
  app.delete("/api/users/:userId", authentication, deleteUserHandler);
  app.get("/api/users", getAllUsersHandler);
  app.patch("/api/users/deposit", authentication, depositHandler);
  app.patch("/api/users/reset", authentication, resetDepositHandler);

  // PRODUCT ROUTES
  app.post(
    "/api/products",
    [authentication, validate(createProductSchema)],
    createProductHandler
  );

  app.put(
    "/api/products/:productId",
    [authentication, validate(updateProductSchema)],
    updateProductHandler
  );

  app.get(
    "/api/products/:productId",
    validate(getProductSchema),
    getProductHandler
  );

  app.get("/api/products", getAllProductsHandler);

  app.delete(
    "/api/products/:productId",
    [authentication, validate(deleteProductSchema)],
    deleteProductHandler
  );
}

export default routes;
