import { Request, Response } from "express";

import {
  createUser,
  login,
  findAndUpdateUser,
  findUser,
  deleteUser,
  getAllUsers,
  addOrBuyOrResetDeposit,
} from "../services/user.service";

import { findProduct, findAndUpdateProduct } from "../services/product.service";
import { checkDepositCoin, getChange } from "../utils/helpers";
import logger from "../utils/logger";

export async function createUserHandler(req: Request, res: Response) {
  try {
    const user = await createUser(req.body);
    return res.status(201).send(user);
  } catch (error: any) {
    logger.error(`Conflict on creating user: ${error}`);
    return res.status(409).send(error.message);
  }
}

export async function updateUserHandler(req: Request, res: Response) {
  try {
    const update = req.body;
    const userId = req.params.userId;

    // Check if user exists
    const user = findUser(userId);
    if (!user) return res.status(404).send("Could not find user");

    const updatedUser = await findAndUpdateUser({ userId }, update, {
      new: true,
    });
    return res.status(202).send(updatedUser);
  } catch (error: any) {
    logger.error(`Conflict on updating user: ${error}`);
    return res.status(409).send(error.message);
  }
}

export async function getAllUsersHandler(req: Request, res: Response) {
  try {
    const users = await getAllUsers();
    return res.json({
      users: users.map((user) => user.toObject({ getters: true })),
    });
  } catch (error: any) {
    logger.error(`Could not get users: ${error}`);
    return res.status(409).send(error.message);
  }
}

export async function getUserHandler(req: Request, res: Response) {
  try {
    const userId = req.params.userId;

    // Check if user exists
    const user = await findUser(userId);
    if (!user) return res.sendStatus(404);

    return res.status(200).send(user);
  } catch (error: any) {
    logger.error(`Could not get user: ${error}`);
    return res.status(409).send(error.message);
  }
}

export async function deleteUserHandler(req: Request, res: Response) {
  try {
    const userId = req.params.userId;

    // Check if user exists
    const user = await findUser(userId);
    if (!user) return res.sendStatus(404);

    await deleteUser(userId);
    return res.status(204).send("User was deleted successfully");
  } catch (error: any) {
    logger.error(`Could not delete user: ${error}`);
    return res.status(409).send(error.message);
  }
}

export async function loginUserHandler(req: Request | any, res: Response) {
  const response = await login(req.body);

  // Check for Invalid credentials
  if (response === "Invalid credentials")
    return res.status(401).send("Invalid credentials.");

  // Check if user exists
  if (!response) return res.status(404).send("User does not exist");

  // Check if user is already logged in so we can pass a message
  let msg = "";
  if (req.userActive)
    msg = "There is already an active session using your account";

  return res.json({
    username: response.username,
    token: response.token,
    msg: msg,
  });
}

export async function depositHandler(req: Request | any, res: Response) {
  try {
    const userId = req.user.user_id;

    // Check if user exists
    const user = await findUser(userId);
    if (!user) return res.status(404).send("Could not find user");

    // Check user role
    if (user.role === 1)
      return res.status(401).send(`You need to be a "buyer" role to deposit.`);

    // Check coin value
    if (!checkDepositCoin(req.body.deposit))
      return res
        .status(400)
        .send("Deposit coin can be only in values: 5, 10, 20, 50, 100");

    const addedDeposit = user.deposit + req.body.deposit;
    const payload = {
      userId: userId,
      deposit: addedDeposit,
    };

    const updatedUser = await addOrBuyOrResetDeposit(payload);
    return res.status(200).json(updatedUser);
  } catch (error: any) {
    logger.error(`Could not deposit: ${error}`);
    return res.status(500).send(error.message);
  }
}

export async function buyHandler(req: Request | any, res: Response) {
  try {
    const userId = req.user.user_id;

    // Check if user exists
    const user = await findUser(userId);
    if (!user) return res.status(404).send("Could not find user");

    // Check user role
    if (user.role === 1)
      return res.status(401).send(`You need to be a "buyer" role to buy.`);

    // Check if product exists
    const product = await findProduct(req.body.productId);
    if (!product) return res.status(404).send("Could not find product");

    // Check if there is enough products available
    if (req.body.amount > product.amountAvailable)
      return res.status(400).send("There are not enough availableAmount");

    // Check if user has enough money on the account to make the purchase
    const allCost = req.body.amount * product.cost;
    if (allCost > user.deposit)
      return res
        .status(400)
        .send("You don't have enough money on your deposit");

    // Update deposit in the "Buyer" user and get the change
    const depositState = user.deposit - allCost;
    const payload = {
      userId: userId,
      deposit: depositState,
    };
    const updatedUser = await addOrBuyOrResetDeposit(payload);
    const change = getChange(depositState);

    // Update product amount in the selected product
    const update = {
      productName: product.productName,
      cost: product.cost,
      amountAvailable: product.amountAvailable - req.body.amount,
    };
    const updatedProduct = await findAndUpdateProduct(
      { productId: product._id },
      update,
      {
        new: true,
      }
    );

    return res.status(200).json({
      totalSpent: allCost,
      product: updatedProduct,
      change: change,
    });
  } catch (error: any) {
    logger.error(`Could not buy: ${error}`);
    return res.status(500).send(error.message);
  }
}

export async function resetDepositHandler(req: Request | any, res: Response) {
  try {
    const userId = req.user.user_id;

    // Check if user exists
    const user = await findUser(userId);
    if (!user) return res.sendStatus(404);

    // Check user role
    if (user.role === 1)
      return res
        .status(401)
        .send(`You need to be a "buyer" role to reset deposit.`);

    const payload = {
      userId: userId,
      deposit: 0,
    };

    const updatedUser = await addOrBuyOrResetDeposit(payload);
    return res.status(200).json(updatedUser);
  } catch (error: any) {
    logger.error(`Could not deposit: ${error}`);
    return res.status(500).send(error.message);
  }
}
