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
} from "./controllers/user.controller";
import validate from "./middlewares/validateResource";
import { createUserSchema } from "./schemas/user.schema";
import {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  deleteProductSchema,
} from "./schemas/product.schema";

import auth from "./middlewares/checkAuth";

function routes(app: Express) {
  // USER ROUTES
  app.post("/api/users", validate(createUserSchema), createUserHandler);
  app.post("/api/users/login", loginUserHandler);
  app.put("/api/users/:userId", auth, updateUserHandler);
  app.get("/api/users/:userId", auth, getUserHandler);
  app.delete("/api/users/:userId", auth, deleteUserHandler);
  app.get("/api/users", getAllUsersHandler);

  // PRODUCT ROUTES
  app.post(
    "/api/products",
    [auth, validate(createProductSchema)],
    createProductHandler
  );

  app.put(
    "/api/products/:productId",
    [auth, validate(updateProductSchema)],
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
    [auth, validate(deleteProductSchema)],
    deleteProductHandler
  );
}

export default routes;
