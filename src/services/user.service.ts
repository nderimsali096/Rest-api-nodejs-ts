import { omit } from "lodash";
import {
  DocumentDefinition,
  FilterQuery,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import jwt from "jsonwebtoken";
import config from "config";

import User from "../models/user.model";
import { UserDocument } from "../types/interfaces";

export async function createUser(
  input: DocumentDefinition<
    Omit<UserDocument, "token" | "createdAt" | "updatedAt" | "comparePassword">
  >
) {
  try {
    const user = await User.create(input);
    const secretKey = config.get<string>("secretKey");
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      secretKey,
      {
        expiresIn: "2h",
      }
    );
    user.token = token;
    return omit(user.toJSON(), "password");
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function getAllUsers() {
  return await User.find({}, "-password");
}

export async function findUser(
  userId: String,
  options: QueryOptions = { lean: true }
) {
  const user = await User.findOne({ _id: userId });
  if (!user) throw new Error("Could not find user");
  return omit(user, "password");
}

export async function findAndUpdateUser(
  query: FilterQuery<UserDocument>,
  update: UpdateQuery<
    Omit<UserDocument, "token" | "createdAt" | "updatedAt" | "comparePassword">
  >,
  options: QueryOptions
) {
  const user = await User.findOneAndUpdate(query, update, options);
  if (!user) throw new Error("Could not find user");
  return omit(user.toJSON(), "password");
}

export async function deleteUser(userId: string) {
  return User.deleteOne({ _id: userId });
}

export async function login(body: any) {
  const obj = {
    username: body.username,
    password: body.password,
  };
  const user = await validatePassword(obj);

  const secretKey = config.get<string>("secretKey");

  if (user) {
    const token = jwt.sign(
      { user_id: user._id, username: user.username },
      secretKey,
      {
        expiresIn: "2h",
      }
    );
    user.token = token;
    return user;
  }
  return "Invalid credentials";
}

export async function addOrBuyOrResetDeposit(payload: any) {
  return User.findOneAndUpdate(
    { _id: payload.userId },
    { $set: { deposit: payload.deposit } },
    { upsert: true, new: true }
  );
}

export async function validatePassword({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const user = await User.findOne({ username });
  if (!user) return false;

  const isValid = await user.comparePassword(password);
  if (!isValid) return false;

  return omit(user.toJSON(), "password");
}
