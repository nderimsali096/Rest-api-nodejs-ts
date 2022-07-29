import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import createServer from "../utils/server";
import { createProduct } from "../services/product.service";

const app = createServer();

const userId = new mongoose.Types.ObjectId().toString();

export const productPayload = {
  userId: userId,
  productName: "Snickers",
  cost: 10,
  amountAvailable: 15,
};

describe("product", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe("get product by id route", () => {
    describe("given the product does not exist", () => {
      it("should return a 404 status code and an error that says 'Product does not exist'", async () => {
        // Arrange
        const productId = new mongoose.Types.ObjectId().toString();

        // Act
        const response = await supertest(app).get(`/api/products/${productId}`);

        // Assert
        expect(response.status).toBe(404);
        expect(response.text).toBe("Product does not exist");
      });
    });
    describe("given the product does exist", () => {
      it("should return a 200 status and the product", async () => {
        // Arrange
        const product = await createProduct(productPayload);

        // Act
        const { body, statusCode } = await supertest(app).get(
          `/api/products/${product._id.toString()}`
        );

        // Assert
        expect(statusCode).toBe(200);
        expect(body._id).toBe(product._id.toString());
      });
    });
  });
  describe("create product route", () => {
    describe("given the user is not logged in", () => {
      it("should return a 403", async () => {
        // Arrange and Act
        const { statusCode } = await supertest(app).post("/api/products");

        // Assert
        expect(statusCode).toBe(403);
      });
    });

    describe("given the cost is not divisible by 5", () => {
      it("should return a 400 and a message that says: 'Cost should be divisible by 5'", async () => {
        // Arrange
        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        const payload = {
          userId: userId,
          productName: productPayload.productName,
          amountAvailable: 10,
          cost: 16,
        };

        // Act
        const { statusCode, text } = await supertest(app)
          .post("/api/products")
          .set("Authorization", `Bearer ${token}`)
          .send(payload);

        // Assert
        expect(statusCode).toBe(400);
        expect(text).toBe("Cost should be divisible by 5");
      });
    });

    describe("given the user is logged in", () => {
      it("should return a 201 and create the product", async () => {
        // Arrange
        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        // Act
        const { statusCode, body } = await supertest(app)
          .post("/api/products")
          .set("Authorization", `Bearer ${token}`)
          .send(productPayload);

        // Assert
        expect(statusCode).toBe(201);
        expect(body).toEqual({
          __v: 0,
          _id: expect.any(String),
          createdAt: expect.any(String),
          amountAvailable: 15,
          cost: 10,
          productName: "Snickers",
          updatedAt: expect.any(String),
          userId: expect.any(String),
        });
      });
    });
  });
  describe("update product route", () => {
    describe("given the user is not logged in", () => {
      it("should return a 403", async () => {
        // Arrange and act
        const { statusCode } = await supertest(app).put("/api/products/someid");

        // Assert
        expect(statusCode).toBe(403);
      });
    });

    describe("given the user is not the one who created the product", () => {
      it("should return a 403 and a message that says 'You need to be the product's creator in order to update it'", async () => {
        // Arrange
        const product = await createProduct(productPayload);
        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        // Changing the user id
        productPayload.userId = new mongoose.Types.ObjectId().toString();

        // Act
        const { statusCode, text } = await supertest(app)
          .put(`/api/products/${product._id.toString()}`)
          .set("Authorization", `Bearer ${token}`)
          .send(productPayload);

        // Assert
        expect(statusCode).toBe(403);
        expect(text).toBe(
          "You need to be the product's creator in order to update it"
        );
      });
    });

    describe("given the cost is not divisible by 5", () => {
      it("should return a 400 and a message that says: 'Cost should be divisible by 5'", async () => {
        // Arrange
        const product = await createProduct(productPayload);
        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        const payload = {
          userId: userId,
          productName: productPayload.productName,
          amountAvailable: 10,
          cost: 16,
        };

        // Act
        const { statusCode, text } = await supertest(app)
          .put(`/api/products/${product._id.toString()}`)
          .set("Authorization", `Bearer ${token}`)
          .send(payload);

        // Assert
        expect(statusCode).toBe(400);
        expect(text).toBe("Cost should be divisible by 5");
      });
    });

    describe("given the user is logged in", () => {
      it("should return a 201 and update the product", async () => {
        // Arrange
        const product = await createProduct(productPayload);
        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        // Act
        const { statusCode, body } = await supertest(app)
          .put(`/api/products/${product._id.toString()}`)
          .set("Authorization", `Bearer ${token}`)
          .send(productPayload);
        // Assert
        expect(statusCode).toBe(201);
        expect(body).toEqual({
          __v: 0,
          _id: expect.any(String),
          createdAt: expect.any(String),
          amountAvailable: 15,
          cost: 10,
          productName: "Snickers",
          updatedAt: expect.any(String),
          userId: expect.any(String),
        });
      });
    });
  });
  describe("delete product by id route", () => {
    describe("given the user is not logged in", () => {
      it("should return a 403", async () => {
        // Arrange and act
        const { statusCode } = await supertest(app).delete(
          "/api/products/someid"
        );

        // Assert
        expect(statusCode).toBe(403);
      });
    });
    describe("given the user is logged in and product does exist", () => {
      it("should return a 204 status and delete the product", async () => {
        // Arrange
        const product = await createProduct(productPayload);
        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        const payload = {
          userId: product.userId,
        };

        // Act
        const { statusCode } = await supertest(app)
          .delete(`/api/products/${product._id.toString()}`)
          .set("Authorization", `Bearer ${token}`)
          .send(payload);

        // Assert
        expect(statusCode).toBe(204);
      });
    });

    describe("given the user is logged in but product does not exist", () => {
      it("should return a 404 status and product not found", async () => {
        // Arrange
        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        const payload = {
          userId: userId,
        };
        const InvalidProductId = new mongoose.Types.ObjectId().toString();

        // Act
        const { statusCode, text } = await supertest(app)
          .delete(`/api/products/${InvalidProductId}`)
          .set("Authorization", `Bearer ${token}`);

        // Assert
        expect(statusCode).toBe(404);
        expect(text).toBe("Product does not exist");
      });
    });

    describe("given the user is logged in but it is not the user who created the product", () => {
      it("should return a 403 status and message", async () => {
        // Arrange
        const product = await createProduct(productPayload);
        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        const payload = {
          userId: new mongoose.Types.ObjectId().toString(),
        };

        // Act
        const { statusCode, text } = await supertest(app)
          .delete(`/api/products/${product._id.toString()}`)
          .set("Authorization", `Bearer ${token}`)
          .send(payload);
        // Assert
        expect(statusCode).toBe(403);
        expect(text).toBe(
          "You need to be the product's creator in order to delete it"
        );
      });
    });
  });
});
