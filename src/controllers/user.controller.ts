import { Request, Response } from "express";

import {
  createUser,
  login,
  findAndUpdateUser,
  findUser,
  deleteUser,
  getAllUsers,
  addOrResetDeposit,
} from "../services/user.service";
import { CreateUserInput } from "../types/types";
import { checkDepositCoin } from "../utils/helpers";
import logger from "../utils/logger";

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput["body"]>,
  res: Response
) {
  try {
    const user = await createUser(req.body);
    return res.send(user);
  } catch (error: any) {
    logger.error(`Conflict on creating user: ${error}`);
    return res.status(409).send(error.message);
  }
}

export async function updateUserHandler(req: Request, res: Response) {
  try {
    const update = req.body;
    const userId = req.params.userId;
    const user = findUser(userId);
    if (!user) return res.sendStatus(404);
    const updatedUser = await findAndUpdateUser({ userId }, update, {
      new: true,
    });
    return res.send(updatedUser);
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
    const user = await findUser(userId);
    if (!user) return res.sendStatus(404);
    return res.send(user);
  } catch (error: any) {
    logger.error(`Could not get user: ${error}`);
    return res.status(409).send(error.message);
  }
}

export async function deleteUserHandler(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const user = await findUser(userId);
    if (!user) return res.sendStatus(404);
    await deleteUser(userId);
    return res.sendStatus(200);
  } catch (error: any) {
    logger.error(`Could not delete user: ${error}`);
    return res.status(409).send(error.message);
  }
}

export async function loginUserHandler(req: Request, res: Response) {
  try {
    const user = await login(req.body);
    return res.json({
      username: user.username,
      token: user.token,
    });
  } catch (error: any) {
    logger.error(`Could not log in: ${error}`);
    return res.status(401).send(error.message);
  }
}

export async function depositHandler(req: Request, res: Response) {
  try {
    const userId = req.user.user_id;
    const user = await findUser(userId);
    if (!user) return res.sendStatus(404);

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

    const updatedUser = await addOrResetDeposit(payload);
    return res.json(updatedUser);
  } catch (error: any) {
    logger.error(`Could not deposit: ${error}`);
    return res.status(500).send(error.message);
  }
}

export async function resetDepositHandler(req: Request, res: Response) {
  try {
    const userId = req.user.user_id;
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

    const updatedUser = await addOrResetDeposit(payload);
    return res.json(updatedUser);
  } catch (error: any) {
    logger.error(`Could not deposit: ${error}`);
    return res.status(500).send(error.message);
  }
}
