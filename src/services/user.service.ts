import { omit } from "lodash";
import { DocumentDefinition } from "mongoose";
import User from "../models/user.model";
import { UserDocument } from "../types/interfaces";

export async function createUser(
  input: DocumentDefinition<
    Omit<UserDocument, "createdAt" | "updatedAt" | "comparePassword">
  >
) {
  try {
    const user = await User.create(input);
    return omit(user.toJSON(), "password");
  } catch (error: any) {
    throw new Error(error);
  }
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
