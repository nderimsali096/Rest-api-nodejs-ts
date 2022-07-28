import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createUser } from "../services/user.service";
import jwt from "jsonwebtoken";

import createServer from "../utils/server";
import { createProduct } from "../services/product.service";

const app = createServer();

const userId = new mongoose.Types.ObjectId().toString();

export const productPayload = {
  userId: userId,
  productName: "Snickers",
  cost: 10,
  amountAvailable: 2,
};

const userPayload = {
  userId: userId,
  deposit: 50,
  amount: 3,
  productId: new mongoose.Types.ObjectId().toString(),
};

const userInputSeller = {
  username: "testexampleSeller",
  password: "Password123",
  passwordConfirmation: "Password123",
  deposit: 50,
  role: 1,
};

const userInputBuyer = {
  username: "testexampleBuyer",
  password: "Password123",
  passwordConfirmation: "Password123",
  deposit: 50,
  role: 0,
};

describe("user", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe("deposit route", () => {
    describe("given the user is not logged in", () => {
      it("should return a 403", async () => {
        // Arrange and act
        const { statusCode } = await supertest(app).patch("/api/users/deposit");

        // Assert
        expect(statusCode).toBe(403);
      });
    });

    describe("given the user is logged in but is not a buyer role", () => {
      it("should return a 401 status and message 'You need to be a 'buyer' role to deposit.'", async () => {
        // Arrange
        const user = await createUser(userInputSeller);
        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        userPayload.userId = user._id;

        // Act
        const { text, statusCode } = await supertest(app)
          .patch(`/api/users/deposit`)
          .set("Authorization", `Bearer ${token}`)
          .send(userPayload);

        // Assert
        expect(statusCode).toBe(401);
        expect(text).toBe("You need to be a 'buyer' role to deposit.");
      });
    });

    describe("given the user is logged in, it is a buyer role but the deposit is not a 5, 10, 20, 50 or 100", () => {
      it("should return a 400 status and message 'Deposit coin can be only in values: 5, 10, 20, 50, 100'", async () => {
        // Arrange
        const user = await createUser(userInputBuyer);
        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        userPayload.userId = user._id;
        userPayload.deposit = 11;

        // Act
        const { text, statusCode } = await supertest(app)
          .patch(`/api/users/deposit`)
          .set("Authorization", `Bearer ${token}`)
          .send(userPayload);

        // Assert
        expect(statusCode).toBe(400);
        expect(text).toBe(
          "Deposit coin can be only in values: 5, 10, 20, 50, 100"
        );
      });
    });

    describe("given the user is logged in and everything else is right", () => {
      it("should return a 201 status code", async () => {
        // Arrange
        userInputBuyer.username = "userInputBuyer3";
        const user = await createUser(userInputBuyer);
        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        userPayload.userId = user._id;
        userPayload.deposit = 10;

        // Act
        const { statusCode } = await supertest(app)
          .patch(`/api/users/deposit`)
          .set("Authorization", `Bearer ${token}`)
          .send(userPayload);

        // Assert
        expect(statusCode).toBe(201);
      });
    });
  });

  describe("buy route", () => {
    describe("given the user is not logged in", () => {
      it("should return a 403", async () => {
        // Arrange and act
        const { statusCode } = await supertest(app).patch("/api/users/buy");

        // Assert
        expect(statusCode).toBe(403);
      });
    });

    describe("given the user is logged in but is not a buyer role", () => {
      it("should return a 401 status and message 'You need to be a 'buyer' role to deposit.'", async () => {
        // Arrange
        userInputSeller.username = "userInputSeller2";
        const user = await createUser(userInputSeller);
        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        userPayload.userId = user._id;

        // Act
        const { text, statusCode } = await supertest(app)
          .patch(`/api/users/buy`)
          .set("Authorization", `Bearer ${token}`)
          .send(userPayload);

        // Assert
        expect(statusCode).toBe(401);
        expect(text).toBe("You need to be a 'buyer' role to buy.");
      });
    });

    describe("given the user is logged in but the product does not exist", () => {
      it("should return a 404 status and message 'Could not find product'", async () => {
        // Arrange
        userInputBuyer.username = "userInputBuyer5";
        const user = await createUser(userInputBuyer);

        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        userPayload.userId = user._id;

        // Act
        const { text, statusCode } = await supertest(app)
          .patch(`/api/users/buy`)
          .set("Authorization", `Bearer ${token}`)
          .send(userPayload);

        // Assert
        expect(statusCode).toBe(404);
        expect(text).toBe("Could not find product");
      });
    });

    describe("given the user is logged in, it is a buyer role but the deposit is not a 5, 10, 20, 50 or 100", () => {
      it("should return a 400 status and message 'Deposit coin can be only in values: 5, 10, 20, 50, 100'", async () => {
        // Arrange
        userInputBuyer.username = "userInputBuyer4";
        const user = await createUser(userInputBuyer);
        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        userPayload.userId = user._id;
        userPayload.deposit = 11;

        // Act
        const { text, statusCode } = await supertest(app)
          .patch(`/api/users/deposit`)
          .set("Authorization", `Bearer ${token}`)
          .send(userPayload);

        // Assert
        expect(statusCode).toBe(400);
        expect(text).toBe(
          "Deposit coin can be only in values: 5, 10, 20, 50, 100"
        );
      });
    });

    describe("given the user is logged in, it is a buyer role but the there is not enough amount available", () => {
      it("should return a 400 status and message 'There are not enough availableAmount'", async () => {
        // Arrange
        userInputBuyer.username = "userInputBuyer6";
        const user = await createUser(userInputBuyer);
        const product = await createProduct(productPayload);
        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        userPayload.userId = user._id;
        userPayload.productId = product._id;
        userPayload.deposit = 10;

        console.log(userPayload);

        // Act
        const { text, statusCode } = await supertest(app)
          .patch(`/api/users/buy`)
          .set("Authorization", `Bearer ${token}`)
          .send(userPayload);

        // Assert
        expect(statusCode).toBe(400);
        expect(text).toBe("There are not enough availableAmount");
      });
    });

    describe("given the user is logged in, it is a buyer role but user has not enough money on the account to make the purchase", () => {
      it("should return a 400 status and message 'You don't have enough money on your deposit'", async () => {
        // Arrange
        userInputBuyer.username = "userInputBuyer7";
        const user = await createUser(userInputBuyer);
        productPayload.amountAvailable = 50;
        const product = await createProduct(productPayload);
        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        userPayload.userId = user._id;
        userPayload.productId = product._id;
        userPayload.deposit = 10;
        userPayload.amount = 10;

        // Act
        const { text, statusCode } = await supertest(app)
          .patch(`/api/users/buy`)
          .set("Authorization", `Bearer ${token}`)
          .send(userPayload);

        // Assert
        expect(statusCode).toBe(400);
        expect(text).toBe("You don't have enough money on your deposit");
      });
    });

    describe("given the user is logged in and everything else is right", () => {
      it("should return a 201 status code", async () => {
        // Arrange
        userInputBuyer.username = "userInputBuyer2";
        const user = await createUser(userInputBuyer);
        productPayload.amountAvailable = 50;
        const product = await createProduct(productPayload);
        const secretKey = "super-secret";
        const token = jwt.sign(
          { userId: userId, username: "test-username" },
          secretKey,
          {
            expiresIn: "2h",
          }
        );

        userPayload.userId = user._id;
        userPayload.productId = product._id;
        userPayload.amount = 1;

        // Act
        const { statusCode } = await supertest(app)
          .patch(`/api/users/buy`)
          .set("Authorization", `Bearer ${token}`)
          .send(userPayload);

        // Assert
        expect(statusCode).toBe(201);
      });
    });
  });
});
